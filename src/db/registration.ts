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
  userInterests,
  yearOfStudy,
  parkingSituation,
} from "./schema";
import { createClient } from "@/utils/supabase/server";
import { db } from "./drizzle";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  RegistrationInput,
  RegistrationSchema,
} from "@/context/RegisterFormContext";
import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";

const LocalRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  university: z.string().min(1, "University is required"),
  previousAttendance: z.boolean(),
  major: z.string().min(1, "Major is required"),
  parking: createSelectSchema(parkingSituation),
  email: z.string().email("Valid email is required"),
  yearOfStudy: createSelectSchema(yearOfStudy),
  experience: z.string().min(1, "Experience level is required"),
  accommodations: z.string(),
  dietaryRestrictions: z.array(z.string()),
  interests: z.array(z.string()).min(1, "At least one interest is required"),
  marketing: z.string().min(1, "Please tell us how you heard about us"),
  resume: z.string().optional(), // Changed from File to string (URL)
  checkedIn: z.boolean().optional(),
});

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
  // Handle dietary restrictions
  if (user.dietaryRestrictions.length > 0) {
    // Insert new dietary restrictions - ignores duplicates
    await db
      .insert(dietaryRestrictionsTable)
      .values(user.dietaryRestrictions.map((restriction) => ({ restriction })))
      .onConflictDoNothing();

    // Get the IDs of the dietary restrictions
    const restrictionIds = await db
      .select({ id: dietaryRestrictionsTable.id })
      .from(dietaryRestrictionsTable)
      .where(
        inArray(dietaryRestrictionsTable.restriction, user.dietaryRestrictions),
      );

    // Link user to dietary restrictions
    await db.insert(userRestrictions).values(
      restrictionIds.map(({ id }) => ({
        user: userId,
        restriction: id,
      })),
    );
  }

  // Handle interests
  const interests = await db
    .select()
    .from(interestsTable)
    .where(inArray(interestsTable.interest, user.interests));

  if (interests.length != user.interests.length) {
    return { error: "request contains invalid user interests" };
  }

  await db
    .insert(userInterests)
    .values(interests.map(({ id }) => ({ interest: id, user: userId })));

  return {};
}

export async function register(
  user: RegistrationInput,
  supabase?: SupabaseClient,
) {
  console.log("REGISTRATION - Starting registration for:", user.email);

  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Auth error:", authError);
    return { error: authError };
  }

  // Check if user is already registered
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, auth.user.id))
    .limit(1);

  if (existingUser.length > 0) {
    console.log("User already registered..");
    return { success: true, message: "User already registered" };
  }

  // USE LOCAL VALIDATION SCHEMA
  const result = LocalRegistrationSchema.safeParse(user);
  if (!result.success) {
    console.error("Validation failed:", result.error.issues);
    return {
      error: result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", "),
    };
  }
  console.log("Validation passed");

  if (!auth.user.email) {
    return { error: "user not registered with email" };
  }

  const id = auth.user.id;
  const genderId = await getOrInsertGenderId(user);
  const otherIds = await getOtherIds(user);

  if (otherIds.length != 1) {
    console.log("Other IDs failed:", otherIds);
    return {
      error:
        "one or more of marketing, experience, university, or major was not found in the database.",
    };
  }

  try {
    // Extract resume filename from URL if present
    let resumeFilename: string | undefined;
    if (user.resume) {
      try {
        const url = new URL(user.resume);
        resumeFilename = url.pathname.split("/").pop() || undefined;
      } catch (e) {
        console.warn("Could not extract filename from resume URL");
      }
    }

    await db.insert(users).values({
      id,
      gender: genderId,
      ...otherIds[0],
      previousAttendance: user.previousAttendance,
      parking: user.parking,
      yearOfStudy: user.yearOfStudy,
      accommodations: user.accommodations,
      email: auth.user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      timestamp: new Date(),
      marketing: otherIds[0].marketing,
      checkedIn: false,
      status: "pending",
      resumeUrl: user.resume, // Save the resume URL
      resumeFilename, // Save the extracted filename
    });

    console.log("User created successfully");
  } catch (insertError) {
    console.error("User insert failed:", insertError);
    return { error: `Database insert failed: ${insertError}` };
  }

  const { error: multiOptionsError } = await registerInterestsAndRestrictions(
    id,
    user,
  );
  if (multiOptionsError) {
    return { error: multiOptionsError };
  }

  console.log("Registration completed successfully");
  return { success: true };
}

async function getOtherIds(user: RegistrationInput) {
  console.log(user);

  // Auto-insert university and major if they don't exist
  await Promise.all([
    // Insert university if it doesn't exist
    db
      .insert(universities)
      .values({ university: user.university })
      .onConflictDoNothing(),

    // Insert major if it doesn't exist
    db.insert(majors).values({ major: user.major }).onConflictDoNothing(),
  ]);

  // marketing and experience must exist - university and major will exist after insert
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

// Keep this function for other use cases, but it's no longer used in registration
export async function uploadResume(
  resume: File,
  userId: string,
  supabase?: SupabaseClient,
): Promise<{ success?: boolean; resumeUrl?: string; error?: any }> {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  if (!auth.user) {
    return { error: new Error("User not authenticated") };
  }

  try {
    const fileExt = resume.name.split(".").pop();
    const timestamp = Date.now();
    const fileName = `resume_${userId}_${timestamp}.${fileExt}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, resume, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return { error: uploadError };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("resumes").getPublicUrl(fileName);

    if (!publicUrl) {
      return { error: new Error("Failed to generate public URL") };
    }

    // Just return the URL - don't save to database here
    return {
      success: true,
      resumeUrl: publicUrl,
    };
  } catch (error) {
    console.error("Resume upload error:", error);
    return { error };
  }
}
