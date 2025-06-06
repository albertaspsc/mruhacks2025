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

export async function getProfile(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const data = await db
    .select({
      email: profiles.email,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
    })
    .from(profiles)
    .where(eq(profiles.id, auth.user.id));

  return { data: data[0] };
}
