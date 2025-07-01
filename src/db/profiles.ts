"use server";
import { createSelectSchema } from "drizzle-zod";
import { profiles } from "./schema";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../../utils/supabase/server";
import { db } from "./drizzle";
import { eq } from "drizzle-orm";

const ProfileSelectSchema = createSelectSchema(profiles).omit({
  id: true,
});
export type Profile = z.infer<typeof ProfileSelectSchema>;

// Get user profile with only existing fields
export async function getProfile(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  try {
    const data = await db
      .select({
        email: profiles.email,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        marketingEmails: profiles.marketingEmails,
        parking: profiles.parking,
        licensePlate: profiles.licensePlate,
      })
      .from(profiles)
      .where(eq(profiles.id, auth.user.id));

    return { data: data[0] };
  } catch (error) {
    return { error };
  }
}

// Update user profile - allow updating basic info, marketing emails, and parking preferences in user settings
export async function updateProfile(
  updates: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    marketingEmails: boolean;
    parking: "Yes" | "No" | "Not sure"; // Parking preference
    licensePlate: string | null; // License plate (nullable)
  }>,
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
    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined),
    );

    const data = await db
      .update(profiles)
      .set(cleanUpdates)
      .where(eq(profiles.id, auth.user.id))
      .returning();

    return { data: data[0] };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error };
  }
}
