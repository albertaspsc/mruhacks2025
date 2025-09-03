import {
  pgTable,
  uuid,
  varchar,
  foreignKey,
  integer,
  boolean,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { parkingState, status, yearOfStudy } from "./enums";
import { gender } from "./gender";
import { universities } from "./universities";
import { majors } from "./majors";
import { experienceTypes } from "./experienceTypes";
import { marketingTypes } from "./marketingTypes";

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
