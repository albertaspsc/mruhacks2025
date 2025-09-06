"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { syncUserToProfile } from "@/services/SettingsService";
import { z } from "zod";
import {
  getExperienceMapping,
  getMarketingMapping,
  isValidInterest,
  isValidDietaryRestriction,
  isValidMarketingOption,
  isValidYearOfStudy,
  isValidParkingOption,
} from "@/data/registrationOptions";

// Validation schema (copied from legacy db layer)
const RegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  university: z.string().min(1, "University is required"),
  major: z.string().min(1, "Major is required"),
  experience: z.string().min(1, "Experience level is required"),
  marketing: z.string().min(1, "Please tell us how you heard about us"),
  previousAttendance: z.boolean(),
  parking: z.string().min(1, "Parking preference is required"),
  yearOfStudy: z.string().min(1, "Year of study is required"),
  accommodations: z.string().optional(),
  dietaryRestrictions: z.array(z.string()),
  interests: z.array(z.string()).min(1, "At least one interest is required"),
  resume: z.string().optional(),
});

export type RegistrationInput = z.infer<typeof RegistrationSchema>;

export interface Registration {
  // Basic user info
  id?: string;
  email?: string;
  f_name?: string;
  l_name?: string;
  firstName?: string;
  lastName?: string;

  // Registration details
  gender?: number | string;
  university?: number | string;
  major?: number | string;
  experience?: number | string;
  marketing?: number | string;
  previousAttendance?: boolean;
  parking?: string;
  yearOfStudy?: string;
  accommodations?: string;
  resume_url?: string;
  resume?: string;

  // Status and timestamps
  status?: "pending" | "confirmed" | "waitlisted" | "rejected";
  checked_in?: boolean;
  timestamp?: string;

  // Arrays for interests and dietary restrictions
  interests?: string[];
  dietaryRestrictions?: string[];
}

export async function register(user: RegistrationInput) {
  const supabase = await createClient();

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) {
    return { error: "Authentication required" };
  }

  const validation = RegistrationSchema.safeParse(user);
  if (!validation.success) {
    return { error: "Invalid registration data" };
  }

  if (
    user.interests &&
    user.interests.some((interest) => !isValidInterest(interest))
  ) {
    return { error: "Invalid interest selection" };
  }

  if (
    user.dietaryRestrictions &&
    user.dietaryRestrictions.some(
      (restriction) => !isValidDietaryRestriction(restriction),
    )
  ) {
    return { error: "Invalid dietary restriction selection" };
  }

  if (user.marketing && !isValidMarketingOption(user.marketing)) {
    return { error: "Invalid marketing option" };
  }

  if (user.yearOfStudy && !isValidYearOfStudy(user.yearOfStudy)) {
    return { error: "Invalid year of study" };
  }

  if (user.parking && !isValidParkingOption(user.parking)) {
    return { error: "Invalid parking option" };
  }

  try {
    // Check if already registered
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("id", auth.user.id)
      .single();

    if (existing) {
      return { success: true, message: "Already registered" };
    }

    // Gender mapping (form sends the ID)
    let genderResult;
    if (!isNaN(Number(user.gender))) {
      genderResult = { data: { id: Number(user.gender) }, error: null };
    } else {
      return { error: "Gender must be a valid ID" };
    }

    const experienceMap = getExperienceMapping();
    const marketingMap = getMarketingMapping();

    const experienceId = experienceMap[user.experience];
    const marketingId = marketingMap[user.marketing];

    const experienceResult = experienceId
      ? { data: { id: experienceId }, error: null }
      : { data: null, error: { message: "Experience not found" } };

    const marketingResult = marketingId
      ? { data: { id: marketingId }, error: null }
      : { data: null, error: { message: "Marketing not found" } };

    const errors: string[] = [];
    if (genderResult.error || !genderResult.data) {
      errors.push(`Gender "${user.gender}" not found in database`);
    }
    if (experienceResult.error || !experienceResult.data) {
      errors.push(`Experience "${user.experience}" not found in database`);
    }
    if (marketingResult.error || !marketingResult.data) {
      errors.push(`Marketing option "${user.marketing}" not found in database`);
    }

    if (errors.length > 0) {
      const errorMessage = "Database lookup failed: " + errors.join(", ");
      console.error(errorMessage);
      return { error: errorMessage };
    }

    // Get or create university and major
    const universityId =
      (await getOrCreateRecord(
        supabase,
        "universities",
        "uni",
        user.university,
      )) || 1;

    const majorId =
      (await getOrCreateRecord(supabase, "majors", "major", user.major)) || 1;

    const { error: insertError } = await supabase.from("users").insert({
      id: auth.user.id,
      email: auth.user.email,
      f_name: user.firstName,
      l_name: user.lastName,
      gender: genderResult.data!.id,
      university: universityId,
      major: majorId,
      experience: experienceResult.data!.id,
      marketing: marketingResult.data!.id,
      prev_attendance: user.previousAttendance,
      parking: user.parking,
      yearOfStudy: user.yearOfStudy,
      accommodations: user.accommodations || "",
      resume_url: user.resume || null,
      timestamp: new Date().toISOString(),
      status: "pending",
      checked_in: false,
    });

    if (insertError) {
      console.error("Users insert failed:", insertError);
      return { error: "Registration failed - please try again" };
    }

    await handleUserSelections(supabase, auth.user.id, user);

    const profileSyncResult = await syncUserToProfile(
      {
        firstName: user.firstName,
        lastName: user.lastName,
        email: auth.user.email,
        parking: user.parking,
      },
      supabase,
    );

    if (profileSyncResult.error) {
      console.warn("User registered successfully but profile sync failed");
    }

    return { success: true };
  } catch (error) {
    console.error("Registration exception:", error);
    return { error: "Registration failed - please try again" };
  }
}

