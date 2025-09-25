"use server";

import {
  Workshop,
  WorkshopInsertData,
  WorkshopUpdateData,
  WorkshopRegistrationData,
} from "@/types/workshop";
import { ServiceResult } from "@/types/registration";
import { db } from "@/db/drizzle";
import { workshops, workshopRegistrations } from "@/db/schema";
import { eq, and, count, desc, asc, inArray, type SQL } from "drizzle-orm";

/**
 * Helper function for type-safe date conversion
 * @param date - Date as string or Date object
 * @returns Date as ISO string (YYYY-MM-DD format)
 */
function convertDateToString(date: string | Date): string {
  if (typeof date === "string") {
    return date;
  }
  return date.toISOString().split("T")[0];
}

/**
 * Helper function to validate workshop data
 * @param data - Partial workshop data to validate
 * @returns Array of validation error messages
 */
function validateWorkshopData(data: Partial<Workshop>): string[] {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (!data.eventName || data.eventName.trim().length === 0) {
    errors.push("Event name is required");
  }

  if (!data.startTime || data.startTime.trim().length === 0) {
    errors.push("Start time is required");
  }

  if (!data.endTime || data.endTime.trim().length === 0) {
    errors.push("End time is required");
  }

  if (
    data.maxCapacity !== undefined &&
    data.maxCapacity !== null &&
    data.maxCapacity < 0
  ) {
    errors.push("Max capacity cannot be negative");
  }

  return errors;
}

/**
 * Fetches all workshops with registration status for the current user.
 *
 * This function retrieves all active workshops and includes:
 * - Current registration count for each workshop
 * - Whether the current user is registered
 * - Whether the workshop is at capacity
 *
 * @param userId - The ID of the current user
 * @returns Promise<ServiceResult<Workshop[]>> - Success/error result with workshops array
 */
export async function getWorkshopsWithRegistrationStatus(
  userId: string,
): Promise<ServiceResult<Workshop[]>> {
  try {
    // Fetch active workshops ordered by date and start time
    const workshopsData = await db
      .select()
      .from(workshops)
      .where(eq(workshops.isActive, true))
      .orderBy(asc(workshops.date), asc(workshops.startTime));

    if (!workshopsData || workshopsData.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Get registration counts for each workshop
    const workshopIds: string[] = workshopsData.map((w) => w.id);
    const registrations = await db
      .select({
        workshopId: workshopRegistrations.workshopId,
        userId: workshopRegistrations.userId,
      })
      .from(workshopRegistrations)
      .where(inArray(workshopRegistrations.workshopId, workshopIds));

    // Count registrations per workshop
    const registrationCounts: Record<string, number> = {};
    const userRegistrations: Set<string> = new Set();

    registrations.forEach((reg) => {
      registrationCounts[reg.workshopId] =
        (registrationCounts[reg.workshopId] || 0) + 1;
      if (reg.userId === userId) {
        userRegistrations.add(reg.workshopId);
      }
    });

    const transformedWorkshops: Workshop[] = workshopsData.map((workshop) => ({
      id: workshop.id,
      title: workshop.title,
      description: workshop.description || null,
      eventName: workshop.eventName,
      date: workshop.date,
      startTime: workshop.startTime,
      endTime: workshop.endTime,
      location: workshop.location || null,
      maxCapacity: workshop.maxCapacity,
      currentRegistrations: registrationCounts[workshop.id] || 0,
      isRegistered: userRegistrations.has(workshop.id),
      isFull:
        workshop.maxCapacity && workshop.maxCapacity > 0
          ? (registrationCounts[workshop.id] || 0) >= workshop.maxCapacity
          : false,
      imageUrl: null, // Add imageUrl field if needed in schema
    }));

    return {
      success: true,
      data: transformedWorkshops,
    };
  } catch (error) {
    console.error("Get workshops error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to fetch workshops: ${errorMessage}`,
    };
  }
}

/**
 * Checks if a user is registered for a specific workshop.
 *
 * @param userId - The ID of the user
 * @param workshopId - The ID of the workshop
 * @returns Promise<ServiceResult<boolean>> - Success/error result with registration status
 */
export async function isUserRegisteredForWorkshop(
  userId: string,
  workshopId: string,
): Promise<ServiceResult<boolean>> {
  try {
    const registration = await db.query.workshopRegistrations.findFirst({
      where: (wr, { and, eq }) =>
        and(eq(wr.userId, userId), eq(wr.workshopId, workshopId)),
    });

    return {
      success: true,
      data: !!registration,
    };
  } catch (error) {
    console.error("Check registration error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to check registration status: ${errorMessage}`,
    };
  }
}

/**
 * Gets the registration count for a specific workshop.
 *
 * @param workshopId - The ID of the workshop
 * @returns Promise<ServiceResult<number>> - Success/error result with registration count
 */
export async function getWorkshopRegistrationCount(
  workshopId: string,
): Promise<ServiceResult<number>> {
  try {
    const result = await db
      .select({ count: count() })
      .from(workshopRegistrations)
      .where(eq(workshopRegistrations.workshopId, workshopId));

    const registrationCount = result[0]?.count;
    if (registrationCount === undefined) {
      return {
        success: false,
        error: "Failed to retrieve registration count",
      };
    }

    return {
      success: true,
      data: registrationCount,
    };
  } catch (error) {
    console.error("Get registration count error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to get registration count: ${errorMessage}`,
    };
  }
}

/**
 * Registers a user for a workshop.
 *
 * @param userId - The ID of the user to register
 * @param workshopId - The ID of the workshop to register for
 * @returns Promise<ServiceResult<void>> - Success/error result
 */
export async function registerUserForWorkshop(
  userId: string,
  workshopId: string,
): Promise<ServiceResult<void>> {
  try {
    const registrationData: WorkshopRegistrationData = {
      userId,
      workshopId,
      registeredAt: new Date().toISOString(),
    };

    await db.insert(workshopRegistrations).values(registrationData);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Register user for workshop error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to register for workshop: ${errorMessage}`,
    };
  }
}

/**
 * Unregisters a user from a workshop.
 *
 * @param userId - The ID of the user to unregister
 * @param workshopId - The ID of the workshop to unregister from
 * @returns Promise<ServiceResult<void>> - Success/error result
 */
export async function unregisterUserFromWorkshop(
  userId: string,
  workshopId: string,
): Promise<ServiceResult<void>> {
  try {
    await db
      .delete(workshopRegistrations)
      .where(
        and(
          eq(workshopRegistrations.userId, userId),
          eq(workshopRegistrations.workshopId, workshopId),
        ),
      );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unregister user from workshop error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to unregister from workshop: ${errorMessage}`,
    };
  }
}

