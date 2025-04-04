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

export const dietaryRestrictions = pgTable("dietary_restrictions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  restriction: text().notNull(),
});

export const interests = pgTable("interests", {
  id: integer().generatedAlwaysAsIdentity(),
  interest: varchar({ length: 255 }),
});

export const userInterests = pgTable("user_interests", {
  id: integer().generatedAlwaysAsIdentity(),
  user: uuid("id").references(() => authUsers.id),
  interest: integer().references(() => interests.id),
});

// TODO Trigger for google, github

export const profiles = pgTable("profile", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id),
  email: varchar({ length: 255 }).notNull(),
  firstName: varchar("f_name", { length: 255 }).notNull(),
  lastName: varchar("l_name", { length: 255 }).notNull(),
});

// TODO - set non-null constraints
export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id),
  dob: date().notNull(),
  gender: text().notNull(),
  school: text().notNull(),
  yearOfStudy: integer("year_of_study").notNull(),
  accomodations: text(),
});
