"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { settingsRepository } from "@/dal/settingsRepository";
import { z } from "zod";

// Simple schemas for validation
const parkingPreferencesSchema = z
  .object({
    parkingPreference: z.enum(["Yes", "No", "Not sure"]),
    licensePlate: z.string().optional(),
  })
  .refine(
    (data) =>
      data.parkingPreference !== "Yes" ||
      (data.licensePlate && data.licensePlate.trim() !== ""),
    {
      message: "License plate is required when parking preference is 'Yes'",
      path: ["licensePlate"],
    },
  );

const userNameAndEmailSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
  })
  .partial();

// PARKING PREFERENCES FUNCTIONS
export async function updateParkingPreferences(
  data: z.infer<typeof parkingPreferencesSchema>,
  supabase?: SupabaseClient,
) {
  console.log("=== updateParkingPreferences called ===");
  console.log("Input data:", data);

  // Validate input
  const validation = parkingPreferencesSchema.safeParse(data);
  if (!validation.success) {
    console.error("Validation error:", validation.error);
    return { error: validation.error };
  }

  try {
    if (!supabase) {
      supabase = await createClient();
    }

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError };
    }

    const userId = auth.user.id;

    // Delegate DB work to repository (keeps public API same)
    await settingsRepository.updateParkingPreferences(userId, {
      parkingPreference: data.parkingPreference,
      licensePlate: data.licensePlate,
    } as any);

    // Sync profile (still uses supabase client)
    const syncResult = await syncUserToProfile(
      { parking: data.parkingPreference },
      supabase,
    );
    if (syncResult.error) {
      console.warn(
        "Parking preference updated in users table but failed to sync to profile",
      );
    }

    return { success: true };
  } catch (error) {
    console.error("updateParkingPreferences exception:", error);
    return { error: "Failed to update parking preferences" };
  }
}

export async function getParkingPreference(supabase?: SupabaseClient) {
  console.log("=== getParkingPreference called ===");

  try {
    if (!supabase) {
      supabase = await createClient();
    }

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError };
    }

    const userId = auth.user.id;

    const prefs = await settingsRepository.getParkingPreferences(
      userId as string,
    );

    return {
      data: {
        parking: (prefs as any).parkingPreference || "Not sure",
        licensePlate: (prefs as any).licensePlate || "",
      },
    };
  } catch (error) {
    console.error("getParkingPreference error:", error);
    return { error: "Failed to get parking preference" };
  }
}

// MARKETING PREFERENCES FUNCTIONS
export async function updateMarketingPreferences(
  sendEmails: boolean,
  supabase?: SupabaseClient,
) {
  console.log("=== updateMarketingPreferences called ===");
  console.log("sendEmails:", sendEmails);

  try {
    if (!supabase) {
      supabase = await createClient();
    }

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError };
    }

    const userId = auth.user.id;

    await settingsRepository.updateMarketingPreferences(userId, {
      sendEmails,
    } as any);

    return { success: true };
  } catch (error) {
    console.error("updateMarketingPreferences exception:", error);
    return { error: "Failed to update marketing preferences" };
  }
}

export async function getMarketingPreference(supabase?: SupabaseClient) {
  console.log("=== getMarketingPreference called ===");

  try {
    if (!supabase) {
      supabase = await createClient();
    }

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError };
    }

    const userId = auth.user.id;

    const prefs = await settingsRepository.getMarketingPreferences(
      userId as string,
    );

    return { data: { sendEmails: (prefs as any).sendEmails } };
  } catch (error) {
    console.error("getMarketingPreference exception:", error);
    return { error: "Failed to get marketing preference" };
  }
}

// USER PROFILE FUNCTIONS
export async function syncUserToProfile(
  userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    parking?: string;
  },
  supabase?: SupabaseClient,
) {
  console.log("=== syncUserToProfile called ===");
  console.log("Input data:", userData);

  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Auth error:", authError);
    return { error: authError };
  }

  try {
    const userId = auth.user.id;
    const currentTime = new Date().toISOString();

    // Get current user data from users table
    const { data: currentUserData, error: getUserError } = await supabase
      .from("users")
      .select("f_name, l_name, email, parking")
      .eq("id", userId)
      .single();

    if (getUserError) {
      console.error("Error getting user data:", getUserError);
      console.error("getUserError details:", {
        code: getUserError.code,
        message: getUserError.message,
        details: getUserError.details,
        hint: getUserError.hint,
      });
      return { error: getUserError };
    }

    if (!currentUserData) {
      console.error("No user data found for user ID:", userId);
      return { error: "User data not found" };
    }

    console.log("Current user data:", currentUserData);

    // Prepare profile data using current data + any updates
    const profileData = {
      id: userId,
      f_name: userData.firstName || currentUserData.f_name,
      l_name: userData.lastName || currentUserData.l_name,
      email: userData.email || currentUserData.email,
    };

    console.log("Profile data to upsert:", profileData);

    if (!profileData.email) {
      return { error: "Email is required for profile creation" };
    }

    // Ensure f_name and l_name are not null for profile creation
    if (!profileData.f_name || !profileData.l_name) {
      console.error("Missing required fields for profile:", {
        f_name: profileData.f_name,
        l_name: profileData.l_name,
      });
      return {
        error: "First name and last name are required for profile creation",
      };
    }

    // Upsert the profile record
    const { error: profileError } = await supabase
      .from("profile")
      .upsert(profileData);

    if (profileError) {
      console.error("Profile upsert error:", profileError);

      console.error("profileError details:", {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      });

      return { error: profileError };
    }

    console.log("Profile synced successfully");
    return { success: true };
  } catch (error) {
    console.error("syncUserToProfile exception:", error);
    return { error: "Failed to sync user to profile" };
  }
}

