import { sql } from "drizzle-orm";
import { db } from "./drizzle";
import {
  dietaryRestrictions,
  experienceTypes,
  gender,
  interests,
  majors,
  marketingTypes,
  universities,
} from "./schema";

async function insertSampleValues() {
  await db
    .insert(dietaryRestrictions)
    .values(
      [
        "Kosher",
        "Vegetarian",
        "Vegan",
        "Halal",
        "Gluten-free",
        "Peanuts and Treenuts allergy",
      ].map((restriction) => ({ restriction })),
    )
    .onConflictDoNothing();
  await db
    .insert(interests)
    .values(
      [
        "Mobile App Development",
        "Web Development",
        "Data Science and ML",
        "Design and User Experience (UX/UI)",
        "Game Development",
      ].map((interest) => ({ interest })),
    )
    .onConflictDoNothing();
  await db
    .insert(universities)
    .values(["MRU", "U of C"].map((university) => ({ university })))
    .onConflictDoNothing();
  await db
    .insert(majors)
    .values(
      ["BCIS", "Data Science", "Computer Science", "Mathematics"].map(
        (major) => ({ major }),
      ),
    )
    .onConflictDoNothing();
  await db
    .insert(marketingTypes)
    .values(
      [
        "Poster",
        "Social Media",
        "Word of Mouth",
        "Website/Googling it",
        "Attended the event before",
      ].map((marketing) => ({ marketing })),
    )
    .onConflictDoNothing();
  await db
    .insert(experienceTypes)
    .values(
      ["Beginner", "Intermediate", "Advanced", "Expert"].map((experience) => ({
        experience,
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(gender)
    .values(
      ["Male", "Female", "Other", "Prefer not to say"].map((gender) => ({
        gender,
      })),
    )
    .onConflictDoNothing();
}

async function createTriggers() {
  await db.execute(sql`CREATE OR REPLACE FUNCTION public.copy_user_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profile (id, email, f_name, l_name)
  VALUES (NEW.id, NEW.email, SPLIT_PART(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), SPLIT_PART(NEW.raw_user_meta_data ->> 'full_name', ' ', 2))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_copy_user_to_profiles
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.copy_user_to_profiles();`);

  await db.execute(sql`CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
new.timestamp := CURRENT_TIMESTAMP;
RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_users_timestamp
BEFORE INSERT ON users
FOR EACH ROW EXECUTE PROCEDURE update_users_timestamp();`);
}

export async function setupDB() {
  insertSampleValues();
  createTriggers();
}
