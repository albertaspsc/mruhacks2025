"use server";
/**
 * @fileoverview Workshop management server actions
 *
 * This module provides server actions for managing workshop functionality including:
 * - Fetching workshops with registration status
 * - Registering users for workshops
 * - Unregistering users from workshops
 */

import { createClient } from "@/utils/supabase/server";
import { Workshop } from "@/types/workshop";
import { ServiceResult } from "@/types/registration";
import { revalidatePath } from "next/cache";
import {
  getWorkshopsWithRegistrationStatus,
  registerUserForWorkshop,
  unregisterUserFromWorkshop,
  isUserRegisteredForWorkshop,
  isWorkshopFull,
  getWorkshopRegistrationCount,
} from "@/dal/workshop";

/**
 * Fetches all workshops with registration status for the current user.
 *
 * This server action retrieves all active workshops and includes:
 * - Current registration count for each workshop
 * - Whether the current user is registered
 * - Whether the workshop is at capacity
 *
 * @returns Promise<ServiceResult<Workshop[]>> - Success/error result with workshops array
 */
export async function getWorkshopsAction(): Promise<ServiceResult<Workshop[]>> {
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

    // Use DAL function to get workshops with registration status
    return await getWorkshopsWithRegistrationStatus(auth.user.id);
  } catch (error) {
    console.error("Get workshops error:", error);
    return {
      success: false,
      error: "Failed to fetch workshops",
    };
  }
}

/**
 * Registers the current user for a workshop.
 *
 * This server action handles workshop registration including:
 * - Authentication verification
 * - Workshop existence and availability checks
 * - Capacity validation
 * - Duplicate registration prevention
 *
 * @param workshopId - The ID of the workshop to register for
 * @returns Promise<ServiceResult<{ message: string }>> - Success/error result
 */
export async function registerForWorkshopAction(
  workshopId: string,
): Promise<ServiceResult<{ message: string }>> {
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

    // Check if already registered
    const isRegisteredResult = await isUserRegisteredForWorkshop(
      auth.user.id,
      workshopId,
    );

    if (!isRegisteredResult.success) {
      return {
        success: false,
        error: isRegisteredResult.error,
      };
    }

    if (isRegisteredResult.data) {
      return {
        success: false,
        error: "Already registered for this workshop",
      };
    }

    // Check if workshop is full
    const isFullResult = await isWorkshopFull(workshopId);

    if (!isFullResult.success) {
      return {
        success: false,
        error: isFullResult.error,
      };
    }

    if (isFullResult.data) {
      return {
        success: false,
        error: "Workshop is at full capacity",
      };
    }

    // Register for workshop using DAL
    const registerResult = await registerUserForWorkshop(
      auth.user.id,
      workshopId,
    );

    if (!registerResult.success) {
      return {
        success: false,
        error: registerResult.error,
      };
    }

    // Revalidate relevant pages
    revalidatePath("/user/dashboard");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      data: { message: "Successfully registered for workshop" },
    };
  } catch (error) {
    console.error("Register for workshop error:", error);
    return {
      success: false,
      error: "Failed to register for workshop",
    };
  }
}

/**
 * Unregisters the current user from a workshop.
 *
 * This server action handles workshop unregistration including:
 * - Authentication verification
 * - Registration existence check
 * - Removal of registration record
 *
 * @param workshopId - The ID of the workshop to unregister from
 * @returns Promise<ServiceResult<{ message: string }>> - Success/error result
 */
export async function unregisterFromWorkshopAction(
  workshopId: string,
): Promise<ServiceResult<{ message: string }>> {
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

    // Check if registered
    const isRegisteredResult = await isUserRegisteredForWorkshop(
      auth.user.id,
      workshopId,
    );

    if (!isRegisteredResult.success) {
      return {
        success: false,
        error: isRegisteredResult.error,
      };
    }

    if (!isRegisteredResult.data) {
      return {
        success: false,
        error: "Not registered for this workshop",
      };
    }

    // Unregister from workshop using DAL
    const unregisterResult = await unregisterUserFromWorkshop(
      auth.user.id,
      workshopId,
    );

    if (!unregisterResult.success) {
      return {
        success: false,
        error: unregisterResult.error,
      };
    }

    // Revalidate relevant pages
    revalidatePath("/user/dashboard");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      data: { message: "Successfully unregistered from workshop" },
    };
  } catch (error) {
    console.error("Unregister from workshop error:", error);
    return {
      success: false,
      error: "Failed to unregister from workshop",
    };
  }
}
