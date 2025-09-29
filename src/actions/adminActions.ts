"use server";
/**
 * @fileoverview Admin management server actions
 *
 * This module provides server actions for managing admin functionality including:
 * - Fetching workshops with registration counts for admin dashboard
 * - Creating new workshops
 * - Updating existing workshops
 * - Deleting workshops
 * - Managing workshop registrations
 */

import { createClient } from "@/utils/supabase/server";
import { AdminWorkshopFormData, AdminWorkshop } from "@/types/admin";
import { ServiceResult } from "@/types/registration";
import { revalidatePath } from "next/cache";

/**
 * Validates admin permissions for the current user.
 *
 * @param supabase - Supabase client instance
 * @returns Promise<ServiceResult<{ id: string; role: string; status: string }>> - Admin data or error
 */
async function validateAdminPermissions(
  supabase: any,
): Promise<ServiceResult<{ id: string; role: string; status: string }>> {
  try {
    // Get current user
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Check admin status and ensure user is not a volunteer
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("id, role, status")
      .eq("id", auth.user.id)
      .single();

    if (
      adminError ||
      !adminData ||
      adminData.status !== "active" ||
      adminData.role === "volunteer"
    ) {
      return {
        success: false,
        error: "Admin access required",
      };
    }

    return {
      success: true,
      data: adminData,
    };
  } catch (error) {
    console.error("Admin permission validation error:", error);
    return {
      success: false,
      error: "Failed to validate admin permissions",
    };
  }
}

/**
 * Fetches all workshops with registration counts for admin dashboard.
 *
 * This server action retrieves all workshops and includes:
 * - Current registration count for each workshop
 * - Workshop details for admin management
 *
 * @returns Promise<ServiceResult<AdminWorkshop[]>> - Success/error result with workshops array
 */
export async function getAdminWorkshopsAction(): Promise<
  ServiceResult<AdminWorkshop[]>
> {
  try {
    const supabase = await createClient();

    // Validate admin permissions
    const adminResult = await validateAdminPermissions(supabase);
    if (!adminResult.success) {
      return {
        success: false,
        error: adminResult.error,
      };
    }

    // Fetch workshops
    const { data: workshops, error: workshopsError } = await supabase
      .from("workshops")
      .select("*")
      .order("date", { ascending: true });

    if (workshopsError) {
      return {
        success: false,
        error: "Failed to fetch workshops",
      };
    }

    // Get registration counts
    const workshopIds = workshops.map((w) => w.id);
    const { data: registrations } = await supabase
      .from("workshop_registrations")
      .select("workshop_id")
      .in("workshop_id", workshopIds);

    const registrationCounts: Record<string, number> = {};
    registrations?.forEach((reg) => {
      registrationCounts[reg.workshop_id] =
        (registrationCounts[reg.workshop_id] || 0) + 1;
    });

    // Transform workshops to AdminWorkshop format
    const workshopsWithCounts: AdminWorkshop[] = workshops.map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description || "",
      date: w.date,
      startTime: w.startTime,
      endTime: w.endTime,
      location: w.location || "",
      maxCapacity: w.maxCapacity || 0,
      isActive: w.isActive,
      currentRegistrations: registrationCounts[w.id] || 0,
    }));

    return {
      success: true,
      data: workshopsWithCounts,
    };
  } catch (error) {
    console.error("Get admin workshops error:", error);
    return {
      success: false,
      error: "Failed to fetch workshops",
    };
  }
}

/**
 * Creates a new workshop.
 *
 * @param data - Workshop form data
 * @returns Promise<ServiceResult<AdminWorkshop>> - Success/error result with created workshop
 */
