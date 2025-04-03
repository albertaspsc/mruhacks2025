"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "../../../utils/supabase/server";

export async function loginGoogle(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/register",
    },
  });

  if (error) {
    redirect("/error");
  }

  redirect(data.url);
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  // TODO - validate input (with zod or something)
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  // TODO - redirect to dashboard
  redirect("/");
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

  revalidatePath("/", "layout");
  redirect("/register");
}
