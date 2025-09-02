import {
  integer,
  pgTable,
  text,
  varchar,
  uuid,
  boolean,
  pgEnum,
  timestamp,
  customType,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";

// const rlsClient = pgRole("rls_client").existing();

export const dietaryRestrictions = pgTable("dietary_restrictions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  restriction: varchar({ length: 255 }).notNull().unique(),
});

export const userRestrictions = pgTable(
  "user_diet_restrictions",
  {
    user: uuid("id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    restriction: integer()
      .references(() => dietaryRestrictions.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user, table.restriction] }),
  }),
);

export const interests = pgTable("interests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  interest: varchar({ length: 255 }).notNull().unique(),
});

export const userInterests = pgTable(
  "user_interests",
  {
    user: uuid("id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    interest: integer()
      .references(() => interests.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user, table.interest] }),
  }),
);

export const profiles = pgTable("profile", {
  id: uuid("id").primaryKey(),
  email: varchar({ length: 255 }).notNull(),
  firstName: varchar("f_name", { length: 255 }),
  lastName: varchar("l_name", { length: 255 }),
});

export const yearOfStudy = pgEnum("year_of_study", [
  "1st",
  "2nd",
  "3rd",
  "4th+",
  "Recent Grad",
]);

// No  RLS
export const universities = pgTable("universities", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  university: varchar("uni", { length: 255 }).unique().notNull(),
});

// No  RLS
export const majors = pgTable("majors", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  major: varchar({ length: 255 }).unique().notNull(),
});

export const marketingTypes = pgTable("marketing_types", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  marketing: varchar({ length: 255 }).unique().notNull(),
});

export const experienceTypes = pgTable("experience_types", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  experience: varchar({ length: 255 }).unique().notNull(),
});

export const gender = pgTable("gender", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  gender: varchar({ length: 255 }).unique().notNull(),
});

export const parkingSituation = pgEnum("parking_state", [
  "Yes",
  "No",
  "Not sure",
]);

export const status = pgEnum("status", ["confirmed", "pending", "waitlisted"]);

const bytea = customType<{
  data: Buffer;
  default: false;
}>({
  dataType() {
    return "bytea";
  },
});

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id)
    .notNull(),
  email: varchar({ length: 255 }).notNull(),
  firstName: varchar("f_name", { length: 255 }).notNull(),
  lastName: varchar("l_name", { length: 255 }).notNull(),
  gender: integer()
    .references(() => gender.id)
    .notNull(),
  university: integer()
    .references(() => universities.id)
    .notNull(),
  previousAttendance: boolean("prev_attendance").notNull(),
  major: integer()
    .references(() => majors.id)
    .notNull(),
  parking: parkingSituation().notNull(),
  yearOfStudy: yearOfStudy().notNull(),
  experience: integer()
    .references(() => experienceTypes.id)
    .notNull(),
  accommodations: text().notNull(),
  marketing: integer()
    .references(() => marketingTypes.id)
    .notNull(),
  timestamp: timestamp().defaultNow().notNull(),
  status: status().default("pending").notNull(),
  resumeUrl: varchar("resume_url", { length: 500 }),
  resumeFilename: varchar("resume_filename", { length: 255 }),
  checkedIn: boolean("checked_in").default(false).notNull(),
});

// Admin specific enums
export const adminRole = pgEnum("admin_role", [
  "volunteer",
  "admin",
  "super_admin",
]);

export const adminStatus = pgEnum("admin_status", ["active", "inactive"]);

export const admins = pgTable("admins", {
  id: uuid("id")
    .primaryKey()
    .references(() => users.id)
    .notNull(),
  email: varchar({ length: 255 }).notNull(),
  role: adminRole().default("volunteer").notNull(),
  status: adminStatus().default("inactive").notNull(),
});

export const marketingPreferences = pgTable("mktg_preferences", {
  id: uuid("id")
    .primaryKey()
    .references(() => users.id)
    .notNull(),
  sendEmails: boolean("send_emails").default(true).notNull(),
});

export const parkingInfo = pgTable("parking_info", {
  id: uuid("id")
    .primaryKey()
    .references(() => users.id)
    .notNull(),
  licensePlate: varchar("license_plate", { length: 8 }).notNull(),
});
