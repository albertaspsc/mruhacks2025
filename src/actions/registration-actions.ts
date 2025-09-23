/**
 * @fileoverview Registration Actions
 *
 * This module contains server actions for handling user registration functionality.
 * It provides functions for registering users, retrieving registration data,
 * checking registration status, and getting form options.
 */

"use server";

import { createClient } from "@/utils/supabase/server";
import * as UserRegistrationDAL from "@/dal/user-registration";
import {
  BaseRegistrationSchema,
  BaseRegistrationInput,
  UserRegistration,
  validateFormData,
} from "@/types/registration";
import { revalidatePath } from "next/cache";

/**
 * Server action for user registration
 *
 * Handles the complete user registration process including validation,
 * authentication, duplicate checking, and user record creation with
 * associated interests and dietary restrictions.
 *
 * @param formData - Partial registration form data containing user details
 * @returns Promise with success status, data, and error message
 */
export async function registerUserAction(
  formData: Partial<BaseRegistrationInput>,
) {
  try {
    // Validate form data on the server
    const validationResult = validateFormData(BaseRegistrationSchema, formData);
    if (!validationResult.success) {
      console.error("Validation failed:", {
        error: validationResult.error,
        fieldErrors: validationResult.fieldErrors,
        formData: formData,
      });
      return {
        success: false,
        error: validationResult.error,
        fieldErrors: validationResult.fieldErrors,
      };
    }

    const registrationData = validationResult.data!;
    const supabase = await createClient();

    // Get current user
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      console.error("Authentication failed in registerUserAction:", {
        authError: authError?.message,
        hasUser: !!auth.user,
      });
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Check if user already exists
    const existingUser = await UserRegistrationDAL.getUserById(auth.user.id);
    if (existingUser.success && existingUser.data) {
      return {
        success: true,
        message: "User already registered",
        data: existingUser.data,
      };
    }

    // Create user record with interests and dietary restrictions in a single transaction
    const userRecord: Omit<UserRegistration, "id"> = {
      email: auth.user.email!,
      f_name: registrationData.firstName,
      l_name: registrationData.lastName,
      gender: registrationData.gender,
      university: registrationData.university,
      major: registrationData.major,
      yearOfStudy: registrationData.yearOfStudy,
      experience: registrationData.experience,
      marketing: registrationData.marketing,
      prev_attendance: registrationData.previousAttendance,
      parking: registrationData.parking,
      accommodations: registrationData.accommodations || "",
      resume_url: registrationData.resume || undefined,
      status: "pending",
      checked_in: false,
      timestamp: new Date().toISOString(),
    };

    const createResult = await UserRegistrationDAL.createUser(
      auth.user.id,
      userRecord,
      registrationData.interests || [],
      registrationData.dietaryRestrictions || [],
    );

    if (!createResult.success) {
      return { success: false, error: createResult.error };
    }

    // Revalidate user dashboard
    revalidatePath("/user/dashboard");

    return {
      success: true,
      data: createResult.data!,
      message: "Registration completed successfully",
    };
  } catch (error) {
    console.error("Registration error:", {
      error: error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : undefined,
      formDataAtError: formData,
    });
    return {
      success: false,
      error: "Registration failed",
    };
  }
}

/**
 * Server action for getting registration data
 *
 * Retrieves the current user's registration data from the database.
 * This function is typically used to populate forms or display user information.
 *
 * @returns Promise with success status and user registration data
 */
export async function getRegistrationDataAction() {
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

    // Get user registration data
    const result = await UserRegistrationDAL.getUserById(auth.user.id);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Get registration error:", error);
    return {
      success: false,
      error: "Failed to get registration data",
    };
  }
}

/**
 * Server action for getting form options
 *
 * Retrieves all the dropdown/select options needed for the registration form.
 * This includes genders, universities, majors, interests, dietary restrictions,
 * and marketing types. All options are fetched in parallel for optimal performance.
 *
 * @returns Promise with success status and all form options data
 */
export async function getFormOptionsAction() {
  try {
    // Split queries into smaller batches to prevent timeout issues
    const [gendersResult, marketingTypesResult] = await Promise.all([
      UserRegistrationDAL.getGenderOptions(),
      UserRegistrationDAL.getMarketingTypeOptions(),
    ]);

    // Second batch: larger lookup tables
    const [universitiesResult, majorsResult] = await Promise.all([
      UserRegistrationDAL.getUniversityOptions(),
      UserRegistrationDAL.getMajorOptions(),
    ]);

    // Third batch: interest-related tables
    const [interestsResult, dietaryRestrictionsResult] = await Promise.all([
      UserRegistrationDAL.getInterestOptions(),
      UserRegistrationDAL.getDietaryRestrictionOptions(),
    ]);

    const errors = [
      gendersResult,
      universitiesResult,
      majorsResult,
      interestsResult,
      dietaryRestrictionsResult,
      marketingTypesResult,
    ].filter((result) => !result.success);

    if (errors.length > 0) {
      return {
        success: false,
        error: `Failed to load form options: ${errors.map((e) => e.error).join(", ")}`,
      };
    }

    return {
      success: true,
      data: {
        genders: gendersResult.data!,
        universities: universitiesResult.data!,
        majors: majorsResult.data!,
        interests: interestsResult.data!,
        dietaryRestrictions: dietaryRestrictionsResult.data!,
        marketingTypes: marketingTypesResult.data!,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get form options",
    };
  }
}