/**
 * Checks if a workshop is at full capacity.
 *
 * @param workshopId - The ID of the workshop
 * @returns Promise<ServiceResult<boolean>> - Success/error result with capacity status
 */
export async function isWorkshopFull(
  workshopId: string,
): Promise<ServiceResult<boolean>> {
  try {
    const workshop = await db.query.workshops.findFirst({
      where: (w, { eq }) => eq(w.id, workshopId),
    });

    if (!workshop) {
      return {
        success: false,
        error: "Workshop not found",
      };
    }

    if (!workshop.maxCapacity || workshop.maxCapacity <= 0) {
      return {
        success: true,
        data: false,
      };
    }

    const registrationCountResult =
      await getWorkshopRegistrationCount(workshopId);

    if (!registrationCountResult.success) {
      return {
        success: false,
        error: registrationCountResult.error,
      };
    }

    return {
      success: true,
      data: (registrationCountResult.data || 0) >= workshop.maxCapacity,
    };
  } catch (error) {
    console.error("Check workshop capacity error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to check workshop capacity: ${errorMessage}`,
    };
  }
}

/**
 * Gets all workshops (admin function).
 *
 * @returns Promise<ServiceResult<Workshop[]>> - Success/error result with workshops array
 */
export async function getAllWorkshops(): Promise<ServiceResult<Workshop[]>> {
  try {
    const workshopsData = await db
      .select()
      .from(workshops)
      .orderBy(asc(workshops.date), asc(workshops.startTime));

    const transformedWorkshops: Workshop[] = workshopsData.map((workshop) => ({
      id: workshop.id,
      title: workshop.title,
      description: workshop.description || null,
      eventName: workshop.eventName,
      date: workshop.date,
      startTime: workshop.startTime,
      endTime: workshop.endTime,
      location: workshop.location || null,
      maxCapacity: workshop.maxCapacity,
      currentRegistrations: 0, // Would need to calculate this
      isRegistered: false, // Would need userId to determine
      isFull: false, // Would need to calculate this
      imageUrl: null, // Add imageUrl field if needed in schema
    }));

    return {
      success: true,
      data: transformedWorkshops,
    };
  } catch (error) {
    console.error("Get all workshops error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to fetch workshops: ${errorMessage}`,
    };
  }
}

