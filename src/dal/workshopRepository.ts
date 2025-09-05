import { db } from "@/db/drizzle";
import { workshops, workshopRegistrations } from "@/db/schema";
import { WorkshopRepository } from "./types";
import {
  WorkshopDTO,
  CreateWorkshopDTO,
  UpdateWorkshopDTO,
} from "@/dto/workshop.dto";
import { eq, and, sql, count } from "drizzle-orm";
import { DEFAULTS } from "@/constants";

/**
 * WorkshopRepository Implementation
 * Handles all workshop data access operations using Drizzle ORM
 */
export class DrizzleWorkshopRepository implements WorkshopRepository {
  /**
   * List all active workshops for a specific event
   * @param eventName - Name of the event (e.g., "mruhacks2025")
   * @param userId - Optional user ID to include registration status
   * @returns Promise resolving to array of workshop DTOs
   */
  async listActiveByEvent(
    eventName: string,
    userId?: string,
  ): Promise<WorkshopDTO[]> {
    // Get workshops with registration counts
    const workshopsWithCounts = await db
      .select({
        id: workshops.id,
        title: workshops.title,
        description: workshops.description,
        eventName: workshops.eventName,
        date: workshops.date,
        startTime: workshops.startTime,
        endTime: workshops.endTime,
        location: workshops.location,
        maxCapacity: workshops.maxCapacity,
        isActive: workshops.isActive,
        currentRegistrations: count(workshopRegistrations.userId),
      })
      .from(workshops)
      .leftJoin(
        workshopRegistrations,
        eq(workshops.id, workshopRegistrations.workshopId),
      )
      .where(
        and(eq(workshops.eventName, eventName), eq(workshops.isActive, true)),
      )
      .groupBy(workshops.id)
      .orderBy(workshops.date, workshops.startTime);

    // If userId provided, get user's registrations
    let userRegistrations: string[] = [];
    if (userId) {
      const registrations = await db
        .select({ workshopId: workshopRegistrations.workshopId })
        .from(workshopRegistrations)
        .where(eq(workshopRegistrations.userId, userId));

      userRegistrations = registrations.map((reg) => reg.workshopId);
    }

    // Transform to WorkshopDTOs
    return workshopsWithCounts.map((workshop) => ({
      id: workshop.id,
      title: workshop.title,
      description: workshop.description || undefined,
      date: new Date(workshop.date).toISOString().split("T")[0], // Format as YYYY-MM-DD
      startTime: workshop.startTime,
      endTime: workshop.endTime,
      location: workshop.location || undefined,
      maxCapacity: workshop.maxCapacity || 0,
      currentRegistrations: workshop.currentRegistrations,
      isRegistered: userId ? userRegistrations.includes(workshop.id) : false,
      isFull:
        workshop.maxCapacity && workshop.maxCapacity > 0
          ? workshop.currentRegistrations >= workshop.maxCapacity
          : false,
      eventName: workshop.eventName,
      isActive: workshop.isActive ?? DEFAULTS.WORKSHOP_IS_ACTIVE,
    }));
  }

  /**
   * Get workshop by ID with optional registration status
   * @param id - Workshop unique identifier
   * @param userId - Optional user ID to include registration status
   * @returns Promise resolving to workshop DTO or null if not found
   */
  async getById(id: string, userId?: string): Promise<WorkshopDTO | null> {
    // Get workshop with registration count
    const workshopWithCount = await db
      .select({
        id: workshops.id,
        title: workshops.title,
        description: workshops.description,
        eventName: workshops.eventName,
        date: workshops.date,
        startTime: workshops.startTime,
        endTime: workshops.endTime,
        location: workshops.location,
        maxCapacity: workshops.maxCapacity,
        isActive: workshops.isActive,
        currentRegistrations: count(workshopRegistrations.userId),
      })
      .from(workshops)
      .leftJoin(
        workshopRegistrations,
        eq(workshops.id, workshopRegistrations.workshopId),
      )
      .where(eq(workshops.id, id))
      .groupBy(workshops.id)
      .limit(1);

    if (workshopWithCount.length === 0) {
      return null;
    }

    const workshop = workshopWithCount[0];

    // Check if user is registered
    let isRegistered = false;
    if (userId) {
      const registration = await db
        .select()
        .from(workshopRegistrations)
        .where(
          and(
            eq(workshopRegistrations.workshopId, id),
            eq(workshopRegistrations.userId, userId),
          ),
        )
        .limit(1);

      isRegistered = registration.length > 0;
    }

    return {
      id: workshop.id,
      title: workshop.title,
      description: workshop.description || undefined,
      date: new Date(workshop.date).toISOString().split("T")[0], // Format as YYYY-MM-DD
      startTime: workshop.startTime,
      endTime: workshop.endTime,
      location: workshop.location || undefined,
      maxCapacity: workshop.maxCapacity || 0,
      currentRegistrations: workshop.currentRegistrations,
      isRegistered,
      isFull:
        workshop.maxCapacity && workshop.maxCapacity > 0
          ? workshop.currentRegistrations >= workshop.maxCapacity
          : false,
      eventName: workshop.eventName,
      isActive: workshop.isActive ?? DEFAULTS.WORKSHOP_IS_ACTIVE,
    };
  }

