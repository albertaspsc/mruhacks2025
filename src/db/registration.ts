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
  resume: z.string().optional(),
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

// export async function register(
//   user: RegistrationInput,
//   supabase?: SupabaseClient,
// ) {
//   console.log("REGISTRATION - Starting registration for:", user.email);

//   if (!supabase) {
//     supabase = await createClient();
//   }

//   const { data: auth, error: authError } = await supabase.auth.getUser();
//   if (authError) {
//     console.error("Auth error:", authError);
//     return { error: authError };
//   }

//   // Check if user is already registered
//   const existingUser = await db
//     .select()
//     .from(users)
//     .where(eq(users.id, auth.user.id))
//     .limit(1);

//   if (existingUser.length > 0) {
//     console.log("User already registered..");
//     return { success: true, message: "User already registered" };
//   }

//   // USE LOCAL VALIDATION SCHEMA
//   const result = LocalRegistrationSchema.safeParse(user);
//   if (!result.success) {
//     console.error("Validation failed:", result.error.issues);
//     return {
//       error: result.error.issues
//         .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
//         .join(", "),
//     };
//   }
//   console.log("Validation passed");

//   if (!auth.user.email) {
//     return { error: "user not registered with email" };
//   }

//   const id = auth.user.id;
//   const genderId = await getOrInsertGenderId(user);
//   const otherIds = await getOtherIds(user);

//   if (otherIds.length != 1) {
//     console.log("Other IDs failed:", otherIds);
//     return {
//       error:
//         "one or more of marketing, experience, university, or major was not found in the database.",
//     };
//   }

//   try {
//     // Extract resume filename from URL if present
//     let resumeFilename: string | undefined;
//     if (user.resume) {
//       try {
//         const url = new URL(user.resume);
//         resumeFilename = url.pathname.split("/").pop() || undefined;
//       } catch (e) {
//         console.warn("Could not extract filename from resume URL");
//       }
//     }

//     await db.insert(users).values({
//       id,
//       gender: genderId,
//       ...otherIds[0],
//       previousAttendance: user.previousAttendance,
//       parking: user.parking,
//       yearOfStudy: user.yearOfStudy,
//       accommodations: user.accommodations,
//       email: auth.user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       timestamp: new Date(),
//       marketing: otherIds[0].marketing,
//       checkedIn: false,
//       status: "pending",
//       resumeUrl: user.resume,
//       resumeFilename,
//     });

//     console.log("User created successfully");
//   } catch (insertError) {
//     console.error("User insert failed:", insertError);
//     return { error: `Database insert failed: ${insertError}` };
//   }

//   const { error: multiOptionsError } = await registerInterestsAndRestrictions(
//     id,
//     user,
//   );
//   if (multiOptionsError) {
//     return { error: multiOptionsError };
//   }

//   console.log("Registration completed successfully");
//   return { success: true };
// }

