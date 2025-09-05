import { z } from "zod";
import {
  PARKING_PREFERENCES,
  LIMITS,
  status,
  adminRole,
  adminStatus,
} from "@/constants";

/**
 * Base user information DTO (what volunteers can see)
 * Contains essential user information without sensitive data
 */
export const UserBasicDTO = z.object({
  /** Unique user identifier */
  id: z.string().uuid(),

  /** User's first name */
  fName: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH),

  /** User's last name */
  lName: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH),

  /** User's university name */
  university: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH),

  /** User's registration status */
  status: z.enum(status.enumValues),

  /** Whether user has checked in to the event */
  checkedIn: z.boolean().default(false),

  /** User's gender */
  gender: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH),
});

export type UserBasicDTO = z.infer<typeof UserBasicDTO>;

/**
 * Full user information DTO (what admins can see)
 * Extends basic info with all user data including sensitive information
 */
export const UserDTO = UserBasicDTO.extend({
  /** User's email address */
  email: z.string().email().max(LIMITS.EMAIL_MAX_LENGTH),

  /** Registration timestamp in ISO format */
  timestamp: z.string().datetime(),

  /** Whether user attended previous events */
  prevAttendance: z.boolean(),

  /** User's major/field of study */
  major: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH),

  /** User's parking preference */
  parking: z.enum(PARKING_PREFERENCES),

  /** User's year of study */
  yearOfStudy: z.string().min(1).max(50),

  /** User's experience level */
  experience: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH),

  /** User's accommodation requirements */
  accommodations: z.string().max(LIMITS.DESCRIPTION_MAX_LENGTH),

  /** User's marketing preference ID */
  marketing: z.number().int().min(1),

  /** Optional resume URL */
  resumeUrl: z.string().url().optional(),

  /** Optional resume filename */
  resumeFilename: z.string().max(LIMITS.RESUME_FILENAME_MAX_LENGTH).optional(),
});

export type UserDTO = z.infer<typeof UserDTO>;

/**
 * Authenticated user information DTO (returned from auth)
 * Contains user identity and authorization information
 */
export const AuthUserDTO = z.object({
  /** Unique user identifier */
  id: z.string().uuid(),

  /** User's email address */
  email: z.string().email().max(LIMITS.EMAIL_MAX_LENGTH),

  /** User's role for authorization */
  role: z.enum([...adminRole.enumValues, "user"]),

  /** User's account status */
  status: z.enum(adminStatus.enumValues),

  /** Whether user has admin privileges */
  isAdmin: z.boolean(),
});

export type AuthUserDTO = z.infer<typeof AuthUserDTO>;

/**
 * User profile information DTO (for public profile)
 * Contains user information suitable for public display
 */
export const UserProfileDTO = z.object({
  /** Unique user identifier */
  id: z.string().uuid(),

  /** User's first name */
  fName: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH),

  /** User's last name */
  lName: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH),

  /** User's email address */
  email: z.string().email().max(LIMITS.EMAIL_MAX_LENGTH),

  /** User's university name */
  university: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH),

  /** User's major/field of study */
  major: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH),

  /** User's year of study */
  yearOfStudy: z.string().min(1).max(50),

  /** User's experience level */
  experience: z.string().min(1).max(LIMITS.NAME_MAX_LENGTH),
});

export type UserProfileDTO = z.infer<typeof UserProfileDTO>;
