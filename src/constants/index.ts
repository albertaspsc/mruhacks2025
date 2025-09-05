/**
 * Application constants for validation, enums, and configuration
 */

// Regular expressions
export const REGEX = {
  TIME_24H: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  ISO_DATE: /^\d{4}-\d{2}-\d{2}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

// Import enums from existing sources to avoid duplication
export {
  // From database schema enums
  adminRole,
  adminStatus,
  status,
} from "@/db/schema/enums";

export {
  // From registration options
  PARKING_OPTIONS as PARKING_PREFERENCES,
  MARKETING_OPTIONS as MARKETING_TYPES,
  INTEREST_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
  YEAR_OF_STUDY_OPTIONS,
  EXPERIENCE_OPTIONS,
  GENDER_OPTIONS,
} from "@/data/registrationOptions";

// Validation limits
export const LIMITS = {
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 2000,
  NAME_MAX_LENGTH: 255,
  EMAIL_MAX_LENGTH: 255,
  LOCATION_MAX_LENGTH: 255,
  RESUME_FILENAME_MAX_LENGTH: 255,
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
} as const;

// Default values
export const DEFAULTS = {
  EVENT_NAME: "mruhacks2025",
  USER_ROLE: "user",
  ADMIN_STATUS: "active",
  WORKSHOP_IS_ACTIVE: true,
  MARKETING_EMAILS: true,
  PAGINATION_LIMIT: 50,
  PAGINATION_OFFSET: 0,
} as const;

// Re-export types from registration options for convenience
export type {
  InterestOption,
  DietaryRestrictionOption,
  MarketingOption,
  YearOfStudy,
  ExperienceOption,
  ParkingOption,
  GenderOption,
} from "@/data/registrationOptions";
