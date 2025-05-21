import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  experienceTypes,
  gender,
  majors,
  marketingTypes,
  universities,
  users,
  dietaryRestrictions as dietaryRestrictionsTable,
  interests as interestsTable,
  userRestrictions,
  profiles,
  parkingSituation,
  yearOfStudy,
} from "./schema";
import { z } from "zod";
import { createClient } from "../../utils/supabase/server";
import { db } from "./drizzle";
import { and, AnyTable, eq, inArray, isNotNull } from "drizzle-orm";
import { SupabaseClient } from "@supabase/supabase-js";
import { PgColumn, PgTable, TableConfig } from "drizzle-orm/pg-core";

export async function isRegistered(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const data = await db
    .select()
    .from(users)
    .where(and(eq(users.id, auth.user.id), isNotNull(users.timestamp)));

  return { data: data.length == 1 };
}

export const UserInputSchema = z.object({
  dob: z.date(),
  gender: z.string(),
  university: z.string(),
  previousAttendance: z.boolean(),
  major: z.string(),
  parking: createSelectSchema(parkingSituation),
  schoolEmail: z.string().email(),
  yearOfStudy: createSelectSchema(yearOfStudy),
  experience: z.string(),
  accomodations: z.string(),
  marketing: z.string(),
  dietaryRestrictions: z.array(z.string()),
  interests: z.array(z.string()),
});

export type UserInput = z.infer<typeof UserInputSchema>;

async function registerInterestsAndRestrictions(
  userId: string,
  user: UserInput,
) {
  const { error, success } = await UserInputSchema.safeParseAsync(user);
  if (!success) {
    return { error };
  }

  db.insert(dietaryRestrictionsTable).values(
    user.dietaryRestrictions.map((restriction) => ({ restriction })),
  );
  db.insert(userRestrictions).select(
    db
      .select({ user: profiles.id, restriction: dietaryRestrictionsTable.id })
      .from(dietaryRestrictionsTable)
      .innerJoin(profiles, eq(profiles.id, userId)),
  );

  const interests = await db
    .select()
    .from(interestsTable)
    .where(inArray(interestsTable.interest, user.interests));

  if (interests.length != user.interests.length) {
    return { error: "request contains invalid user interests" };
  }
  return {};
}

export async function register(user: UserInput, supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const id = auth.user.id;
  const genderId = await getOrInsertGenderId(user);
  const otherIds = await getOtherIds(user);

  if (otherIds.length != 1) {
    return {
      error:
        "one or more of marketing, experience, university, or major was not found in the database.",
    };
  }

  await db.insert(users).values({
    id,
    gender: genderId,
    ...otherIds[0],
    dob: user.dob.toDateString(),
    previousAttendance: user.previousAttendance,
    parking: user.parking,
    schoolEmail: user.schoolEmail,
    yearOfStudy: user.yearOfStudy,
    accomodations: user.accomodations,
    timestamp: new Date(),
  });

  return await registerInterestsAndRestrictions(id, user);
}

async function getOtherIds(user: UserInput) {
  return await db
    .select({
      marketing: marketingTypes.id,
      experience: experienceTypes.id,
      university: universities.id,
      major: majors.id,
    })
    .from(marketingTypes)
    .innerJoin(experienceTypes, eq(experienceTypes.experience, user.experience))
    .innerJoin(universities, eq(universities.university, user.university))
    .innerJoin(majors, eq(majors.major, user.major))
    .where(eq(marketingTypes.marketing, user.marketing));
}

async function getOrInsertGenderId(user: UserInput) {
  // We have an "other" option for gender in the google form that models this interaction,
  // hence the insert if not exists
  await db.insert(gender).values({ gender: user.gender }).onConflictDoNothing();

  const entry = await db
    .select()
    .from(gender)
    .where(eq(gender.gender, user.gender))
    .limit(1);

  const genderId = entry[0].id;
  return genderId;
}
