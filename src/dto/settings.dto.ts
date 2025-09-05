import { z } from "zod";
import { PARKING_PREFERENCES, LIMITS, DEFAULTS } from "@/constants";

/**
 * Parking preferences DTO
 * Contains user's parking preference and license plate information
 */
export const ParkingPreferencesDTO = z
  .object({
    /** User's parking preference */
    parkingPreference: z.enum(PARKING_PREFERENCES),

    /** License plate number (required if parking preference is "Yes") */
    licensePlate: z.string().max(20).optional(),
  })
  .refine(
    (data) => {
      // If parking preference is "Yes", license plate is required
      if (data.parkingPreference === "Yes") {
        return data.licensePlate && data.licensePlate.trim().length > 0;
      }
      return true;
    },
    {
      message: "License plate is required when parking preference is 'Yes'",
      path: ["licensePlate"],
    },
  );

export type ParkingPreferencesDTO = z.infer<typeof ParkingPreferencesDTO>;

/**
 * Marketing preferences DTO
 * Contains user's email marketing preferences
 */
export const MarketingPreferencesDTO = z.object({
  /** Whether user wants to receive marketing emails */
  sendEmails: z.boolean().default(DEFAULTS.MARKETING_EMAILS),
});

export type MarketingPreferencesDTO = z.infer<typeof MarketingPreferencesDTO>;

/**
 * User profile update DTO
 * For updating basic user profile information
 */
export const UserProfileUpdateDTO = z.object({
  /** Optional first name update */
  firstName: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH).optional(),

  /** Optional last name update */
  lastName: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH).optional(),

  /** Optional email update */
  email: z.string().email().max(LIMITS.EMAIL_MAX_LENGTH).optional(),
});

export type UserProfileUpdateDTO = z.infer<typeof UserProfileUpdateDTO>;

/**
 * User name only update DTO
 * For updating just the user's name information
 */
export const UserNameUpdateDTO = z.object({
  /** User's first name */
  firstName: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH),

  /** User's last name */
  lastName: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH),
});

export type UserNameUpdateDTO = z.infer<typeof UserNameUpdateDTO>;

/**
 * Combined user settings response DTO
 * Contains all user preferences and settings
 */
export const UserSettingsDTO = z.object({
  /** User's parking preferences */
  parking: ParkingPreferencesDTO,

  /** User's marketing preferences */
  marketing: MarketingPreferencesDTO,
});

export type UserSettingsDTO = z.infer<typeof UserSettingsDTO>;
