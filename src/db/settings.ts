"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
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

  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Auth error:", authError);
    return { error: authError };
  }

  const validation = parkingPreferencesSchema.safeParse(data);
  if (!validation.success) {
    console.error("Validation error:", validation.error);
    return { error: validation.error };
  }

  try {
    const userId = auth.user.id;
    const currentTime = new Date().toISOString();

    // Update users table with parking preference
    const { error: usersError } = await supabase
      .from("users")
      .update({
        parking: data.parkingPreference,
        updated_at: currentTime,
      })
      .eq("id", userId);

    if (usersError) {
      console.error("Users table update failed:", usersError);
      return { error: usersError };
    }

    console.log("Users table updated successfully");

    // Sync to profile table using the helper function
    const syncResult = await syncUserToProfile(
      { parking: data.parkingPreference },
      supabase,
    );

    if (syncResult.error) {
      console.error("Profile sync failed:", syncResult.error);
      console.warn(
        "Parking preference updated in users table but failed to sync to profile",
      );
    } else {
      console.log("Parking preference synced to profile table successfully");
    }

    // Handle license plate in parking_info table
    if (data.parkingPreference === "Yes" && data.licensePlate) {
      console.log(
        "Updating license plate in parking_info table:",
        data.licensePlate,
      );

      const { error: licenseError } = await supabase
        .from("parking_info")
        .upsert({
          id: userId,
          license_plate: data.licensePlate,
        });

      if (licenseError) {
        console.error("License plate update failed:", licenseError);
        return { error: licenseError };
      } else {
        console.log("License plate updated successfully in parking_info table");
      }
    } else if (data.parkingPreference !== "Yes") {
      // Delete the parking_info record if parking is not "Yes"
      const { error: deleteParkingError } = await supabase
        .from("parking_info")
        .delete()
        .eq("id", userId);

      if (deleteParkingError) {
        console.error("Failed to delete parking info:", deleteParkingError);
        // Don't return error here as this might be expected if no record exists
      } else {
        console.log("Parking info record deleted successfully");
      }
    }

    return { success: true };
  } catch (error) {
    console.error("updateParkingPreferences exception:", error);
    return { error: "Failed to update parking preferences" };
  }
}

export async function getParkingPreference(supabase?: SupabaseClient) {
  console.log("=== getParkingPreference called ===");

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
    console.log("Getting parking preferences for user:", userId);

    // Get parking preference from users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("parking")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching parking preference from users:", userError);
      return { error: userError };
    }

    // Get license plate from parking_info table
    let licensePlate = "";
    try {
      const { data: parkingData, error: parkingError } = await supabase
        .from("parking_info")
        .select("license_plate")
        .eq("id", userId)
        .single();

      if (parkingError && parkingError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected for users without parking info
        console.error("Error fetching license plate:", parkingError);
      } else if (parkingData) {
        licensePlate = parkingData.license_plate || "";
      }
    } catch (error) {
      console.log("No license plate found in parking_info table");
    }

    console.log("Retrieved parking preference:", userData.parking);
    console.log("Retrieved license plate:", licensePlate);

    return {
      data: {
        parking: userData.parking || "Not sure",
        licensePlate: licensePlate,
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
    console.log("Updating marketing preferences for user:", userId);

    const { error } = await supabase.from("mktg_preferences").upsert({
      id: userId,
      send_emails: sendEmails,
    });

    if (error) {
      console.error("Marketing preferences update error:", error);
      return { error };
    }

    console.log("Marketing preferences updated successfully");
    return { success: true };
  } catch (error) {
    console.error("updateMarketingPreferences exception:", error);
    return { error: "Failed to update marketing preferences" };
  }
}

export async function getMarketingPreference(supabase?: SupabaseClient) {
  console.log("=== getMarketingPreference called ===");

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
    console.log("Getting marketing preferences for user:", userId);

    const { data, error } = await supabase
      .from("mktg_preferences")
      .select("send_emails")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Marketing preferences fetch error:", error);
      return { error };
    }

    // If no record exists (PGRST116 error), create one with default true
    if (error && error.code === "PGRST116") {
      console.log(
        "No marketing preference record found, creating default (true)",
      );

      const { error: createError } = await supabase
        .from("mktg_preferences")
        .insert({
          id: userId,
          send_emails: true, // Default to true
        });

      if (createError) {
        console.error(
          "Failed to create default marketing preference:",
          createError,
        );
        return { error: createError };
      }

      return { data: { sendEmails: true } };
    }

    console.log("Marketing preferences retrieved:", data);
    return { data: { sendEmails: data?.send_emails ?? true } };
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

    // Get current user data from user_profiles
    const { data: currentUserData, error: getUserError } = await supabase
      .from("user_profiles")
      .select("f_name, l_name, email, parking")
      .eq("id", userId)
      .single();

    if (getUserError) {
      console.error("Error getting user data:", getUserError);
      return { error: getUserError };
    }

    console.log("Current user data:", currentUserData);

    // Prepare profile data using current data + any updates
    const profileData: any = {
      id: userId,
      first_name: userData.firstName || currentUserData.f_name,
      last_name: userData.lastName || currentUserData.l_name,
      email: userData.email || currentUserData.email,
      parking: userData.parking || currentUserData.parking,
      updated_at: currentTime,
    };

    console.log("Profile data to upsert:", profileData);

    if (!profileData.email) {
      return { error: "Email is required for profile creation" };
    }

    // Upsert the profile record (columns: id, email, f_name, l_name)
    const { error: profileError } = await supabase
      .from("profile")
      .upsert(profileData);

    if (profileError) {
      console.error("Profile upsert error:", profileError);
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
          updated_at: currentTime,
        })
        .eq("id", userId),

      // Profile table
      supabase
        .from("profile")
        .update({
          first_name: user.firstName,
          last_name: user.lastName,
          updated_at: currentTime,
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
    const usersUpdate: any = { updated_at: currentTime };
    const profileUpdate: any = { updated_at: currentTime };

    if (user.firstName !== undefined) {
      usersUpdate.f_name = user.firstName;
      profileUpdate.first_name = user.firstName;
    }

    if (user.lastName !== undefined) {
      usersUpdate.l_name = user.lastName;
      profileUpdate.last_name = user.lastName;
    }

    // For email: store as pending in public tables
    if (user.email !== undefined) {
      usersUpdate.pending_email = user.email;
      usersUpdate.email_change_requested_at = currentTime;

      profileUpdate.pending_email = user.email;
      profileUpdate.email_change_requested_at = currentTime;
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
