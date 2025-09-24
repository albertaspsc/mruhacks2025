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
  FormOptions,
  ServiceResult,
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
 * and marketing types.
 *
 * @returns Promise with success status and all form options data
 */
export async function getFormOptionsAction(): Promise<
  ServiceResult<FormOptions>
> {
  try {
    const DietaryRestrictionOptions =
      await UserRegistrationDAL.getDietaryRestrictionOptions();
    const InterestOptions = await UserRegistrationDAL.getInterestOptions();
    const MarketingTypeOptions =
      await UserRegistrationDAL.getMarketingTypeOptions();
    const MajorOptions = await UserRegistrationDAL.getMajorOptions();
    const UniversityOptions = await UserRegistrationDAL.getUniversityOptions();
    const GenderOptions = await UserRegistrationDAL.getGenderOptions();

    // Check if any of the DAL calls failed
    if (!GenderOptions.success || !GenderOptions.data) {
      return {
        success: false,
        error: "Failed to get gender options",
      };
    }
    if (!UniversityOptions.success || !UniversityOptions.data) {
      return {
        success: false,
        error: "Failed to get university options",
      };
    }
    if (!MajorOptions.success || !MajorOptions.data) {
      return {
        success: false,
        error: "Failed to get major options",
      };
    }
    if (!InterestOptions.success || !InterestOptions.data) {
      return {
        success: false,
        error: "Failed to get interest options",
      };
    }
    if (!DietaryRestrictionOptions.success || !DietaryRestrictionOptions.data) {
      return {
        success: false,
        error: "Failed to get dietary restriction options",
      };
    }
    if (!MarketingTypeOptions.success || !MarketingTypeOptions.data) {
      return {
        success: false,
        error: "Failed to get marketing type options",
      };
    }

    return {
      success: true,
      data: {
        genders: GenderOptions.data,
        universities: UniversityOptions.data,
        majors: MajorOptions.data,
        interests: InterestOptions.data,
        dietaryRestrictions: DietaryRestrictionOptions.data,
        marketingTypes: MarketingTypeOptions.data,
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
