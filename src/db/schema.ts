// dateOfBirth: date, // format: YYYY-MM-DD
// gender: string // Options: Female, Male, Non-binary, Prefer not to say
// school: string, // Would probably need an additional API file if you want to do the autocomplete functionality
// yearOfStudy: int,
// dietaryRestrictions: string[] (Vegetarian, Vegan, Kosher, Halal, Gluten Free, Other(string)),
// skillset: string[],
// experience: string, // Level of Programming (Beginner, intermediate, Expert)

import {
  date,
  integer,
  pgTable,
  text,
  varchar,
  pgSchema,
  uuid,
} from "drizzle-orm/pg-core";
import { db } from "./drizzle";
import { sql } from "drizzle-orm";

const authSchema = pgSchema("auth");

const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  email: varchar({ length: 255 }),
});

// const profiles = pgTable('profiles', {
//   id: uuid("id").primaryKey(),
//   email: varchar({ length: 255 }).notNull(),
//   firstName: varchar('f_name', { length: 255 }),
//   lastName: varchar('l_name', { length: 255 }),
// })

export const dietaryRestrictions = pgTable("dietary_restrictions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  restriction: text().notNull(),
});

// TODO - set non-null constraints
export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id),
  firstName: varchar("f_name", { length: 255 }),
  lastName: varchar("l_name", { length: 255 }),
  dob: date(),
  gender: text(),
  school: text(),
  yearOfStudy: integer("year_of_study"),
  experience: text(),
  //   tShirtSize:
});

export const skills = pgTable("skills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  skill: text().notNull(),
});

// each user can have multiple skills, thus we need a table to attribute multiple skills to each user
export const skillsetAttributions = pgTable("skills_attr", {
  id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  user: integer()
    .references(() => users.id)
    .notNull(),
  skill: integer()
    .references(() => skills.id)
    .notNull(),
});
