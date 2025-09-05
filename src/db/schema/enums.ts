import { pgEnum } from "drizzle-orm/pg-core";
import {
  INTEREST_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
  MARKETING_OPTIONS,
  YEAR_OF_STUDY_OPTIONS,
  PARKING_OPTIONS,
} from "@/data/registrationOptions";

// Create enums from TypeScript constants
export const interestEnum = pgEnum("interest", INTEREST_OPTIONS);
export const dietaryRestrictionEnum = pgEnum(
  "dietary_restriction",
  DIETARY_RESTRICTION_OPTIONS,
);
export const marketingEnum = pgEnum("marketing_type", MARKETING_OPTIONS);
export const yearOfStudyEnum = pgEnum("year_of_study", YEAR_OF_STUDY_OPTIONS);
export const parkingEnum = pgEnum("parking_option", PARKING_OPTIONS);

// Gender enum (using numeric values for backward compatibility)
export const genderEnum = pgEnum("gender", ["1", "2", "3", "4"]);

// Experience enum (using numeric values for backward compatibility)
export const experienceEnum = pgEnum("experience_type", ["1", "2", "3", "4"]);

// Status enum for users
export const status = pgEnum("status", [
  "pending",
  "confirmed",
  "waitlisted",
  "rejected",
]);

// Admin role and status enums
export const adminRole = pgEnum("admin_role", [
  "super_admin",
  "admin",
  "moderator",
  "volunteer",
]);
export const adminStatus = pgEnum("admin_status", [
  "active",
  "inactive",
  "suspended",
]);