export async function register(
  user: RegistrationInput,
  supabase?: SupabaseClient,
) {
  console.log("REGISTRATION - Starting registration for:", user.email);

  if (!supabase) {
    supabase = await createClient();
  }

  const genderMapping = {
    "1": "Male",
    "2": "Female",
    "3": "Other",
    "4": "Prefer not to say",
  };

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Auth error:", authError);
    return { error: authError };
  }

  console.log("Auth successful, user ID:", auth.user.id);

  try {
    // Check if user is already registered using Supabase client
    console.log("Checking for existing user...");
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", auth.user.id)
      .single();

    if (existingUser) {
      console.log("User already registered..");
      return { success: true, message: "User already registered" };
    }

    // Validation
    console.log("Validating user data...");
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

    // Get gender ID using mapping (no insertion)
    console.log("Getting gender ID...");
    const genderText = genderMapping[user.gender as keyof typeof genderMapping];
    if (!genderText) {
      return { error: `Invalid gender value: ${user.gender}` };
    }

    const { data: existingGender, error: genderError } = await supabase
      .from("gender")
      .select("id")
      .eq("gender", genderText)
      .single();

    if (genderError || !existingGender) {
      console.error("Gender lookup failed:", genderError);
      return { error: `Gender not found in database: ${genderText}` };
    }

    const genderId = existingGender.id;
    console.log("Gender ID:", genderId);

    // Get or create university ID
    console.log("Getting university ID...");
    let universityId;
    const { data: existingUni } = await supabase
      .from("universities")
      .select("id")
      .eq("uni", user.university)
      .single();

    if (existingUni) {
      universityId = existingUni.id;
    } else {
      const { data: newUni, error: uniError } = await supabase
        .from("universities")
        .insert({ uni: user.university })
        .select("id")
        .single();

      if (uniError) {
        console.error("University insert failed:", uniError);
        return { error: `Failed to create university: ${uniError.message}` };
      }
      universityId = newUni.id;
    }

    // Get or create major ID
    console.log("Getting major ID...");
    let majorId;
    const { data: existingMajor } = await supabase
      .from("majors")
      .select("id")
      .eq("major", user.major)
      .single();

    if (existingMajor) {
      majorId = existingMajor.id;
    } else {
      const { data: newMajor, error: majorError } = await supabase
        .from("majors")
        .insert({ major: user.major })
        .select("id")
        .single();

      if (majorError) {
        console.error("Major insert failed:", majorError);
        return { error: `Failed to create major: ${majorError.message}` };
      }
      majorId = newMajor.id;
    }

    // Get experience and marketing IDs (these must exist)
    console.log("Getting experience and marketing IDs...");
    const { data: experienceData } = await supabase
      .from("experience_types")
      .select("id")
      .eq("experience", user.experience)
      .single();

    const { data: marketingData } = await supabase
      .from("marketing_types")
      .select("id")
      .eq("marketing", user.marketing)
      .single();

    if (!experienceData || !marketingData) {
      return { error: "Experience or marketing type not found in database" };
    }

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

    console.log("Attempting to insert user into database...");

    // Insert user using Supabase client with correct field names
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id,
        email: auth.user.email,
        f_name: user.firstName,
        l_name: user.lastName,
        gender: genderId,
        university: universityId,
        major: majorId,
        experience: experienceData.id,
        marketing: marketingData.id,
        prev_attendance: user.previousAttendance,
        parking: user.parking,
        yearOfStudy: user.yearOfStudy,
        accommodations: user.accommodations,
        timestamp: new Date().toISOString(),
        status: "pending",
        resume_url: user.resume,
        resume_filename: resumeFilename,
        checked_in: false,
      })
      .select();

    if (userError) {
      console.error("User insert failed:", userError);
      return { error: `User registration failed: ${userError.message}` };
    }

    console.log("User created successfully:", userData);

    // Handle interests and dietary restrictions using Supabase client
    console.log("Registering interests and restrictions...");

    // Handle dietary restrictions
    if (user.dietaryRestrictions.length > 0) {
      // Insert new dietary restrictions
      for (const restriction of user.dietaryRestrictions) {
        await supabase
          .from("dietary_restrictions")
          .insert({ restriction })
          .select();
      }

      // Get restriction IDs
      const { data: restrictionIds } = await supabase
        .from("dietary_restrictions")
        .select("id")
        .in("restriction", user.dietaryRestrictions);

      // Link user to restrictions
      if (restrictionIds) {
        const userRestrictions = restrictionIds.map(
          ({ id: restrictionId }) => ({
            user_id: id,
            restriction_id: restrictionId,
          }),
        );

        await supabase.from("user_diet_restrictions").insert(userRestrictions);
      }
    }

    // Handle interests
    const { data: interestIds } = await supabase
      .from("interests")
      .select("id")
      .in("interest", user.interests);

    if (!interestIds || interestIds.length !== user.interests.length) {
      return { error: "Some interests not found in database" };
    }

    const userInterests = interestIds.map(({ id: interestId }) => ({
      user_id: id,
      interest_id: interestId,
    }));

    const { error: interestsError } = await supabase
      .from("user_interests")
      .insert(userInterests);

    if (interestsError) {
      console.error("Interests insert failed:", interestsError);
      return { error: `Failed to save interests: ${interestsError.message}` };
    }

    console.log("Registration completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Registration function crashed:", error);
    return { error: `Registration failed: ${error}` };
  }
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
  try {
    const supabase = await createClient();

    const [majorsResult, universitiesResult] = await Promise.all([
      supabase.from("majors").select("major").order("major"),
      supabase.from("universities").select("uni").order("uni"),
    ]);

    if (majorsResult.error) {
      console.error("Majors query error:", majorsResult.error);
      throw majorsResult.error;
    }

    if (universitiesResult.error) {
      console.error("Universities query error:", universitiesResult.error);
      throw universitiesResult.error;
    }

    return {
      majors: majorsResult.data?.map((row) => row.major) || [],
      universities: universitiesResult.data?.map((row) => row.uni) || [],
    };
  } catch (error) {
    console.error("getMajorsAndUniversities error:", error);
    return {
      majors: [],
      universities: [],
    };
  }
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
