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

// const profileInfo = pgTable('profiles', {

// })

await db.execute(sql`
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
  return new;
end;
$$;
-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();`);

export const dietaryRestrictions = pgTable("dietary_restrictions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  restriction: text().notNull(),
});

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  dob: date().notNull(),
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
