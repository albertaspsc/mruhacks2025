import {
  date,
  integer,
  pgTable,
  text,
  varchar,
  uuid,
  boolean,
  pgEnum,
  timestamp,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authUsers, authenticatedRole } from "drizzle-orm/supabase";
import { setupDB } from "./setup";

export const dietaryRestrictions = pgTable("dietary_restrictions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  restriction: varchar({ length: 255 }).notNull().unique(),
});

export const userRestrictions = pgTable(
  "user_diet_restrictions",
  {
    user: uuid("id")
      .references(() => profiles.id)
      .notNull(),
    restriction: integer()
      .references(() => dietaryRestrictions.id)
      .notNull(),
  },
  (t) => [
    pgPolicy("policy", {
      as: "restrictive",
      to: authenticatedRole,
      for: "all",
      using: sql`((select auth.uid()) = ${t.user}) OR ((select auth.uid()) = ${admins.id})`,
    }),
  ],
).enableRLS();

export const interests = pgTable("interests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  interest: varchar({ length: 255 }).notNull().unique(),
});

export const userInterests = pgTable(
  "user_interests",
  {
    user: uuid("id")
      .references(() => profiles.id)
      .notNull(),
    interest: integer()
      .references(() => interests.id)
      .notNull(),
  },
  (t) => [
    pgPolicy("policy", {
      as: "restrictive",
      to: authenticatedRole,
      for: "all",
      using: sql`((select auth.uid()) = ${t.user}) OR ((select auth.uid()) = ${admins.id})`,
    }),
  ],
).enableRLS();

export const profiles = pgTable(
  "profile",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id),
    email: varchar({ length: 255 }).notNull(),
    firstName: varchar("f_name", { length: 255 }),
    lastName: varchar("l_name", { length: 255 }),
  },
  (t) => [
    pgPolicy("policy", {
      as: "restrictive",
      to: authenticatedRole,
      for: "all",
      using: sql`((select auth.uid()) = ${t.id})`,
    }),
  ],
).enableRLS();

export const yearOfStudy = pgEnum("year_of_study", [
  "1st",
  "2nd",
  "3rd",
  "4th+",
  "Recent Grad",
]);

export const universities = pgTable("universities", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  university: varchar("uni", { length: 255 }).unique(),
});

export const majors = pgTable("majors", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  major: varchar({ length: 255 }).unique(),
});

export const marketingTypes = pgTable("marketing_types", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  marketing: varchar({ length: 255 }).unique(),
});

export const experienceTypes = pgTable("experience_types", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  experience: varchar({ length: 255 }).unique(),
});

export const gender = pgTable("gender", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  gender: varchar({ length: 255 }).unique(),
});

export const parkingSituation = pgEnum("parking_state", [
  "Yes",
  "No",
  "Not sure",
]);

export const participantStatus = pgEnum("participant_status", [
  "confirmed",
  "pending",
  "waitlisted",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => profiles.id)
      .notNull(),
    dob: date().notNull(),
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
    schoolEmail: varchar("school_email", { length: 255 }).notNull(),
    yearOfStudy: yearOfStudy().notNull(),
    experience: integer()
      .references(() => experienceTypes.id)
      .notNull(),
    accomodations: text().notNull(),
    marketing: integer()
      .references(() => marketingTypes.id)
      .notNull(),
    timestamp: timestamp(),
    status: participantStatus().default(participantStatus.enumValues[2]),
  },
  (t) => [
    pgPolicy("policy", {
      as: "restrictive",
      to: authenticatedRole,
      for: "all",
      using: sql`((select auth.uid()) = ${t.id}) OR ((select auth.uid()) = ${admins.id})`,
    }),
  ],
).enableRLS();

export const admins = pgTable(
  "admins",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => profiles.id)
      .notNull(),
    email: varchar({ length: 255 }).notNull(),
  },
  (t) => [
    pgPolicy("policy", {
      as: "restrictive",
      to: authenticatedRole,
      for: "all",
      using: sql`true`,
      withCheck: sql`((select auth.uid()) = ${t.id})`,
    }),
  ],
).enableRLS();

setupDB();