export async function updateUserNameOnly(
  user: { firstName: string; lastName: string },
  supabase?: SupabaseClient,
) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  try {
    const userId = auth.user.id;
    const currentTime = new Date().toISOString();

    console.log("Updating names for user:", userId);
    console.log("firstName:", user.firstName, "lastName:", user.lastName);

    const [usersUpdate, profileUpdate] = await Promise.allSettled([
      supabase
        .from("users")
        .update({
          f_name: user.firstName,
          l_name: user.lastName,
        })
        .eq("id", userId),

      // Profile table
      supabase
        .from("profile")
        .update({
          f_name: user.firstName,
          l_name: user.lastName,
        })
        .eq("id", userId),
    ]);

    console.log("Users update result:", usersUpdate);
    console.log("Profile update result:", profileUpdate);

    const usersSuccess =
      usersUpdate.status === "fulfilled" && !usersUpdate.value.error;

    if (usersSuccess) {
      console.log("Users table updated successfully");
      return { success: true };
    } else {
      console.error("Users table update failed:", usersUpdate);
      return {
        error:
          usersUpdate.status === "fulfilled"
            ? usersUpdate.value.error
            : usersUpdate.reason,
      };
    }
  } catch (error) {
    console.error("updateUserNameOnly exception:", error);
    return { error: `Exception: ${error}` };
  }
}

export async function updateUserNameAndEmail(
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
  },
  supabase?: SupabaseClient,
) {
  console.log("=== updateUserNameAndEmail called ===");
  console.log("Input user data:", user);

  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Auth error:", authError);
    return { error: authError };
  }

  const validation = userNameAndEmailSchema.safeParse(user);
  if (!validation.success) {
    console.error("Validation error:", validation.error);
    return { error: validation.error };
  }

  try {
    const userId = auth.user.id;
    const currentTime = new Date().toISOString();

    // Prepare update objects
    const usersUpdate: any = {};
    const profileUpdate: any = {};

    if (user.firstName !== undefined) {
      usersUpdate.f_name = user.firstName;
      profileUpdate.f_name = user.firstName;
    }

    if (user.lastName !== undefined) {
      usersUpdate.l_name = user.lastName;
      profileUpdate.l_name = user.lastName;
    }

    // For email: store as pending in public tables
    if (user.email !== undefined) {
      usersUpdate.pending_email = user.email;
      usersUpdate.email_change_requested_at = currentTime;
      // Note: Profile table doesn't have pending_email or email_change_requested_at columns
    }

    const updatePromises = [
      supabase.from("users").update(usersUpdate).eq("id", userId),
      supabase.from("profile").update(profileUpdate).eq("id", userId),
    ];

    const results = await Promise.allSettled(updatePromises);

    const usersSuccess =
      results[0].status === "fulfilled" && !results[0].value.error;

    if (usersSuccess) {
      return { success: true };
    } else {
      const firstError =
        results[0].status === "fulfilled"
          ? results[0].value.error
          : results[0].reason;
      return { error: firstError };
    }
  } catch (error) {
    console.error("updateUserNameAndEmail exception:", error);
    return { error: `Exception: ${error}` };
  }
}

// UTILITY FUNCTIONS
export async function enableMarketingForNewUser(supabase?: SupabaseClient) {
  console.log("=== enableMarketingForNewUser called ===");

  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Auth error:", authError);
    return { error: authError };
  }

  try {
    const userId = auth.user.id;
    console.log("Enabling marketing emails for new user:", userId);

    const { error } = await supabase.from("mktg_preferences").upsert({
      id: userId,
      send_emails: true,
    });

    if (error) {
      console.error("Failed to enable marketing for new user:", error);
      return { error };
    }

    console.log("Marketing emails enabled for new user");
    return { success: true };
  } catch (error) {
    console.error("enableMarketingForNewUser exception:", error);
    return { error: "Failed to enable marketing for new user" };
  }
}

export async function deleteUserProfile(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const userId = auth.user.id;

  try {
    console.log("Deleting user data for:", userId);

    // Delete from all related tables first
    const deletions = await Promise.allSettled([
      supabase.from("mktg_preferences").delete().eq("id", userId),
      supabase.from("parking_info").delete().eq("id", userId),
      supabase.from("user_interests").delete().eq("user_id", userId),
      supabase.from("user_diet_restrictions").delete().eq("user_id", userId),
      supabase.from("parking_info").delete().eq("id", userId),
      supabase.from("admins").delete().eq("id", userId),
      supabase.from("profile").delete().eq("id", userId),
    ]);

    console.log("Deleted from child tables");

    // Delete from users table last
    const { error: userDeleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (userDeleteError) {
      return { error: userDeleteError };
    }

    console.log("Deleted from users table");
    return { success: true };
  } catch (error) {
    console.error("Database deletion error:", error);
    return { error: `Database deletion failed: ${error}` };
  }
}
