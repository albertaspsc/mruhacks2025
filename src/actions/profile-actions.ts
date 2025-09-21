"use server";

import { createClient } from "@/utils/supabase/server";
import * as UserRegistrationDAL from "@/dal/user-registration";
import { ProfileUpdateInput, UserRegistration } from "@/types/registration";
import { revalidatePath } from "next/cache";

// Server action for updating user profile
export async function updateUserProfileAction(updates: ProfileUpdateInput) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const existingUser = await UserRegistrationDAL.getUserById(auth.user.id);
    if (!existingUser.success || !existingUser.data) {
      return { success: false, error: "User not found" };
    }

    const updateData: Partial<UserRegistration> = {};

    // Handle basic fields
    if (updates.firstName !== undefined) updateData.f_name = updates.firstName;
    if (updates.lastName !== undefined) updateData.l_name = updates.lastName;
    if (updates.accommodations !== undefined)
      updateData.accommodations = updates.accommodations;
    if (updates.resume !== undefined) updateData.resume_url = updates.resume;
    if (updates.parking !== undefined) updateData.parking = updates.parking;
    if (updates.yearOfStudy !== undefined)
      updateData.yearOfStudy = updates.yearOfStudy;
    if (updates.previousAttendance !== undefined)
      updateData.prev_attendance = updates.previousAttendance;

    // Handle ID fields
    if (updates.gender !== undefined) {
      updateData.gender = updates.gender;
    }

    if (updates.university !== undefined) {
      updateData.university = updates.university;
    }

    if (updates.major !== undefined) {
      updateData.major = updates.major;
    }

    if (updates.experience !== undefined) {
      updateData.experience = updates.experience;
    }

    if (updates.marketing !== undefined) {
      updateData.marketing = updates.marketing;
    }

    // Update user record and related data in a single transaction
    const updateResult = await UserRegistrationDAL.updateUser(
      auth.user.id,
      updateData,
    );
    if (!updateResult.success) {
      return { success: false, error: updateResult.error };
    }

    // Handle interests and dietary restrictions - updates now contains IDs directly
    const interestPromise =
      updates.interests !== undefined
        ? UserRegistrationDAL.setUserInterests(auth.user.id, updates.interests)
        : Promise.resolve({ success: true });

    const dietaryPromise =
      updates.dietaryRestrictions !== undefined
        ? UserRegistrationDAL.setUserDietaryRestrictions(
            auth.user.id,
            updates.dietaryRestrictions,
          )
        : Promise.resolve({ success: true });

    // Execute both operations in parallel
    const [interestResult, dietaryResult] = await Promise.all([
      interestPromise,
      dietaryPromise,
    ]);

    if (!interestResult.success) {
      return {
        success: false,
        error: (interestResult as any).error || "Failed to update interests",
      };
    }

    if (!dietaryResult.success) {
      return {
        success: false,
        error:
          (dietaryResult as any).error ||
          "Failed to update dietary restrictions",
      };
    }

    // Revalidate the user profile page
    revalidatePath("/user/profile");

    return {
      success: true,
      data: updateResult.data!,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}

// Server action for getting user profile data
export async function getUserProfileAction() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Get user with related data
    const [userResult, interestsResult, dietaryRestrictionsResult] =
      await Promise.all([
        UserRegistrationDAL.getUserById(auth.user.id),
        UserRegistrationDAL.getUserInterests(auth.user.id),
        UserRegistrationDAL.getUserDietaryRestrictions(auth.user.id),
      ]);

    if (!userResult.success || !userResult.data) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      data: {
        user: userResult.data,
        interests: interestsResult.success ? interestsResult.data! : [],
        dietaryRestrictions: dietaryRestrictionsResult.success
          ? dietaryRestrictionsResult.data!
          : [],
      },
    };
  } catch (error) {
    console.error("Get profile error:", error);
    return {
      success: false,
      error: "Failed to get profile data",
    };
  }
}

// Server action for updating specific profile fields
export async function updateProfileFieldAction(
  field: keyof ProfileUpdateInput,
  value: any,
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Update specific field
    const updates = { [field]: value } as ProfileUpdateInput;
    const result = await updateUserProfileAction(updates);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data,
      message: `${field} updated successfully`,
    };
  } catch (error) {
    console.error("Update field error:", error);
    return {
      success: false,
      error: `Failed to update ${field}`,
    };
  }
}

// Server action for bulk profile update
export async function bulkUpdateProfileAction(updates: ProfileUpdateInput) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Update multiple fields
    const result = await updateUserProfileAction(updates);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Bulk update error:", error);
    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}
