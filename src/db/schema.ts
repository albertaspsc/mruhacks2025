import {
  pgTable,
  uuid,
  varchar,
  foreignKey,
  integer,
  boolean,
  text,
  timestamp,
  unique,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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

// auth.users is modeled at runtime in src/db/auth.tables.ts; not part of migrations

export const profile = pgTable("profile", {
  id: uuid().primaryKey().notNull(),
  email: varchar({ length: 255 }).notNull(),
  fName: varchar("f_name", { length: 255 }),
  lName: varchar("l_name", { length: 255 }),
});

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    fName: varchar("f_name", { length: 255 }).notNull(),
    lName: varchar("l_name", { length: 255 }).notNull(),
    gender: integer().notNull(),
    university: integer().notNull(),
    prevAttendance: boolean("prev_attendance").notNull(),
    major: integer().notNull(),
    parking: parkingState().notNull(),
    yearOfStudy: yearOfStudy().notNull(),
    experience: integer().notNull(),
    accommodations: text().notNull(),
    marketing: integer().notNull(),
    timestamp: timestamp({ mode: "string" }).defaultNow().notNull(),
    status: status().default("pending").notNull(),
    resumeUrl: varchar("resume_url", { length: 500 }),
    resumeFilename: varchar("resume_filename", { length: 255 }),
    checkedIn: boolean("checked_in").default(false).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.gender],
      foreignColumns: [gender.id],
      name: "users_gender_gender_id_fk",
    }),
    foreignKey({
      columns: [table.university],
      foreignColumns: [universities.id],
      name: "users_university_universities_id_fk",
    }),
    foreignKey({
      columns: [table.major],
      foreignColumns: [majors.id],
      name: "users_major_majors_id_fk",
    }),
    foreignKey({
      columns: [table.experience],
      foreignColumns: [experienceTypes.id],
      name: "users_experience_experience_types_id_fk",
    }),
    foreignKey({
      columns: [table.marketing],
      foreignColumns: [marketingTypes.id],
      name: "users_marketing_marketing_types_id_fk",
    }),
  ],
);

export const admins = pgTable(
  "admins",
  {
    id: uuid().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    role: adminRole().default("volunteer").notNull(),
    status: adminStatus().default("inactive").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "admins_id_users_id_fk",
    }),
  ],
);

export const mktgPreferences = pgTable(
  "mktg_preferences",
  {
    id: uuid().primaryKey().notNull(),
    sendEmails: boolean("send_emails").default(true).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "mktg_preferences_id_users_id_fk",
    }),
  ],
);

export const parkingInfo = pgTable(
  "parking_info",
  {
    id: uuid().primaryKey().notNull(),
    licensePlate: varchar("license_plate", { length: 8 }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "parking_info_id_users_id_fk",
    }),
  ],
);

export const interests = pgTable(
  "interests",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "interests_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    interest: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("interests_interest_unique").on(table.interest)],
);

export const dietaryRestrictions = pgTable(
  "dietary_restrictions",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "dietary_restrictions_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    restriction: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("dietary_restrictions_restriction_unique").on(table.restriction),
  ],
);

export const gender = pgTable(
  "gender",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "gender_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    gender: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("gender_gender_unique").on(table.gender)],
);

export const universities = pgTable(
  "universities",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "universities_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    uni: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("universities_uni_unique").on(table.uni)],
);

export const majors = pgTable(
  "majors",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "majors_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    major: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("majors_major_unique").on(table.major)],
);

export const experienceTypes = pgTable(
  "experience_types",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "experience_types_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    experience: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("experience_types_experience_unique").on(table.experience),
  ],
);

export const marketingTypes = pgTable(
  "marketing_types",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "marketing_types_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    marketing: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("marketing_types_marketing_unique").on(table.marketing)],
);

export const userInterests = pgTable(
  "user_interests",
  {
    id: uuid().notNull(),
    interest: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "user_interests_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.interest],
      foreignColumns: [interests.id],
      name: "user_interests_interest_interests_id_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.id, table.interest],
      name: "user_interests_id_interest_pk",
    }),
  ],
);

export const userDietRestrictions = pgTable(
  "user_diet_restrictions",
  {
    id: uuid().notNull(),
    restriction: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "user_diet_restrictions_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.restriction],
      foreignColumns: [dietaryRestrictions.id],
      name: "user_diet_restrictions_restriction_dietary_restrictions_id_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.id, table.restriction],
      name: "user_diet_restrictions_id_restriction_pk",
    }),
  ],
);
