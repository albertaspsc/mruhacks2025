import {
  date,
  integer,
  pgTable,
  text,
  varchar,
  pgSchema,
  uuid,
  boolean,
  pgEnum,
  timestamp,
} from "drizzle-orm/pg-core";
import { db } from "./drizzle";
import { sql } from "drizzle-orm";

const authSchema = pgSchema("auth");

const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  email: varchar({ length: 255 }),
});

export const dietaryRestrictions = pgTable("dietary_restrictions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  restriction: varchar({ length: 255 }).notNull(),
});

export const userRestrictions = pgTable("user_dietary_restrictions", {
  user: uuid("id")
    .references(() => authUsers.id)
    .notNull(),
  restriction: integer()
    .references(() => dietaryRestrictions.id)
    .notNull(),
});

export const interests = pgTable("interests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  interest: varchar({ length: 255 }).notNull(),
});

export const userInterests = pgTable("user_interests", {
  user: uuid("id")
    .references(() => authUsers.id)
    .notNull(),
  interest: integer()
    .references(() => interests.id)
    .notNull(),
});

export const profiles = pgTable("profile", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id),
  email: varchar({ length: 255 }).notNull(),
  firstName: varchar("f_name", { length: 255 }),
  lastName: varchar("l_name", { length: 255 }),
});

db.execute(sql`
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
language plpgsql
security definer set search_path = ''
as $$

BEGIN
  INSERT INTO ${profiles} (${profiles.id}, ${profiles.firstName}, ${profiles.lastName}, ${profiles.email})
    VALUES (
      new.id, 
      SPLIT_PART(new.raw_user_meta_data ->> 'full_name', ' ', 1), 
      SPLIT_PART(new.raw_user_meta_data ->> 'full_name', ' ', 2),
      new.email
    );
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();`);

export const yearOfStudy = pgEnum("year_of_study", [
  "1st",
  "2nd",
  "3rd",
  "4th+",
  "Recent Grad",
]);

export const universities = pgTable("universities", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  university: varchar("uni", { length: 255 }),
});

export const majors = pgTable("majors", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  major: varchar({ length: 255 }),
});

export const marketingTypes = pgTable("marketing_types", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  marketing: varchar({ length: 255 }),
});

export const experienceTypes = pgTable("experience_types", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  experience: varchar({ length: 255 }),
});

export const gender = pgTable("gender", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  gender: varchar({ length: 255 }),
});

export const parkingSituation = pgEnum("parking_state", [
  "Yes",
  "No",
  "Not sure",
]);

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id)
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
  // schoolEmail: varchar('school_email', { length: 255 }).notNull(),
  yearOfStudy: yearOfStudy().notNull(),
  experience: integer()
    .references(() => experienceTypes.id)
    .notNull(),
  accomodations: text().notNull(),
  marketing: integer()
    .references(() => marketingTypes.id)
    .notNull(),
  timestamp: timestamp(),
});

db.execute(sql`
CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  new.timestamp := CURRENT_TIMESTAMP;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_timestamp
BEFORE INSERT ON users
FOR EACH ROW EXECUTE PROCEDURE update_users_timestamp();`);
