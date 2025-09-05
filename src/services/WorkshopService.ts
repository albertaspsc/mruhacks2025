import { workshopRepository } from "@/dal/workshopRepository";
import { workshopRegistrationRepository } from "@/dal/workshopRegistrationRepository";
import { AuthService } from "./AuthService";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
  DatabaseError,
} from "@/errors";
import {
  WorkshopDTO,
  CreateWorkshopDTO,
  UpdateWorkshopDTO,
} from "@/dto/workshop.dto";
import { DEFAULTS } from "@/constants";
import { NextRequest } from "next/server";

/**
 * WorkshopService - Business logic layer for workshop operations
 *
 * Handles:
 * - Authentication and authorization
 * - Business rules and validation
 * - Data transformation and enrichment
 * - Error handling and logging
 */
export class WorkshopService {
  /**
   * Get workshops for authenticated user
   * Includes registration status if user is authenticated
   */
  static async getWorkshopsForUser(
    request: NextRequest,
  ): Promise<WorkshopDTO[]> {
    // Authenticate user (optional for public access)
    const authResult = await AuthService.verifyApiAuth(request);

    let userId: string | undefined;
    if ("user" in authResult) {
      userId = authResult.user.id;
    }

    // Get workshops with enriched data
    const workshops = await workshopRepository.listActiveByEvent(
      DEFAULTS.EVENT_NAME,
      userId,
    );

    return workshops;
  }

  /**
   * Get workshop registrations for admin/volunteer users
   * Includes detailed participant information
   */
  static async getWorkshopRegistrations(
    request: NextRequest,
    workshopId: string,
  ): Promise<{
    workshop: {
      id: string;
      title: string;
      maxCapacity: number;
      currentRegistrations: number;
    };
    registrations: Array<{
      id: string;
      registeredAt: string;
      participant: {
        firstName: string;
        lastName: string;
        fullName: string;
        yearOfStudy: string | null;
        gender: string | null;
        major: string | null;
      };
    }>;
  }> {
    // Authenticate user
    const authResult = await AuthService.verifyApiAuth(request);
    if (!("user" in authResult)) {
      throw new AuthorizationError("Authentication required");
    }

    // Authorize user (must be admin or volunteer)
    AuthService.requireRole(["admin", "volunteer"])(authResult.user);

    // Validate workshopId
    if (!workshopId || typeof workshopId !== "string") {
      throw new ValidationError("workshopId", "Valid workshop ID is required");
    }

    // Get workshop details
    const workshop = await workshopRepository.getById(workshopId);
    if (!workshop) {
      throw new NotFoundError("Workshop");
    }

    // Get registrations via repository (includes participant info)
    try {
      const regs =
        await workshopRegistrationRepository.getWorkshopRegistrationsWithParticipantInfo(
          workshopId,
        );

      const response = {
        workshop: {
          id: workshop.id,
          title: workshop.title,
          maxCapacity: workshop.maxCapacity,
          currentRegistrations: workshop.currentRegistrations,
        },
        registrations: (regs || []).map((reg: any) => ({
          id: reg.id,
          registeredAt: reg.registeredAt,
          participant: {
            firstName: reg.fName || "",
            lastName: reg.lName || "",
            fullName: `${reg.fName || ""} ${reg.lName || ""}`.trim(),
            yearOfStudy: reg.yearOfStudy,
            gender: reg.gender,
            major: reg.major,
          },
        })),
      };

      return response;
    } catch (err: any) {
      console.error("Registrations fetch error:", err);
      if (err instanceof DatabaseError) {
        throw err;
      }
      throw new Error("Failed to fetch registrations");
    }
  }

  /**
   * Get workshop by ID for authenticated user
   * Includes registration status if applicable
   */
  static async getWorkshopById(
    request: NextRequest,
    workshopId: string,
  ): Promise<WorkshopDTO> {
    // Authenticate user (optional)
    const authResult = await AuthService.verifyApiAuth(request);
    const userId = "user" in authResult ? authResult.user.id : undefined;

    // Validate workshopId
    if (!workshopId || typeof workshopId !== "string") {
      throw new ValidationError("workshopId", "Valid workshop ID is required");
    }

    // Get workshop
    const workshop = await workshopRepository.getById(workshopId, userId);
    if (!workshop) {
      throw new NotFoundError("Workshop");
    }

    return workshop;
  }

  /**
   * Create a new workshop (admin only)
   */
  static async createWorkshop(
    request: NextRequest,
    workshopData: any, // TODO: Use CreateWorkshopDTO
  ): Promise<WorkshopDTO> {
    // Authenticate and authorize
    const authResult = await AuthService.verifyApiAuth(request);
    if (!("user" in authResult)) {
      throw new AuthorizationError("Authentication required");
    }

    AuthService.requireRole(["admin"])(authResult.user);

    // Validate input DTO
    const parsed = CreateWorkshopDTO.safeParse(workshopData);
    if (!parsed.success) {
      throw new ValidationError(JSON.stringify(parsed.error.format()));
    }

    try {
      const created = await workshopRepository.create(parsed.data);
      return created;
    } catch (err: any) {
      console.error("Create workshop error:", err);
      throw new DatabaseError("Failed to create workshop");
    }
  }

  /**
   * Update workshop (admin only)
   */
  static async updateWorkshop(
    request: NextRequest,
    workshopId: string,
    updateData: any, // TODO: Use UpdateWorkshopDTO
  ): Promise<WorkshopDTO> {
    // Authenticate and authorize
    const authResult = await AuthService.verifyApiAuth(request);
    if (!("user" in authResult)) {
      throw new AuthorizationError("Authentication required");
    }

    AuthService.requireRole(["admin"])(authResult.user);

    // Validate DTO
    const parsed = UpdateWorkshopDTO.safeParse(updateData);
    if (!parsed.success) {
      throw new ValidationError(JSON.stringify(parsed.error.format()));
    }

    try {
      const updated = await workshopRepository.update(workshopId, parsed.data);
      if (!updated) {
        throw new NotFoundError("Workshop");
      }
      return updated;
    } catch (err: any) {
      console.error("Update workshop error:", err);
      if (err instanceof NotFoundError) throw err;
      throw new DatabaseError("Failed to update workshop");
    }
  }

  /**
   * Delete workshop (admin only)
   */
  static async deleteWorkshop(
    request: NextRequest,
    workshopId: string,
  ): Promise<void> {
    // Authenticate and authorize
    const authResult = await AuthService.verifyApiAuth(request);
    if (!("user" in authResult)) {
      throw new AuthorizationError("Authentication required");
    }

    AuthService.requireRole(["admin"])(authResult.user);

    // Validate workshopId
    if (!workshopId || typeof workshopId !== "string") {
      throw new ValidationError("workshopId", "Valid workshop ID is required");
    }

    // Delete workshop
    const deleted = await workshopRepository.delete(workshopId);
    if (!deleted) {
      throw new NotFoundError("Workshop");
    }
  }
}