  /**
   * Create a new workshop
   * @param input - Workshop creation data
   * @returns Promise resolving to created workshop DTO
   */
  async create(input: CreateWorkshopDTO): Promise<WorkshopDTO> {
    const [workshop] = await db
      .insert(workshops)
      .values({
        title: input.title,
        description: input.description,
        eventName: input.eventName,
        date: sql`${input.date}::date`,
        startTime: sql`${input.startTime}::time`,
        endTime: sql`${input.endTime}::time`,
        location: input.location,
        maxCapacity: input.maxCapacity,
      })
      .returning();

    return {
      id: workshop.id,
      title: workshop.title,
      description: workshop.description || undefined,
      date: new Date(workshop.date).toISOString().split("T")[0],
      startTime: workshop.startTime,
      endTime: workshop.endTime,
      location: workshop.location || undefined,
      maxCapacity: workshop.maxCapacity || 0,
      currentRegistrations: 0,
      isRegistered: false,
      isFull: false,
      eventName: workshop.eventName,
      isActive: workshop.isActive ?? DEFAULTS.WORKSHOP_IS_ACTIVE,
    };
  }

  /**
   * Update an existing workshop
   * @param id - Workshop unique identifier
   * @param input - Workshop update data
   * @returns Promise resolving to updated workshop DTO or null if not found
   */
  async update(
    id: string,
    input: UpdateWorkshopDTO,
  ): Promise<WorkshopDTO | null> {
    const updateData: any = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.date !== undefined) updateData.date = sql`${input.date}::date`;
    if (input.startTime !== undefined)
      updateData.startTime = sql`${input.startTime}::time`;
    if (input.endTime !== undefined)
      updateData.endTime = sql`${input.endTime}::time`;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.maxCapacity !== undefined)
      updateData.maxCapacity = input.maxCapacity;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    updateData.updatedAt = sql`NOW()`;

    const [updatedWorkshop] = await db
      .update(workshops)
      .set(updateData)
      .where(eq(workshops.id, id))
      .returning();

    if (!updatedWorkshop) {
      return null;
    }

    // Get current registration count
    const registrationCount = await this.getRegistrationCount(id);

    return {
      id: updatedWorkshop.id,
      title: updatedWorkshop.title,
      description: updatedWorkshop.description || undefined,
      date: new Date(updatedWorkshop.date).toISOString().split("T")[0],
      startTime: updatedWorkshop.startTime,
      endTime: updatedWorkshop.endTime,
      location: updatedWorkshop.location || undefined,
      maxCapacity: updatedWorkshop.maxCapacity || 0,
      currentRegistrations: registrationCount,
      isRegistered: false, // Not relevant for update operation
      isFull:
        updatedWorkshop.maxCapacity && updatedWorkshop.maxCapacity > 0
          ? registrationCount >= updatedWorkshop.maxCapacity
          : false,
      eventName: updatedWorkshop.eventName,
      isActive: updatedWorkshop.isActive ?? DEFAULTS.WORKSHOP_IS_ACTIVE,
    };
  }

  /**
   * Delete a workshop
   * @param id - Workshop unique identifier
   * @returns Promise resolving to true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(workshops)
      .where(eq(workshops.id, id))
      .returning({ id: workshops.id });

    return result.length > 0;
  }

  /**
   * Get registration count for a workshop
   * @param workshopId - Workshop unique identifier
   * @returns Promise resolving to number of registrations
   */
  async getRegistrationCount(workshopId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(workshopRegistrations)
      .where(eq(workshopRegistrations.workshopId, workshopId));

    return result[0]?.count || 0;
  }
}

// Export singleton instance
export const workshopRepository = new DrizzleWorkshopRepository();
