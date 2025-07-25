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
  resumes,
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
  resume: z.instanceof(File).optional(),
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

// export async function register(
//   user: RegistrationInput,
//   supabase?: SupabaseClient,
// ) {
//   if (!supabase) {
//     supabase = await createClient();
//   }

//   const { data: auth, error: authError } = await supabase.auth.getUser();
//   if (authError) {
//     return { error: authError };
//   }

//   const result = RegistrationSchema.safeParse(user);
//   const { error, success } = result;

//   if (!success) {
//     return { error };
//   }

//   if (!auth.user.email) {
//     return { error: "user not registered with email" };
//   }

//   const id = auth.user.id;
//   const genderId = await getOrInsertGenderId(user);
//   const otherIds = await getOtherIds(user);

//   if (otherIds.length != 1) {
//     console.log(otherIds);
//     return {
//       error:
//         "one or more of marketing, experience, university, or major was not found in the database.",
//     };
//   }

//   await db.insert(users).values({
//     id,
//     gender: genderId,
//     ...otherIds[0],
//     previousAttendance: user.previousAttendance,
//     parking: user.parking,
//     yearOfStudy: user.yearOfStudy,
//     accommodations: user.accommodations,
//     email: auth.user.email,
//     firstName: user.firstName,
//     lastName: user.lastName,
//     timestamp: new Date(),
//     marketing: otherIds[0].marketing,
//   });

//   const { error: multiOptionsError } = await registerInterestsAndRestrictions(
//     id,
//     user,
//   );
//   if (multiOptionsError) {
//     return { error: multiOptionsError };
//   }

//   if (user.resume) {
//     const resumeResult = await saveResume(user.resume, user, supabase);
//     if (resumeResult?.error) {
//       console.error('Failed to save resume:', resumeResult.error);
//     }
//   }
//   return {};
// }

export async function register(
  user: RegistrationInput,
  supabase?: SupabaseClient,
) {
  console.log("🚀 REGISTRATION - Starting registration for:", user.email);

  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("❌ Auth error:", authError);
    return { error: authError };
  }

  // CHECK IF USER ALREADY EXISTS
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, auth.user.id))
    .limit(1);

  if (existingUser.length > 0) {
    console.log("✅ User already registered, skipping...");
    return { success: true, message: "User already registered" };
  }

  // USE LOCAL VALIDATION SCHEMA
  const result = LocalRegistrationSchema.safeParse(user);
  if (!result.success) {
    console.error("❌ Validation failed:", result.error.issues);
    return {
      error: result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", "),
    };
  }
  console.log("✅ Validation passed");

  if (!auth.user.email) {
    return { error: "user not registered with email" };
  }

  const id = auth.user.id;
  const genderId = await getOrInsertGenderId(user);
  const otherIds = await getOtherIds(user);

  if (otherIds.length != 1) {
    console.log("❌ Other IDs failed:", otherIds);
    return {
      error:
        "one or more of marketing, experience, university, or major was not found in the database.",
    };
  }

  try {
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
    });

    console.log("✅ User created successfully");
  } catch (insertError) {
    console.error("❌ User insert failed:", insertError);
    return { error: `Database insert failed: ${insertError}` };
  }

  const { error: multiOptionsError } = await registerInterestsAndRestrictions(
    id,
    user,
  );
  if (multiOptionsError) {
    return { error: multiOptionsError };
  }

  if (user.resume) {
    const resumeResult = await saveResume(user.resume, user, supabase);
    if (resumeResult?.error) {
      console.error("⚠️ Resume save failed:", resumeResult.error);
      // Don't fail registration for resume issues
    }
  }

  console.log("🎉 Registration completed successfully");
  return { success: true };
}

{
  /* End of debug */
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

async function saveResume(
  resume: File,
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

  try {
    // Organize by last name (folder), first name + last name is in filename
    const cleanLastName = user.lastName.toLowerCase().replace(/[^a-z0-9]/g, "");

    const cleanFirstName = user.firstName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const fileExt = resume.name.split(".").pop();
    const timestamp = Date.now();

    // Structure: lastName/firstName_lastName_timestamp.ext
    const fileName = `${cleanLastName}/${cleanFirstName}_${cleanLastName}_${timestamp}.${fileExt}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, resume, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Resume upload error:", uploadError);
      return { error: uploadError };
    }

    // Save file metadata to database
    await db.insert(resumes).values({
      id: auth.user.id,
      fileName: resume.name,
      filePath: uploadData.path,
      fileSize: resume.size,
      mimeType: resume.type,
      uploadedAt: new Date(),
    });

    return { success: true, filePath: uploadData.path };
  } catch (error) {
    console.error("Resume save error:", error);
    return { error };
  }
}
