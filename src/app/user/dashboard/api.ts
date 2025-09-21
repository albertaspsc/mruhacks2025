"use server";

import { createClient } from "@/utils/supabase/server";

export async function deny() {
  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  const resp = await client
    .from("users")
    .update({ status: "declined" })
    .eq("id", userData.user!.id);

  console.log(resp);
}

export async function confirm() {
  const client = await createClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  const resp = await client.from("rsvp").upsert({ id: userData.user!.id });

  console.log(resp);
}
