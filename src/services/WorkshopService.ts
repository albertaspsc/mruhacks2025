import { workshopRepository } from "@/dal/workshopRepository";
import { workshopRegistrationRepository } from "@/dal/workshopRegistrationRepository";
import * as AuthService from "./AuthService";
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
// Function-based Workshop service
export async function getWorkshopsForUser(
  request: NextRequest,
): Promise<WorkshopDTO[]> {
  const authResult = await AuthService.verifyApiAuth(request);

  let userId: string | undefined;
  if ("user" in authResult) {
    userId = authResult.user.id;
  }

  const workshops = await workshopRepository.listActiveByEvent(
    DEFAULTS.EVENT_NAME,
    userId,
  );

  return workshops;
}

export async function getWorkshopRegistrations(
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
  const authResult = await AuthService.verifyApiAuth(request);
  if (!("user" in authResult)) {
    throw new AuthorizationError("Authentication required");
  }

  AuthService.requireRole(["admin", "volunteer"])(authResult.user);

  if (!workshopId || typeof workshopId !== "string") {
    throw new ValidationError("workshopId", "Valid workshop ID is required");
  }

  const workshop = await workshopRepository.getById(workshopId);
  if (!workshop) {
    throw new NotFoundError("Workshop");
  }

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

export async function getWorkshopById(
  request: NextRequest,
  workshopId: string,
): Promise<WorkshopDTO> {
  const authResult = await AuthService.verifyApiAuth(request);
  const userId = "user" in authResult ? authResult.user.id : undefined;

  if (!workshopId || typeof workshopId !== "string") {
    throw new ValidationError("workshopId", "Valid workshop ID is required");
  }

  const workshop = await workshopRepository.getById(workshopId, userId);
  if (!workshop) {
    throw new NotFoundError("Workshop");
  }

  return workshop;
}

export async function createWorkshop(
  request: NextRequest,
  workshopData: any,
): Promise<WorkshopDTO> {
  const authResult = await AuthService.verifyApiAuth(request);
  if (!("user" in authResult)) {
    throw new AuthorizationError("Authentication required");
  }

  AuthService.requireRole(["admin"])(authResult.user);

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

export async function updateWorkshop(
  request: NextRequest,
  workshopId: string,
  updateData: any,
): Promise<WorkshopDTO> {
  const authResult = await AuthService.verifyApiAuth(request);
  if (!("user" in authResult)) {
    throw new AuthorizationError("Authentication required");
  }

  AuthService.requireRole(["admin"])(authResult.user);

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

export async function deleteWorkshop(
  request: NextRequest,
  workshopId: string,
): Promise<void> {
  const authResult = await AuthService.verifyApiAuth(request);
  if (!("user" in authResult)) {
    throw new AuthorizationError("Authentication required");
  }

  AuthService.requireRole(["admin"])(authResult.user);

  if (!workshopId || typeof workshopId !== "string") {
    throw new ValidationError("workshopId", "Valid workshop ID is required");
  }

  const deleted = await workshopRepository.delete(workshopId);
  if (!deleted) {
    throw new NotFoundError("Workshop");
  }
}
