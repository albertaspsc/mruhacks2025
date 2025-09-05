import { z } from "zod";
import { REGEX, LIMITS, DEFAULTS } from "@/constants";

/**
 * Workshop DTO - represents workshop data returned to clients
 * Contains all workshop information including registration status
 */
export const WorkshopDTO = z.object({
  /** Unique identifier for the workshop */
  id: z.string().uuid(),

  /** Workshop title */
  title: z.string().min(1).max(LIMITS.TITLE_MAX_LENGTH),

  /** Optional workshop description */
  description: z.string().max(LIMITS.DESCRIPTION_MAX_LENGTH).optional(),

  /** Workshop date in ISO format (YYYY-MM-DD) */
  date: z.string().regex(REGEX.ISO_DATE),

  /** Workshop start time in 24-hour format (HH:mm) */
  startTime: z.string().regex(REGEX.TIME_24H),

  /** Workshop end time in 24-hour format (HH:mm) */
  endTime: z.string().regex(REGEX.TIME_24H),

  /** Optional workshop location */
  location: z.string().max(LIMITS.LOCATION_MAX_LENGTH).optional(),

  /** Maximum number of participants */
  maxCapacity: z.number().int().min(0),

  /** Current number of registrations */
  currentRegistrations: z.number().int().min(0).default(0),

  /** Whether the current user is registered */
  isRegistered: z.boolean().default(false),

  /** Whether the workshop is at capacity */
  isFull: z.boolean().default(false),

  /** Event name this workshop belongs to */
  eventName: z.string().default(DEFAULTS.EVENT_NAME),

  /** Whether the workshop is active and visible */
  isActive: z.boolean().default(DEFAULTS.WORKSHOP_IS_ACTIVE),
});

export type WorkshopDTO = z.infer<typeof WorkshopDTO>;

/**
 * Input DTO for creating new workshops
 * Requires all essential workshop information
 */
export const CreateWorkshopDTO = z
  .object({
    /** Workshop title (required, 1-255 characters) */
    title: z.string().min(1).max(LIMITS.TITLE_MAX_LENGTH),

    /** Optional workshop description */
    description: z.string().max(LIMITS.DESCRIPTION_MAX_LENGTH).optional(),

    /** Workshop date in ISO format (required) */
    date: z.string().regex(REGEX.ISO_DATE, "Date must be in YYYY-MM-DD format"),

    /** Workshop start time in 24-hour format (required) */
    startTime: z.string().regex(REGEX.TIME_24H, "Time must be in HH:mm format"),

    /** Workshop end time in 24-hour format (required) */
    endTime: z.string().regex(REGEX.TIME_24H, "Time must be in HH:mm format"),

    /** Optional workshop location */
    location: z.string().max(LIMITS.LOCATION_MAX_LENGTH).optional(),

    /** Maximum capacity (must be non-negative) */
    maxCapacity: z.number().int().min(0),

    /** Event name (defaults to current event) */
    eventName: z.string().default(DEFAULTS.EVENT_NAME),
  })
  .refine(
    (data) => {
      // Validate that end time is after start time
      const start = new Date(`2000-01-01T${data.startTime}:00`);
      const end = new Date(`2000-01-01T${data.endTime}:00`);
      return end > start;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export type CreateWorkshopDTO = z.infer<typeof CreateWorkshopDTO>;

/**
 * Input DTO for updating existing workshops
 * All fields are optional for partial updates
 */
export const UpdateWorkshopDTO = z
  .object({
    /** Optional title update */
    title: z.string().min(1).max(LIMITS.TITLE_MAX_LENGTH).optional(),

    /** Optional description update */
    description: z
      .string()
      .max(LIMITS.DESCRIPTION_MAX_LENGTH)
      .optional()
      .nullable(),

    /** Optional date update */
    date: z
      .string()
      .regex(REGEX.ISO_DATE, "Date must be in YYYY-MM-DD format")
      .optional(),

    /** Optional start time update */
    startTime: z
      .string()
      .regex(REGEX.TIME_24H, "Time must be in HH:mm format")
      .optional(),

    /** Optional end time update */
    endTime: z
      .string()
      .regex(REGEX.TIME_24H, "Time must be in HH:mm format")
      .optional(),

    /** Optional location update */
    location: z.string().max(LIMITS.LOCATION_MAX_LENGTH).optional().nullable(),

    /** Optional capacity update */
    maxCapacity: z.number().int().min(0).optional(),

    /** Optional workshop status update */
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If both start and end times are provided, validate that end time is after start time
      if (data.startTime && data.endTime) {
        const start = new Date(`2000-01-01T${data.startTime}:00`);
        const end = new Date(`2000-01-01T${data.endTime}:00`);
        return end > start;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export type UpdateWorkshopDTO = z.infer<typeof UpdateWorkshopDTO>;