/**
 * Creates a new workshop (admin function).
 *
 * @param workshopData - The workshop data to create
 * @returns Promise<ServiceResult<Workshop>> - Success/error result with created workshop
 */
export async function createWorkshop(
  workshopData: Omit<
    Workshop,
    "id" | "currentRegistrations" | "isRegistered" | "isFull"
  >,
): Promise<ServiceResult<Workshop>> {
  try {
    // Validate workshop data
    const validationErrors = validateWorkshopData(workshopData);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Validation failed: ${validationErrors.join(", ")}`,
      };
    }

    const insertData: WorkshopInsertData = {
      title: workshopData.title,
      description: workshopData.description,
      eventName: workshopData.eventName,
      date: convertDateToString(workshopData.date),
      startTime: workshopData.startTime,
      endTime: workshopData.endTime,
      location: workshopData.location,
      maxCapacity: workshopData.maxCapacity,
      isActive: true,
    };

    const [createdWorkshop] = await db
      .insert(workshops)
      .values(insertData)
      .returning();

    const transformedWorkshop: Workshop = {
      id: createdWorkshop.id,
      title: createdWorkshop.title,
      description: createdWorkshop.description || null,
      eventName: createdWorkshop.eventName,
      date: createdWorkshop.date,
      startTime: createdWorkshop.startTime,
      endTime: createdWorkshop.endTime,
      location: createdWorkshop.location || null,
      maxCapacity: createdWorkshop.maxCapacity,
      currentRegistrations: 0,
      isRegistered: false,
      isFull: false,
      imageUrl: null,
    };

    return {
      success: true,
      data: transformedWorkshop,
    };
  } catch (error) {
    console.error("Create workshop error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to create workshop: ${errorMessage}`,
    };
  }
}

/**
 * Updates a workshop (admin function).
 *
 * @param workshopId - The ID of the workshop to update
 * @param updates - The workshop data to update
 * @returns Promise<ServiceResult<Workshop>> - Success/error result with updated workshop
 */
export async function updateWorkshop(
  workshopId: string,
  updates: Partial<
    Omit<Workshop, "id" | "currentRegistrations" | "isRegistered" | "isFull">
  >,
): Promise<ServiceResult<Workshop>> {
  try {
    // Validate workshop data if provided
    if (Object.keys(updates).length > 0) {
      const validationErrors = validateWorkshopData(updates);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: `Validation failed: ${validationErrors.join(", ")}`,
        };
      }
    }

    const updateData: WorkshopUpdateData = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.eventName !== undefined)
      updateData.eventName = updates.eventName;
    if (updates.date !== undefined) {
      updateData.date = convertDateToString(updates.date);
    }
    if (updates.startTime !== undefined)
      updateData.startTime = updates.startTime;
    if (updates.endTime !== undefined) updateData.endTime = updates.endTime;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.maxCapacity !== undefined)
      updateData.maxCapacity = updates.maxCapacity;

    const [updatedWorkshop] = await db
      .update(workshops)
      .set(updateData)
      .where(eq(workshops.id, workshopId))
      .returning();

    if (!updatedWorkshop) {
      return {
        success: false,
        error: "Workshop not found",
      };
    }

    const transformedWorkshop: Workshop = {
      id: updatedWorkshop.id,
      title: updatedWorkshop.title,
      description: updatedWorkshop.description || null,
      eventName: updatedWorkshop.eventName,
      date: updatedWorkshop.date,
      startTime: updatedWorkshop.startTime,
      endTime: updatedWorkshop.endTime,
      location: updatedWorkshop.location || null,
      maxCapacity: updatedWorkshop.maxCapacity,
      currentRegistrations: 0, // Would need to calculate this
      isRegistered: false, // Would need userId to determine
      isFull: false, // Would need to calculate this
      imageUrl: null,
    };

    return {
      success: true,
      data: transformedWorkshop,
    };
  } catch (error) {
    console.error("Update workshop error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to update workshop: ${errorMessage}`,
    };
  }
}

/**
 * Deletes a workshop (admin function).
 *
 * @param workshopId - The ID of the workshop to delete
 * @returns Promise<ServiceResult<void>> - Success/error result
 */
export async function deleteWorkshop(
  workshopId: string,
): Promise<ServiceResult<void>> {
  try {
    await db.delete(workshops).where(eq(workshops.id, workshopId));

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete workshop error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to delete workshop: ${errorMessage}`,
    };
  }
}