export async function createWorkshopAction(
  data: AdminWorkshopFormData,
): Promise<ServiceResult<AdminWorkshop>> {
  try {
    const supabase = await createClient();

    // Validate admin permissions
    const adminResult = await validateAdminPermissions(supabase);
    if (!adminResult.success) {
      return {
        success: false,
        error: adminResult.error,
      };
    }

    // Create workshop
    const { data: workshop, error } = await supabase
      .from("workshops")
      .insert({
        title: data.title,
        description: data.description,
        event_name: "mruhacks2025",
        date: data.date,
        start_time: data.startTime,
        end_time: data.endTime,
        location: data.location,
        max_capacity: data.maxCapacity,
        is_active: data.isActive,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Transform to AdminWorkshop format
    const adminWorkshop: AdminWorkshop = {
      id: workshop.id,
      title: workshop.title,
      description: workshop.description || "",
      date: workshop.date,
      startTime: workshop.startTime,
      endTime: workshop.endTime,
      location: workshop.location || "",
      maxCapacity: workshop.maxCapacity || 0,
      isActive: workshop.isActive,
      currentRegistrations: 0,
    };

    // Revalidate admin dashboard
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/workshops");

    return {
      success: true,
      data: adminWorkshop,
    };
  } catch (error) {
    console.error("Create workshop error:", error);
    return {
      success: false,
      error: "Failed to create workshop",
    };
  }
}

/**
 * Updates an existing workshop.
 *
 * This server action handles workshop updates
 *
 * @param workshopId - ID of the workshop to update
 * @param data - Updated workshop form data
 * @returns Promise<ServiceResult<AdminWorkshop>> - Success/error result with updated workshop
 */
export async function updateWorkshopAction(
  workshopId: string,
  data: AdminWorkshopFormData,
): Promise<ServiceResult<AdminWorkshop>> {
  try {
    const supabase = await createClient();

    // Validate admin permissions
    const adminResult = await validateAdminPermissions(supabase);
    if (!adminResult.success) {
      return {
        success: false,
        error: adminResult.error,
      };
    }

    // Update workshop
    const { data: workshop, error } = await supabase
      .from("workshops")
      .update({
        title: data.title,
        description: data.description,
        date: data.date,
        start_time: data.startTime,
        end_time: data.endTime,
        location: data.location,
        max_capacity: data.maxCapacity,
        is_active: data.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", workshopId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!workshop) {
      return {
        success: false,
        error: "Workshop not found",
      };
    }

    // Get current registration count
    const { data: registrations } = await supabase
      .from("workshop_registrations")
      .select("id")
      .eq("workshop_id", workshopId);

    // Transform to AdminWorkshop format
    const adminWorkshop: AdminWorkshop = {
      id: workshop.id,
      title: workshop.title,
      description: workshop.description || "",
      date: workshop.date,
      startTime: workshop.startTime,
      endTime: workshop.endTime,
      location: workshop.location || "",
      maxCapacity: workshop.maxCapacity || 0,
      isActive: workshop.isActive,
      currentRegistrations: registrations?.length || 0,
    };

    // Revalidate admin dashboard
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/workshops");

    return {
      success: true,
      data: adminWorkshop,
    };
  } catch (error) {
    console.error("Update workshop error:", error);
    return {
      success: false,
      error: "Failed to update workshop",
    };
  }
}

/**
 * Deletes a workshop.
 *
 * This server action handles workshop deletion
 *
 * @param workshopId - ID of the workshop to delete
 * @returns Promise<ServiceResult<{ message: string }>> - Success/error result
 */
export async function deleteWorkshopAction(
  workshopId: string,
): Promise<ServiceResult<{ message: string }>> {
  try {
    const supabase = await createClient();

    // Validate admin permissions
    const adminResult = await validateAdminPermissions(supabase);
    if (!adminResult.success) {
      return {
        success: false,
        error: adminResult.error,
      };
    }

    // Check if workshop exists
    const { data: workshop, error: fetchError } = await supabase
      .from("workshops")
      .select("id")
      .eq("id", workshopId)
      .single();

    if (fetchError || !workshop) {
      return {
        success: false,
        error: "Workshop not found",
      };
    }

    // Delete workshop (cascade will handle registrations)
    const { error: deleteError } = await supabase
      .from("workshops")
      .delete()
      .eq("id", workshopId);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message,
      };
    }

    // Revalidate admin dashboard
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/workshops");

    return {
      success: true,
      data: { message: "Workshop deleted successfully" },
    };
  } catch (error) {
    console.error("Delete workshop error:", error);
    return {
      success: false,
      error: "Failed to delete workshop",
    };
  }
}

/**
 * Gets a single workshop by ID for admin editing.
 *
 * This server action retrieves a specific workshop including:
 * - Workshop details
 * - Current registration count
 *
 * @param workshopId - ID of the workshop
 * @returns Promise<ServiceResult<AdminWorkshop>> - Success/error result with workshop data
 */
export async function getWorkshopAction(
  workshopId: string,
): Promise<ServiceResult<AdminWorkshop>> {
  try {
    const supabase = await createClient();

    // Validate admin permissions
    const adminResult = await validateAdminPermissions(supabase);
    if (!adminResult.success) {
      return {
        success: false,
        error: adminResult.error,
      };
    }

    // Get workshop
    const { data: workshop, error } = await supabase
      .from("workshops")
      .select("*")
      .eq("id", workshopId)
      .single();

    if (error || !workshop) {
      return {
        success: false,
        error: "Workshop not found",
      };
    }

    // Get registration count
    const { data: registrations } = await supabase
      .from("workshop_registrations")
      .select("id")
      .eq("workshop_id", workshopId);

    // Transform to AdminWorkshop format
    const adminWorkshop: AdminWorkshop = {
      id: workshop.id,
      title: workshop.title,
      description: workshop.description || "",
      date: workshop.date,
      startTime: workshop.startTime,
      endTime: workshop.endTime,
      location: workshop.location || "",
      maxCapacity: workshop.maxCapacity || 0,
      isActive: workshop.isActive,
      currentRegistrations: registrations?.length || 0,
    };

    return {
      success: true,
      data: adminWorkshop,
    };
  } catch (error) {
    console.error("Get workshop error:", error);
    return {
      success: false,
      error: "Failed to fetch workshop",
    };
  }
}

/**
 * Gets workshop registrations for a specific workshop.
 *
 * This server action retrieves all registrations for a workshop including:
 * - Participant details
 * - Registration timestamps
 *
 * @param workshopId - ID of the workshop
 * @returns Promise<ServiceResult<Array<{ id: string; participant: any; registeredAt: string }>>> - Success/error result with registrations
 */
export async function getWorkshopRegistrationsAction(
  workshopId: string,
): Promise<
  ServiceResult<Array<{ id: string; participant: any; registeredAt: string }>>
> {
  try {
    const supabase = await createClient();

    // Validate admin permissions
    const adminResult = await validateAdminPermissions(supabase);
    if (!adminResult.success) {
      return {
        success: false,
        error: adminResult.error,
      };
    }

    // Get workshop registrations with participant details
    const { data: registrations, error } = await supabase
      .from("workshop_registrations")
      .select(
        `
        id,
        registered_at,
        f_name,
        l_name,
        yearOfStudy,
        gender,
        major
      `,
      )
      .eq("workshop_id", workshopId)
      .order("registered_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: "Failed to fetch workshop registrations",
      };
    }

    // Transform registrations to include participant details
    const transformedRegistrations = registrations.map((reg) => ({
      id: reg.id,
      participant: {
        firstName: reg.f_name || "",
        lastName: reg.l_name || "",
        fullName: `${reg.f_name || ""} ${reg.l_name || ""}`.trim(),
        yearOfStudy: reg.yearOfStudy || "",
        gender: reg.gender || "",
        major: reg.major || "",
      },
      registeredAt: reg.registered_at,
    }));

    return {
      success: true,
      data: transformedRegistrations,
    };
  } catch (error) {
    console.error("Get workshop registrations error:", error);
    return {
      success: false,
      error: "Failed to fetch workshop registrations",
    };
  }
}
