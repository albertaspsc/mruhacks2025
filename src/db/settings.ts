"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

// Simple schemas for validation
const parkingPreferencesSchema = z
  .object({
    parkingPreference: z.enum(["Yes", "No", "Not sure"] as const),
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
) {
  console.log("=== updateParkingPreferences called ===");
  console.log("Input data:", data);

  const supabase = await createClient();

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
export async function updateMarketingPreferences(sendEmails: boolean) {
  console.log("=== updateMarketingPreferences called ===");
  console.log("sendEmails:", sendEmails);

  const supabase = await createClient();

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

export async function updateUserNameOnly(user: {
  firstName: string;
  lastName: string;
}) {
  const supabase = await createClient();

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  try {
    const userId = auth.user.id;
    const currentTime = new Date().toISOString();

    console.log("Updating names for user:", userId);
    console.log("firstName:", user.firstName, "lastName:", user.lastName);

    const usersUpdate = await supabase
      .from("users")
      .update({
        f_name: user.firstName,
        l_name: user.lastName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    console.log("Users update result:", usersUpdate);

    if (usersUpdate.error) {
      console.error("Users table update failed:", usersUpdate.error);
      return { error: usersUpdate.error };
    }

    console.log("Users table updated successfully");
    return { success: true };
  } catch (error) {
    console.error("updateUserNameOnly exception:", error);
    return { error: `Exception: ${error}` };
  }
}

export async function updateUserNameAndEmail(user: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  console.log("=== updateUserNameAndEmail called ===");
  console.log("Input user data:", user);

  const supabase = await createClient();

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

    // Update users table only (single source of truth)
    const result = await supabase
      .from("users")
      .update(usersUpdate)
      .eq("id", userId);

    if (result.error) {
      return { error: result.error };
    }

    return { success: true };
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
