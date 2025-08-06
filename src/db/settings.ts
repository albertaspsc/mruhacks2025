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
    f_name: z.string().min(1).optional(),
    l_name: z.string().min(1).optional(),
    email: z.string().email().optional(),
  })
  .partial();

// Update parking preferences
export async function updateParkingPreferences(
  data: z.infer<typeof parkingPreferencesSchema>,
  supabase?: SupabaseClient,
) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const validation = parkingPreferencesSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error };
  }

  try {
    // Update parking preference in users table
    const { error: updateError } = await supabase
      .from("users")
      .update({ parking: data.parkingPreference })
      .eq("id", auth.user.id);

    if (updateError) {
      return { error: updateError };
    }

    // Update license plate if provided and parking is "Yes"
    if (data.parkingPreference === "Yes" && data.licensePlate) {
      const { error: parkingError } = await supabase
        .from("parking_info")
        .upsert({
          id: auth.user.id,
          license_plate: data.licensePlate,
        });

      if (parkingError) {
        return { error: parkingError };
      }
    }

    return { success: true };
  } catch (error) {
    return { error: "Failed to update parking preferences" };
  }
}

// Update marketing preferences
export async function updateMarketingPreferences(
  sendEmails: boolean,
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
    const { error } = await supabase.from("marketing_preferences").upsert({
      id: auth.user.id,
      send_emails: sendEmails,
    });

    if (error) {
      return { error };
    }

    return { success: true };
  } catch (error) {
    return { error: "Failed to update marketing preferences" };
  }
}

// Update user name and email
export async function updateUserNameAndEmail(
  user: { f_name?: string; l_name?: string; email?: string },
  supabase?: SupabaseClient,
) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const validation = userNameAndEmailSchema.safeParse(user);
  if (!validation.success) {
    return { error: validation.error };
  }

  try {
    const { error: updateError } = await supabase
      .from("users")
      .update(validation.data)
      .eq("id", auth.user.id);

    if (updateError) {
      return { error: updateError };
    }

    return { success: true };
  } catch (error) {
    return { error: "Failed to update user profile" };
  }
}

// Get marketing preference
export async function getMarketingPreference(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  try {
    const { data, error } = await supabase
      .from("marketing_preferences")
      .select("send_emails")
      .eq("id", auth.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return { error };
    }

    return { data: { sendEmails: data?.send_emails || false } };
  } catch (error) {
    return { error: "Failed to get marketing preference" };
  }
}

// Get parking preference
export async function getParkingPreference(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  try {
    // Get user parking preference
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("parking")
      .eq("id", auth.user.id)
      .single();

    if (userError) {
      return { error: userError };
    }

    // Get license plate if exists
    const { data: parkingData } = await supabase
      .from("parking_info")
      .select("license_plate")
      .eq("id", auth.user.id)
      .single();

    return {
      data: {
        parking: userData.parking || "Not sure",
        licensePlate: parkingData?.license_plate || "",
      },
    };
  } catch (error) {
    return { error: "Failed to get parking preference" };
  }
}

// Delete user profile
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

    // Delete from all related tables first (foreign key constraints)
    const deletions = await Promise.allSettled([
      supabase.from("marketing_preferences").delete().eq("id", userId),
      supabase.from("parking_info").delete().eq("id", userId),
      supabase.from("user_interests").delete().eq("user_id", userId),
      supabase.from("user_diet_restrictions").delete().eq("user_id", userId),
      supabase.from("admins").delete().eq("id", userId),
      supabase.from("profiles").delete().eq("id", userId),
    ]);

    console.log("Deleted from child tables");

    // Delete from users table last (parent table)
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
