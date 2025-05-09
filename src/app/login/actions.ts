"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers as getHeaders } from "next/headers";
import { createClient } from "../../../utils/supabase/server";
import { z } from "zod";
import { isRegistered } from "../../db/registration";

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
  password: z.string(),
});

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const {
    data: login,
    error: loginError,
    success,
  } = loginSchema.safeParse(data);

  // TODO - redirect the user to an error page with some instructions
  //
  // See github issue #70
  if (!success) {
    redirect("/error?cause=misformatted login");
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
    revalidatePath("/register", "layout");

    const { data: registered } = await isRegistered();

    if (registered) {
      redirect("/dashboard");
    } else {
      redirect("/register");
    }
  }

  const { error: signUpError } = await supabase.auth.signUp(login);

  if (signUpError) {
    redirect(`/error?cause=${signUpError.cause ?? "unable to sign up"}`);
  }
  redirect(`/auth/confirm?email=${login.email}`);

  // TODO - redirect the user to an error page with some instructions
  //
  // See github issue #70
}
