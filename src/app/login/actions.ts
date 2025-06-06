"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers as getHeaders } from "next/headers";
import { createClient } from "../../../utils/supabase/server";
import { z } from "zod";
import { getRegistration } from "../../db/registration";
import { SupabaseClient } from "@supabase/supabase-js";

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

  // TODO - redirect the user to an error page with some instructions
  //
  // See github issue #70
  if (error) {
    redirect("/error");
  }

  redirect(data.url);
}

const loginSchema = z.object({
  email: z.string().nonempty().email(),
  password: z
    .string()
    .refine((pw: string) => pw.length >= 8, "At least 8 characters")
    .refine((pw: string) => /[A-Z]/.test(pw), "One uppercase letter")
    .refine((pw: string) => /[a-z]/.test(pw), "One lowercase letter")
    .refine((pw: string) => /\d/.test(pw), "One number")
    .refine((pw: string) => /\W/.test(pw), "One special character"),
});

export async function login(
  email: string,
  password: string,
  supabase?: SupabaseClient,
) {
  if (!supabase) {
    supabase = await createClient();
  }

  const {
    data: login,
    error: loginError,
    success,
  } = loginSchema.safeParse({ email, password });

  // TODO - redirect the user to an error page with some instructions
  //
  // See github issue #70
  if (!success) {
    return { error: loginError, success, type: "signin" as const };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword(login);

  // TODO - redirect the user to an error page with some instructions
  //
  // See github issue #70
  if (!signInError) {
    // redirect path needs:
    // a. to revalidate auth token when loaded
    // b. to re-render with information relevant to user (provided after auth)
    // hence the revalidatePath and emptying of nextJs cache.
    //
    // The layout is emptied instead of the page,
    // because the dashboard (and potentially other pages)
    // have the same needs.
    // revalidatePath("/register", "layout");

    return { success: true, type: "signin" as const };
  }

  const headers = await getHeaders();
  const origin = headers.get("origin");

  const { error: signUpError } = await supabase.auth.signUp(login);

  if (signUpError) {
    return { error: signInError, success: false, type: "signup" as const };
  } else {
    return { success: true, type: "signup" as const };
  }

  // TODO - redirect the user to an error page with some instructions
  //
  // See github issue #70
}
