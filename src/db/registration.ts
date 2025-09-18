"use server";

import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { syncUserToProfile } from "@/db/settings";
import { z } from "zod";

export interface Registration {
  // Basic user info
  id?: string;
  email?: string;
  f_name?: string;
  l_name?: string;
  firstName?: string;
  lastName?: string;

  // Registration details
  gender?: string;
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

// Simple validation schema
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

// Simple registration function
export async function register(user: RegistrationInput) {
  const supabase = await createClient();

  // Get current user
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) {
    return { error: "Authentication required" };
  }

  // Validate input
  const validation = RegistrationSchema.safeParse(user);
  if (!validation.success) {
    return { error: "Invalid registration data" };
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

    // Gender mapping (form sends the string label, look up ID)
    const { data: genderRow, error: genderLookupError } = await supabase
      .from("gender")
      .select("id")
      .eq("gender", user.gender)
      .single();
    const genderResult =
      genderLookupError || !genderRow
        ? {
            data: null,
            error: genderLookupError || { message: "Gender not found" },
          }
        : { data: { id: genderRow.id }, error: null };

    // Experience mapping
    const experienceMap: { [key: string]: number } = {
      "Beginner – What is a computer?": 1,
      "Intermediate – My spaghetti code is made out of tagliatelle.": 2,
      "Advanced – Firewalls disabled, mainframes bypassed.": 3,
      "Expert – I know what a computer is.": 4,
      Beginner: 1,
      Intermediate: 2,
      Advanced: 3,
      Expert: 4,
    };

    // Marketing mapping
    const marketingMap: { [key: string]: number } = {
      Poster: 1,
      "Social Media": 2,
      "Word of Mouth": 3,
      "Website/Googling it": 4,
      "Attended the event before": 5,
      Other: 6,
    };

    const experienceId = experienceMap[user.experience];
    const marketingId = marketingMap[user.marketing];

    const experienceResult = experienceId
      ? { data: { id: experienceId }, error: null }
      : {
          data: null,
          error: {
            message: `Experience "${user.experience}" not found in mapping. Available: ${Object.keys(experienceMap).join(", ")}`,
          },
        };

    const marketingResult = marketingId
      ? { data: { id: marketingId }, error: null }
      : {
          data: null,
          error: {
            message: `Marketing "${user.marketing}" not found in mapping. Available: ${Object.keys(marketingMap).join(", ")}`,
          },
        };

    // Check which lookups failed and provide specific error messages
    const errors = [];
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
    let universityId, majorId;

    try {
      // Try to get or create university
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
          universityId = 1;
        } else {
          universityId = newUni.id;
        }
      }
    } catch (error) {
      universityId = 1; // Fallback
    }

    try {
      // Try to get or create major
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
          majorId = 1;
        } else {
          majorId = newMajor.id;
        }
      }
    } catch (error) {
      majorId = 1; // Fallback
    }

    // Insert user
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

    // Handle interests and dietary restrictions
    await handleUserSelections(supabase, auth.user.id, user);

    // Syncs information to public.profile table
    console.log("User registered successfully, syncing to profile table...");

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
      console.error(
        "Profile sync failed during registration:",
        profileSyncResult.error,
      );
      // Don't fail the entire registration, but log the error
      console.warn("User registered successfully but profile sync failed");
    } else {
      console.log("User registered and profile synced successfully");
    }

    return { success: true };
  } catch (error) {
    console.error("Registration exception:", error);
    return { error: "Registration failed - please try again" };
  }
}

// Helper function to get or create records
async function getOrCreateRecord(
  supabase: SupabaseClient,
  table: string,
  column: string,
  value: string,
): Promise<number | null> {
  try {
    // Try to find existing
    const { data: existing } = await supabase
      .from(table)
      .select("id")
      .eq(column, value)
      .single();

    if (existing) {
      return existing.id;
    }

    // Create new
    const { data: newRecord, error } = await supabase
      .from(table)
      .insert({ [column]: value })
      .select("id")
      .single();

    return newRecord?.id || null;
  } catch {
    return null;
  }
}

// Handle user interests and dietary restrictions
async function handleUserSelections(
  supabase: SupabaseClient,
  userId: string,
  user: RegistrationInput,
) {
  try {
    // Handle dietary restrictions
    if (user.dietaryRestrictions && user.dietaryRestrictions.length > 0) {
      for (const restriction of user.dietaryRestrictions) {
        // Find the restriction ID
        const { data: restrictionData, error: restrictionError } =
          await supabase
            .from("dietary_restrictions")
            .select("id")
            .eq("restriction", restriction)
            .single();

        if (restrictionError || !restrictionData) {
          continue;
        }

        // Insert into junction table
        const { error: insertError } = await supabase
          .from("user_diet_restrictions")
          .insert({
            id: userId,
            restriction: restrictionData.id,
          });

        if (insertError) {
          console.warn("Failed to insert user diet restriction:", insertError);
        }
      }
    }

    // Handle interests
    if (user.interests && user.interests.length > 0) {
      for (const interest of user.interests) {
        // Find the interest ID
        const { data: interestData, error: interestError } = await supabase
          .from("interests")
          .select("id")
          .eq("interest", interest)
          .single();

        if (interestError || !interestData) {
          continue;
        }

        // Insert into junction table
        const { error: insertError } = await supabase
          .from("user_interests")
          .insert({
            id: userId,
            interest: interestData.id,
          });

        if (insertError) {
          console.warn("Failed to insert user interest:", insertError);
        }
      }
    }
  } catch (error) {
    console.warn("handleUserSelections encountered an error:", error);
  }
}

// Get static options for forms
export async function getStaticOptions() {
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

// Get user registration data
export async function getRegistration() {
  try {
    const supabase = await createClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      return { error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", auth.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return { error: error.message };
    }

    // Map database fields to component-friendly names
    const mappedData: Registration | null = data
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

// Get majors and universities for forms
export async function getMajorsAndUniversities() {
  try {
    const supabase = await createClient();

    const [majorsResult, universitiesResult] = await Promise.all([
      supabase.from("majors").select("major").order("major"),
      supabase.from("universities").select("uni").order("uni"),
    ]);

    if (majorsResult.error) {
      throw majorsResult.error;
    }

    if (universitiesResult.error) {
      throw universitiesResult.error;
    }

    return {
      majors: majorsResult.data?.map((row) => row.major) || [],
      universities: universitiesResult.data?.map((row) => row.uni) || [],
    };
  } catch (error) {
    return {
      majors: [],
      universities: [],
    };
  }
}
