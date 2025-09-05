import "dotenv/config";
import { db } from "../src/db/drizzle";
import {
  marketingTypes,
  universities,
  majors,
  interests,
  dietaryRestrictions,
  gender,
  experienceTypes,
} from "../src/db/schema";

async function main() {
  await db
    .insert(marketingTypes)
    .values([
      { marketing: "Poster" },
      { marketing: "Social Media" },
      { marketing: "Word of Mouth" },
      { marketing: "Website/Googling it" },
      { marketing: "Attended the event before" },
      { marketing: "Other" },
    ])
    .onConflictDoNothing();

  await db
    .insert(universities)
    .values([
      { uni: "MRU" },
      { uni: "U of C" },
      { uni: "SAIT" },
      { uni: "Athabasca" },
      { uni: "UBC" },
      { uni: "Mount Royal University" },
    ])
    .onConflictDoNothing();

  await db
    .insert(interests)
    .values([
      { interest: "AI/ML" },
      { interest: "Web Dev" },
      { interest: "Mobile" },
      { interest: "Games" },
    ])
    .onConflictDoNothing();

  await db
    .insert(dietaryRestrictions)
    .values([
      { restriction: "Vegan" },
      { restriction: "Vegetarian" },
      { restriction: "Halal" },
      { restriction: "Gluten-free" },
      { restriction: "Nut-free" },
      { restriction: "Dairy-free" },
    ])
    .onConflictDoNothing();

  await db
    .insert(gender)
    .values([
      { gender: "Male" },
      { gender: "Female" },
      { gender: "Non-binary" },
      { gender: "Prefer not to say" },
    ])
    .onConflictDoNothing();

  await db
    .insert(experienceTypes)
    .values([
      { experience: "Beginner" },
      { experience: "Intermediate" },
      { experience: "Advanced" },
    ])
    .onConflictDoNothing();
}

main()
  .then(() => {
    console.log("Seeding complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
