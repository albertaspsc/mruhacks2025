"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers as getHeaders } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { getRegistrationDataAction } from "@/actions/registrationActions";

export async function loginWithGoogle() {
  const headers = await getHeaders();
  const origin = headers.get("origin");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        prompt: "select_account", // Forces account selection for security
      },
      scopes: "email profile",
    },
  });

  if (error) {
    console.error("Google OAuth error:", error);
    redirect("/login?error=oauth_failed");
  }

  redirect(data.url);
}

const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
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

  if (!success) {
    throw new Error("Please enter a valid email and password.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword(login);

  if (signInError) {
    // Check for specific error types
    if (signInError.message.includes("Invalid login credentials")) {
      throw new Error(
        "Invalid credentials. Please check your email and password.",
      );
    }
    if (signInError.message.includes("Email not confirmed")) {
      throw new Error("Please verify your email before signing in.");
    }
    if (signInError.message.includes("Too many requests")) {
      throw new Error("Too many login attempts. Please try again later.");
    }
    // Generic error fallback
    throw new Error("Login failed. Please try again.");
  }

  // User signed in successfully
  revalidatePath("/user", "layout");

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/login?error=auth_failed");
  }

  const result = await getRegistrationDataAction();

  if (result.success && result.data) {
    redirect("/user/dashboard");
  } else {
    redirect("/register/step-1");
  }
}
