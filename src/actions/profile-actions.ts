"use server";

import { createClient } from "@/utils/supabase/server";
import * as UserRegistrationDAL from "@/dal/user-registration";
import { ProfileUpdateInput, UserRegistration } from "@/types/registration";
import { revalidatePath } from "next/cache";

/**
 * Updates data in the users database table with flexible options for different update scenarios.
 *
 * This is the main server action for all profile updates, consolidating functionality
 * that was previously split across multiple actions. It handles both single field
 * and multiple field updates with optional validation and cache management.
 *
 * @param updates - The profile fields to update. All fields are optional.
 * @param options - Optional configuration for update behavior
 * @param options.validateEmail - When true, email updates trigger verification flow:
 *   - Calls updateUserEmailAction to send verification email
 *   - Stores pending email in database for tracking
 *   - Handles rate limiting and duplicate email errors
 *   - Email is not directly updated until verification is complete
 *   - When false, email is updated directly in the database
 * @param options.syncProfile - When true, performs additional cache revalidation:
 *   - Always revalidates /user/profile page cache
 *   - Additionally revalidates /user/dashboard page cache
 *   - Use when profile changes should be reflected across multiple pages
 *   - Use sparingly for performance - only when dashboard needs fresh data
 *   - Consider user flow: if users stay on profile page after updates, false is fine
 *
 * @returns Promise<ServiceResult<UserRegistration>> - Success/error result with updated user data
 *
 * @example
 * // Simple profile update
 * await updateUserProfileAction({ firstName: "John" });
 *
 * @example
 * // Email update with verification
 * await updateUserProfileAction(
 *   { email: "newemail@example.com" },
 *   { validateEmail: true }
 * );
 *
 * @example
 * // Bulk update with dashboard sync
 * await updateUserProfileAction(
 *   { firstName: "John", lastName: "Doe", university: 1 },
 *   { syncProfile: true }
 * );
 *
 * @example
 * // Email change with verification and dashboard sync
 * await updateUserProfileAction(
 *   { email: "newemail@example.com" },
 *   { validateEmail: true, syncProfile: true }
 * );
 */
export async function updateUserProfileAction(
  updates: ProfileUpdateInput,
  options?: { validateEmail?: boolean; syncProfile?: boolean },
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

    const existingUser = await UserRegistrationDAL.getUserById(auth.user.id);
    if (!existingUser.success || !existingUser.data) {
      return { success: false, error: "User not found" };
    }

    const updateData: Partial<UserRegistration> = {};

    // Handle email update with validation if requested
    if (updates.email !== undefined && options?.validateEmail) {
      const emailResult = await updateUserEmailAction(updates.email);
      if (!emailResult.success) {
        return {
          success: false,
          error: emailResult.error,
        };
      }
      // Don't update email in the database here - it will be updated after verification
    } else if (updates.email !== undefined) {
      // Direct email update without validation
      updateData.email = updates.email;
    }

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

    // Additional revalidation based on options
    if (options?.syncProfile) {
      revalidatePath("/user/dashboard");
    }

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

// Server action for email verification
export async function updateUserEmailAction(newEmail: string) {
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

    // Update email in Supabase auth (this sends verification email)
    const { error: emailUpdateError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (emailUpdateError) {
      console.error("Supabase auth email update error:", emailUpdateError);

      if (emailUpdateError.message.includes("rate limit")) {
        return {
          success: false,
          error: "Too many requests. Please wait a moment before trying again.",
        };
      }

      if (emailUpdateError.message.includes("already registered")) {
        return {
          success: false,
          error: "This email is already associated with another account.",
        };
      }

      return {
        success: false,
        error: emailUpdateError.message || "Failed to update email",
      };
    }

    // Store pending email in our database for tracking
    try {
      const { error: pendingEmailError } = await supabase
        .from("users")
        .update({
          pending_email: newEmail,
          email_change_requested_at: new Date().toISOString(),
        })
        .eq("id", auth.user.id);

      if (pendingEmailError) {
        console.error("Failed to store pending email:", pendingEmailError);
        // Don't fail the whole operation if pending email storage fails
      }
    } catch (pendingEmailError) {
      console.error(
        "Exception while storing pending email:",
        pendingEmailError,
      );
      // Don't fail the whole operation if pending email storage fails
    }

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Email update error:", error);
    return {
      success: false,
      error: "Failed to update email",
    };
  }
}

// Convenience function for updating a single field
export async function updateProfileFieldAction(
  field: keyof ProfileUpdateInput,
  value: any,
  options?: { validateEmail?: boolean; syncProfile?: boolean },
) {
  const updates = { [field]: value } as ProfileUpdateInput;
  return await updateUserProfileAction(updates, options);
}

// Convenience function for bulk updates (maintains backward compatibility)
export async function bulkUpdateProfileAction(
  updates: ProfileUpdateInput,
  options?: { validateEmail?: boolean; syncProfile?: boolean },
) {
  return await updateUserProfileAction(updates, options);
}