export async function getOrCreateRecord(
  supabase: SupabaseClient,
  table: string,
  column: string,
  value: string,
): Promise<number | null> {
  try {
    const { data: existing } = await supabase
      .from(table)
      .select("id")
      .eq(column, value)
      .single();

    if (existing) return existing.id;

    const { data: newRecord } = await supabase
      .from(table)
      .insert({ [column]: value })
      .select("id")
      .single();

    return newRecord?.id || null;
  } catch {
    return null;
  }
}

export async function handleUserSelections(
  supabase: SupabaseClient,
  userId: string,
  user: RegistrationInput,
) {
  try {
    if (user.dietaryRestrictions && user.dietaryRestrictions.length > 0) {
      for (const restriction of user.dietaryRestrictions) {
        const { data: restrictionData } = await supabase
          .from("dietary_restrictions")
          .select("id")
          .eq("restriction", restriction)
          .single();

        if (!restrictionData) continue;

        const { error: insertError } = await supabase
          .from("user_diet_restrictions")
          .insert({
            id: userId,
            restriction: restrictionData.id,
          });

        if (insertError)
          console.warn("Failed to insert user diet restriction:", insertError);
      }
    }

    if (user.interests && user.interests.length > 0) {
      for (const interest of user.interests) {
        const { data: interestData } = await supabase
          .from("interests")
          .select("id")
          .eq("interest", interest)
          .single();

        if (!interestData) continue;

        const { error: insertError } = await supabase
          .from("user_interests")
          .insert({
            id: userId,
            interest: interestData.id,
          });

        if (insertError)
          console.warn("Failed to insert user interest:", insertError);
      }
    }
  } catch (error) {
    console.warn("handleUserSelections encountered an error:", error);
  }
}

export async function getStaticOptions() {
  console.warn(
    "getStaticOptions() is deprecated. Use TypeScript constants from @/data/registrationOptions instead.",
  );

  try {
    const supabase = await createClient();

    const [dietaryResult, interestResult, marketingResult] = await Promise.all([
      supabase
        .from("dietary_restrictions")
        .select("restriction")
        .order("restriction"),
      supabase.from("interests").select("interest").order("interest"),
      supabase.from("marketing_types").select("marketing").order("marketing"),
    ]);

    return {
      dietaryRestrictions: dietaryResult.data?.map((x) => x.restriction) || [],
      interests: interestResult.data?.map((x) => x.interest) || [],
      marketingTypes: marketingResult.data?.map((x) => x.marketing) || [],
    };
  } catch (error) {
    return {
      dietaryRestrictions: [],
      interests: [],
      marketingTypes: [],
    };
  }
}

export async function getRegistration() {
  try {
    const supabase = await createClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) return { error: "Not authenticated" };

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", auth.user.id)
      .single();

    if (error && error.code !== "PGRST116") return { error: error.message };

    const mappedData = data
      ? {
          ...data,
          firstName: data.f_name,
          lastName: data.l_name,
          resume: data.resume_url,
        }
      : null;

    return { data: mappedData };
  } catch (error) {
    return { error: "Failed to get registration" };
  }
}

export async function getMajorsAndUniversities() {
  console.warn(
    "getMajorsAndUniversities() is deprecated. Use TypeScript constants from @/data/registrationOptions instead.",
  );

  try {
    const supabase = await createClient();

    const [majorsResult, universitiesResult] = await Promise.all([
      supabase.from("majors").select("major").order("major"),
      supabase.from("universities").select("uni").order("uni"),
    ]);

    if (majorsResult.error) throw majorsResult.error;
    if (universitiesResult.error) throw universitiesResult.error;

    return {
      majors: majorsResult.data?.map((row) => row.major) || [],
      universities: universitiesResult.data?.map((row) => row.uni) || [],
    };
  } catch (error) {
    return { majors: [], universities: [] };
  }
}

// Remove default export - consumers should import named functions/types
