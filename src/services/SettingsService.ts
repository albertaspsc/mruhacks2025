"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { settingsRepository } from "@/dal/settingsRepository";
import { parkingEnum } from "@/db/schema";

// Validation schemas
const parkingPreferencesSchema = z
  .object({
    parkingPreference: z.enum(parkingEnum.enumValues),
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

async function updateParkingPreferences(
  data: z.infer<typeof parkingPreferencesSchema>,
  supabase?: SupabaseClient,
) {
  const validation = parkingPreferencesSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error };
  }

  try {
    if (!supabase) supabase = await createClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) return { error: authError };

    const userId = auth.user.id;

    await settingsRepository.updateParkingPreferences(userId, {
      parkingPreference: data.parkingPreference,
      licensePlate: data.licensePlate,
    } as any);

    const syncResult = await syncUserToProfile(
      { parking: data.parkingPreference },
      supabase,
    );

    if (syncResult.error) {
      // Do not fail the primary operation if profile sync fails
      console.warn(
        "Profile sync failed after parking update",
        syncResult.error,
      );
    }

    return { success: true };
  } catch (error) {
    console.error("SettingsService.updateParkingPreferences error:", error);
    return { error: "Failed to update parking preferences" };
  }
}

async function getParkingPreference(supabase?: SupabaseClient) {
  try {
    if (!supabase) supabase = await createClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) return { error: authError };

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
    console.error("SettingsService.getParkingPreference error:", error);
    return { error: "Failed to get parking preference" };
  }
}

async function updateMarketingPreferences(
  sendEmails: boolean,
  supabase?: SupabaseClient,
) {
  try {
    if (!supabase) supabase = await createClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) return { error: authError };

    const userId = auth.user.id;
    await settingsRepository.updateMarketingPreferences(userId, {
      sendEmails,
    } as any);

    return { success: true };
  } catch (error) {
    console.error("SettingsService.updateMarketingPreferences error:", error);
    return { error: "Failed to update marketing preferences" };
  }
}

async function getMarketingPreference(supabase?: SupabaseClient) {
  try {
    if (!supabase) supabase = await createClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) return { error: authError };

    const userId = auth.user.id;
    const prefs = await settingsRepository.getMarketingPreferences(
      userId as string,
    );

    return { data: { sendEmails: (prefs as any).sendEmails } };
  } catch (error) {
    console.error("SettingsService.getMarketingPreference error:", error);
    return { error: "Failed to get marketing preference" };
  }
}

async function syncUserToProfile(
  userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    parking?: string;
  },
  supabase?: SupabaseClient,
) {
  try {
    if (!supabase) supabase = await createClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) return { error: authError };

    const userId = auth.user.id;

    const { data: currentUserData, error: getUserError } = await supabase
      .from("users")
      .select("f_name, l_name, email, parking")
      .eq("id", userId)
      .single();

    if (getUserError) return { error: getUserError };
    if (!currentUserData) return { error: "User data not found" };

    const profileData = {
      id: userId,
      f_name: userData.firstName || currentUserData.f_name,
      l_name: userData.lastName || currentUserData.l_name,
      email: userData.email || currentUserData.email,
    };

    if (!profileData.email)
      return { error: "Email is required for profile creation" };
    if (!profileData.f_name || !profileData.l_name) {
      return {
        error: "First name and last name are required for profile creation",
      };
    }

    const { error: profileError } = await supabase
      .from("profile")
      .upsert(profileData);
    if (profileError) return { error: profileError };

    return { success: true };
  } catch (error) {
    console.error("SettingsService.syncUserToProfile error:", error);
    return { error: "Failed to sync user to profile" };
  }
}

async function updateUserNameOnly(
  user: { firstName: string; lastName: string },
  supabase?: SupabaseClient,
) {
  try {
    if (!supabase) supabase = await createClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) return { error: authError };

    const userId = auth.user.id;

    const [usersUpdate, profileUpdate] = await Promise.allSettled([
      supabase
        .from("users")
        .update({ f_name: user.firstName, l_name: user.lastName })
        .eq("id", userId),
      supabase
        .from("profile")
        .update({ f_name: user.firstName, l_name: user.lastName })
        .eq("id", userId),
    ]);

    const usersSuccess =
      usersUpdate.status === "fulfilled" && !usersUpdate.value.error;
    if (usersSuccess) return { success: true };

    return {
      error:
        usersUpdate.status === "fulfilled"
          ? usersUpdate.value.error
          : usersUpdate.reason,
    };
  } catch (error) {
    console.error("SettingsService.updateUserNameOnly error:", error);
    return { error: `Exception: ${error}` };
  }
}

async function updateUserNameAndEmail(
  user: { firstName?: string; lastName?: string; email?: string },
  supabase?: SupabaseClient,
) {
  try {
    if (!supabase) supabase = await createClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) return { error: authError };

    const validation = userNameAndEmailSchema.safeParse(user);
    if (!validation.success) return { error: validation.error };

    const userId = auth.user.id;
    const currentTime = new Date().toISOString();

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
    if (user.email !== undefined) {
      usersUpdate.pending_email = user.email;
      usersUpdate.email_change_requested_at = currentTime;
    }

    const updatePromises = [
      supabase.from("users").update(usersUpdate).eq("id", userId),
      supabase.from("profile").update(profileUpdate).eq("id", userId),
    ];

    const results = await Promise.allSettled(updatePromises);
    const usersSuccess =
      results[0].status === "fulfilled" && !results[0].value.error;

    if (usersSuccess) return { success: true };

    const firstError =
      results[0].status === "fulfilled"
        ? results[0].value.error
        : results[0].reason;
    return { error: firstError };
  } catch (error) {
    console.error("SettingsService.updateUserNameAndEmail error:", error);
    return { error: `Exception: ${error}` };
  }
}

// Optional utility methods
async function enableMarketingForNewUser(supabase?: SupabaseClient) {
  try {
    if (!supabase) supabase = await createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) return { error: authError };
    const userId = auth.user.id;
    await settingsRepository.updateMarketingPreferences(userId, {
      sendEmails: true,
    } as any);
    return { success: true };
  } catch (error) {
    console.error("SettingsService.enableMarketingForNewUser error:", error);
    return { error };
  }
}

async function deleteUserProfile(supabase?: SupabaseClient) {
  try {
    if (!supabase) supabase = await createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) return { error: authError };
    const userId = auth.user.id;

    const deletions = await Promise.allSettled([
      supabase.from("mktg_preferences").delete().eq("id", userId),
      supabase.from("parking_info").delete().eq("id", userId),
      supabase.from("user_interests").delete().eq("user_id", userId),
      supabase.from("user_diet_restrictions").delete().eq("user_id", userId),
      supabase.from("admins").delete().eq("id", userId),
      supabase.from("profile").delete().eq("id", userId),
    ]);

    const { error: userDeleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);
    if (userDeleteError) return { error: userDeleteError };
    return { success: true };
  } catch (error) {
    console.error("SettingsService.deleteUserProfile error:", error);
    return { error };
  }
}

export {
  updateParkingPreferences,
  getParkingPreference,
  updateMarketingPreferences,
  getMarketingPreference,
  syncUserToProfile,
  updateUserNameOnly,
  updateUserNameAndEmail,
  enableMarketingForNewUser,
  deleteUserProfile,
};
