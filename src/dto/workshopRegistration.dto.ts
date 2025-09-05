import { z } from "zod";

/**
 * Workshop registration DTO
 * Represents a user's registration for a workshop
 */
export const WorkshopRegistrationDTO = z.object({
  /** Unique identifier of the workshop */
  workshopId: z.string().uuid(),

  /** Unique identifier of the user */
  userId: z.string().uuid(),

  /** Timestamp when the registration was created (ISO format) */
  registeredAt: z.string().datetime(),
});

export type WorkshopRegistrationDTO = z.infer<typeof WorkshopRegistrationDTO>;

/**
 * Input DTO for workshop registration
 * Contains the workshop ID to register for
 */
export const RegisterWorkshopDTO = z.object({
  /** ID of the workshop to register for */
  workshopId: z.string().uuid(),
});

export type RegisterWorkshopDTO = z.infer<typeof RegisterWorkshopDTO>;

/**
 * Registration status response DTO
 * Provides information about a user's registration status for a workshop
 */
export const RegistrationStatusDTO = z.object({
  /** ID of the workshop */
  workshopId: z.string().uuid(),

  /** Whether the user is currently registered */
  isRegistered: z.boolean(),

  /** Whether the user can register (considering capacity, status, etc.) */
  canRegister: z.boolean(),

  /** Optional message explaining registration status */
  message: z.string().optional(),
});

export type RegistrationStatusDTO = z.infer<typeof RegistrationStatusDTO>;

/**
 * Workshop registration summary DTO
 * Used for admin views showing registration counts
 */
export const WorkshopRegistrationSummaryDTO = z.object({
  /** Workshop ID */
  workshopId: z.string().uuid(),

  /** Total number of registrations */
  totalRegistrations: z.number().int().min(0),

  /** Maximum capacity of the workshop */
  maxCapacity: z.number().int().min(0),

  /** Whether the workshop is at capacity */
  isFull: z.boolean(),
});

export type WorkshopRegistrationSummaryDTO = z.infer<
  typeof WorkshopRegistrationSummaryDTO
>;
