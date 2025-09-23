"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function deny() {
  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  const resp = await client
    .from("users")
    .update({ status: "declined" })
    .eq("id", userData.user!.id);

  if (resp.error) {
    throw new Error(resp.error.message);
  }

  revalidatePath("/user/dashboard");

  redirect("/user/dashboard");
}

export async function confirm() {
  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  const { data } = await client
    .from("rsvpable_users")
    .select()
    .eq("id", userData.user!.id)
    .maybeSingle();

  const canRsvp = !!data;
  if (!canRsvp) {
    throw new Error("User is not in RSVP table");
  }

  const resp = await client
    .from("users")
    .update({ status: "confirmed" })
    .eq("id", userData.user!.id);

  if (resp.error) {
    throw new Error(resp.error.message);
  }

  revalidatePath("/user/dashboard");

  redirect("/user/dashboard");
}
