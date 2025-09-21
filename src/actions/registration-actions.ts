"use server";

import { createClient } from "@/utils/supabase/server";
import * as UserRegistrationDAL from "@/dal/user-registration";
import {
  BaseRegistrationSchema,
  UserRegistration,
  validateFormData,
} from "@/types/registration";
import { db } from "@/db/drizzle";
import { revalidatePath } from "next/cache";

// Server action for user registration
export async function registerUserAction(formData: Record<string, unknown>) {
  try {
    // Validate form data on the server
    const validationResult = validateFormData(BaseRegistrationSchema, formData);
    if (!validationResult.success) {
      console.error("Validation failed:", {
        error: validationResult.error,
        formData: formData,
      });
      return {
        success: false,
        error: `Validation failed: ${validationResult.error}`,
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

    // Create user record - registrationData now contains IDs directly
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
    );
    if (!createResult.success) {
      return { success: false, error: createResult.error };
    }

    // Handle interests and dietary restrictions - registrationData now contains IDs directly
    if (registrationData.interests && registrationData.interests.length > 0) {
      await UserRegistrationDAL.setUserInterests(
        auth.user.id,
        registrationData.interests,
      );
    }

    if (
      registrationData.dietaryRestrictions &&
      registrationData.dietaryRestrictions.length > 0
    ) {
      await UserRegistrationDAL.setUserDietaryRestrictions(
        auth.user.id,
        registrationData.dietaryRestrictions,
      );
    }

    // Note: Profile table sync removed - users table is now the single source of truth

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

// Server action for getting registration data
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

// Server action for checking if user is already registered
export async function checkRegistrationStatusAction() {
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

    // Check if user is registered
    const result = await UserRegistrationDAL.getUserById(auth.user.id);

    return {
      success: true,
      isRegistered: result.success && !!result.data,
      data: result.data,
    };
  } catch (error) {
    console.error("Check registration error:", error);
    return {
      success: false,
      error: "Failed to check registration status",
    };
  }
}

// Server action for getting form options
export async function getFormOptionsAction() {
  try {
    const [
      gendersResult,
      universitiesResult,
      majorsResult,
      interestsResult,
      dietaryRestrictionsResult,
      marketingTypesResult,
    ] = await Promise.all([
      UserRegistrationDAL.getGenderOptions(),
      UserRegistrationDAL.getUniversityOptions(),
      UserRegistrationDAL.getMajorOptions(),
      UserRegistrationDAL.getInterestOptions(),
      UserRegistrationDAL.getDietaryRestrictionOptions(),
      UserRegistrationDAL.getMarketingTypeOptions(),
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

// Server action for processing complete registration (includes auth check)
export async function processCompleteRegistrationAction(
  formData: Record<string, unknown>,
) {
  try {
    // First check authentication
    const supabase = await createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();

    if (authError || !auth.user) {
      console.error("Authentication failed:", {
        authError: authError?.message,
        hasUser: !!auth.user,
        userId: auth.user?.id,
      });
      return {
        success: false,
        error: "Authentication required",
      };
    }
    // Then process registration
    const result = await registerUserAction(formData);

    return result;
  } catch (error) {
    console.error("Process complete registration error:", {
      error: error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : undefined,
      formDataAtError: formData,
    });
    return {
      success: false,
      error: "Registration processing failed",
    };
  }
}
