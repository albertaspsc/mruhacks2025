"use server";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "utils/supabase/server";
import { db } from "./drizzle";
import {
  marketingPreferences,
  parkingInfo,
  parkingSituation,
  users,
} from "./schema";
import { Registration } from "./registration";
import z from "zod";
import { eq } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";

const parkingPreferencesSchema = z
  .object({
    parkingPreference: createSelectSchema(parkingSituation),
    licensePlate: z.string().optional(),
  })
  .refine(
    (data) =>
      data.parkingPreference !== "Yes" ||
      (data.licensePlate && data.licensePlate.trim() !== ""),
    {
      message: "License plate is required when parking preference is 'Yes'",
      path: ["licensePlate"],
    },
  );

export async function updateParkingPreferences(
  data: z.infer<typeof parkingPreferencesSchema>,
  supabase?: SupabaseClient,
) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const userId = auth.user.id;

  const { success, error } =
    await parkingPreferencesSchema.safeParseAsync(data);
  if (!success) {
    return { error };
  }

  if (data.parkingPreference != "Yes" && !data.licensePlate) {
    return {};
  }

  if (data.licensePlate) {
    await db
      .insert(parkingInfo)
      .values({ id: userId, licencePlate: data.licensePlate! })
      .onConflictDoUpdate({
        target: parkingInfo.id,
        set: { licencePlate: data.licensePlate },
      });
  }

  db.update(users)
    .set({ parking: data.parkingPreference })
    .where(eq(users.id, auth.user.id));

  return {};
}

export async function updateMarketingPreferences(
  sendEmails: boolean,
  supabase?: SupabaseClient,
) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const userId = auth.user.id;

  await db
    .insert(marketingPreferences)
    .values({ id: userId, sendEmails })
    .onConflictDoUpdate({
      target: [marketingPreferences.id],
      set: { sendEmails },
    });

  return {};
}

const userNameAndEmailSchema = z
  .object({
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    email: z.string().email(),
  })
  .partial();

export async function updateUserNameAndEmail(
  user: Partial<Pick<Registration, "firstName" | "lastName" | "email">>,
  supabase?: SupabaseClient,
) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const userId = auth.user.id;

  const { error, success } = await userNameAndEmailSchema.safeParseAsync(user);
  if (!success) {
    return { error };
  }

  try {
    await db.update(users).set(user).where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    return { error: "Failed to update user profile", details: error };
  }
}

export async function getMarketingPreference(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }
  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (authError) {
    return { error: authError };
  }

  const results = await db
    .select({ sendEmails: marketingPreferences.sendEmails })
    .from(marketingPreferences)
    .where(eq(marketingPreferences.id, auth.user.id));

  if (results.length < 1) {
    return { error: "Marketing preference not found" };
  }

  return { data: results[0] };
}

export async function getParkingPreference(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }
  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (authError) {
    return { error: authError };
  }

  const result = await db
    .select({ parking: users.parking, licencePlate: parkingInfo.licencePlate })
    .from(users)
    .rightJoin(parkingInfo, eq(users.id, parkingInfo.id))
    .where(eq(users.id, auth.user.id))
    .limit(1);

  if (!result.length) {
    return { error: "Parking preference not found" };
  }

  return { data: result[0] };
}
