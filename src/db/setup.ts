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

export async function insertSampleValues() {
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
