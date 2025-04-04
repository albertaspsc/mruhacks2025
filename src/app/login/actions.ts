"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers as getHeaders } from "next/headers";
import { createClient } from "../../../utils/supabase/server";
import { z } from "zod";

export async function loginWithGoogle() {
  const headers = await getHeaders();
  const origin = headers.get("origin");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/register`,
    },
  });

  if (error) {
    redirect("/error");
  }

  redirect(data.url);
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const loginSchema = z.object({
    email: z.string().nonempty().email(),
    password: z.string().min(10),
  });

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // data.

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/register", "layout");
  redirect("/register");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // TODO - validate input (with zod or something)
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  // revalidatePath("/register", "layout");
  redirect("/register");
}
