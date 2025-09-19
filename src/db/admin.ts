"use server";
import { eq, sql } from "drizzle-orm";
import { db } from "./drizzle";
import { admins, profile as profilesTable, users } from "./schema";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

export async function isAdmin(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const validAdminsWithId = await db
    .select()
    .from(admins)
    .where(eq(admins.id, auth.user.id));
  return { data: validAdminsWithId.length > 0 };
}

export async function listUsers() {
  return await db
    .select()
    .from(profilesTable)
    .innerJoin(users, eq(users.id, profilesTable.id));
}

export async function grantAdmin(email: string) {
  db.insert(admins).select(
    db
      .select({
        id: profilesTable.id,
        email: profilesTable.email,
        status: sql<string>`pending`.as("status"),
      })
      .from(profilesTable)
      .where(eq(profilesTable.email, email)),
  );
}
