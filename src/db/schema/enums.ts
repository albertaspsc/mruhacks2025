import { pgEnum } from "drizzle-orm/pg-core";

export const adminRole = pgEnum("admin_role", [
  "volunteer",
  "admin",
  "super_admin",
]);

export const adminStatus = pgEnum("admin_status", ["active", "inactive"]);

export const parkingState = pgEnum("parking_state", ["Yes", "No", "Not sure"]);

export const status = pgEnum("status", ["confirmed", "pending", "waitlisted"]);

export const yearOfStudy = pgEnum("year_of_study", [
  "1st",
  "2nd",
  "3rd",
  "4th+",
  "Recent Grad",
]);
