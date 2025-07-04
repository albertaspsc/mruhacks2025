"use server";
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
  userInterests,
} from "./schema";
import { createClient } from "../../utils/supabase/server";
import { db } from "./drizzle";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  RegistrationInput,
  RegistrationSchema,
} from "@/context/RegisterFormContext";

export type Registration = NonNullable<
  Awaited<ReturnType<typeof getRegistration>>["data"]
>;

export async function getRegistration(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const data = await db.select().from(users).where(eq(users.id, auth.user.id));

  return { data: data[0] };
}

async function registerInterestsAndRestrictions(
  userId: string,
  user: RegistrationInput,
) {
  const { error, success } = await RegistrationSchema.safeParseAsync(user);
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

  db.insert(userInterests).values(
    interests.map(({ id }) => ({ interest: id, user: userId })),
  );

  return {};
}

export async function register(
  user: RegistrationInput,
  supabase?: SupabaseClient,
) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  if (!auth.user.email) {
    return { error: "user not registered with email" };
  }

  const id = auth.user.id;
  const genderId = await getOrInsertGenderId(user);
  const otherIds = await getOtherIds(user);

  if (otherIds.length != 1) {
    console.log(otherIds);
    return {
      error:
        "one or more of marketing, experience, university, or major was not found in the database.",
    };
  }

  await db.insert(users).values({
    id,
    gender: genderId,
    ...otherIds[0],
    previousAttendance: user.previousAttendance,
    parking: user.parking,
    schoolEmail: user.schoolEmail,
    yearOfStudy: user.yearOfStudy,
    accommodations: user.accommodations,
    email: auth.user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    timestamp: new Date(),
    marketing: 1,
  });

  return await registerInterestsAndRestrictions(id, user);
}

async function getOtherIds(user: RegistrationInput) {
  console.log(user);
  return await db
    .select({
      marketing: marketingTypes.id,
      experience: experienceTypes.id,
      university: universities.id,
      major: majors.id,
    })
    .from(experienceTypes)
    .innerJoin(marketingTypes, eq(marketingTypes.marketing, user.marketing))
    .innerJoin(universities, eq(universities.university, user.university))
    .innerJoin(majors, eq(majors.major, user.major))
    .where(eq(experienceTypes.experience, user.experience));
}

async function getOrInsertGenderId(user: RegistrationInput) {
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

export async function getMajorsAndUniversities() {
  const [majorsResult, universitiesResult] = await Promise.all([
    db.select().from(majors),
    db.select().from(universities),
  ]);

  return {
    majors: majorsResult.map((row) => row.major),
    universities: universitiesResult.map((row) => row.university),
  };
}

export async function getStaticOptions() {
  const [dietary, interest, marketing] = await Promise.all([
    db.select().from(dietaryRestrictionsTable),
    db.select().from(interestsTable),
    db.select().from(marketingTypes),
  ]);

  return {
    dietaryRestrictions: dietary.map((x) => x.restriction),
    interests: interest.map((x) => x.interest),
    marketingTypes: marketing.map((x) => x.marketing),
  };
}
