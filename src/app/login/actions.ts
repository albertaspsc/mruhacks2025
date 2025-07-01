"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers as getHeaders } from "next/headers";
import { createClient } from "../../../utils/supabase/server";
import { z } from "zod";
import { getRegistration } from "../../db/registration";
import { isAdmin } from "../../db/admin";
import { SupabaseClient } from "@supabase/supabase-js";

export async function loginWithGoogle() {
  const headers = await getHeaders();
  const origin = headers.get("origin");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Google OAuth error:", error);
    redirect("/login?error=oauth_failed");
  }

  redirect(data.url);
}

const loginSchema = z.object({
  email: z.string().nonempty().email(),
  password: z.string().min(1, "Password is required"),
});

// Helper function to determine user role and redirect path
async function determineUserDashboard(
  supabase: SupabaseClient,
): Promise<string> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error getting user:", userError);
      return "/login";
    }

    // First check if user is an admin (volunteer, admin, or super_admin)
    const { data: isUserAdmin, error: adminError } = await isAdmin(supabase);

    if (!adminError && isUserAdmin) {
      console.log("User is admin, redirecting to admin dashboard");
      return "/admin/dashboard";
    }

    // If not admin, check if they've completed regular user registration
    try {
      const { data: registration, error: regError } = await getRegistration();

      if (!regError && registration) {
        console.log(
          "User has completed registration, redirecting to user dashboard",
        );
        return "/dashboard";
      } else {
        console.log("User needs to complete registration");
        return "/register";
      }
    } catch (registrationError) {
      console.error("Error checking registration:", registrationError);
      // If we can't check registration, assume they need to register
      return "/register";
    }
  } catch (error) {
    console.error("Error determining user dashboard:", error);
    return "/register";
  }
}

export async function login(email: string, password: string) {
  const supabase = await createClient();

  // Validate input
  const validation = loginSchema.safeParse({ email, password });

  if (!validation.success) {
    const errorMessage = validation.error.issues
      .map((issue) => issue.message)
      .join(", ");
    console.error("Validation error:", errorMessage);
    redirect(
      `/login?error=validation&message=${encodeURIComponent(errorMessage)}`,
    );
  }

  const { data: validatedData } = validation;

  try {
    // Attempt to sign in
    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

    if (signInError) {
      console.error("Sign in error:", signInError);

      // Handle specific error cases
      if (signInError.message.includes("Invalid login credentials")) {
        redirect("/login?error=invalid_credentials");
      } else if (signInError.message.includes("Email not confirmed")) {
        redirect(
          `/login/verify-email?email=${encodeURIComponent(validatedData.email)}`,
        );
      } else {
        redirect(
          `/login?error=signin_failed&message=${encodeURIComponent(signInError.message)}`,
        );
      }
    }

    // Successfully signed in
    if (authData.user) {
      console.log("Sign in successful for user:", authData.user.id);

      // Revalidate auth state
      revalidatePath("/", "layout");

      // Determine where to redirect based on user role
      const redirectPath = await determineUserDashboard(supabase);

      console.log("Redirecting to:", redirectPath);
      redirect(redirectPath);
    }

    // This shouldn't happen if sign in was successful
    console.error("Sign in appeared successful but no user data returned");
    redirect("/login?error=unknown");
  } catch (error: any) {
    console.error("Login action error:", error);
    redirect(
      `/login?error=server_error&message=${encodeURIComponent(error.message || "An unexpected error occurred")}`,
    );
  }
}

// Signup function for new users
export async function signup(
  email: string,
  password: string,
  options?: {
    firstName?: string;
    lastName?: string;
    redirectTo?: string;
  },
) {
  const supabase = await createClient();

  // Use stricter validation for signup
  const signupSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine(
        (pw: string) => /[A-Z]/.test(pw),
        "Must contain one uppercase letter",
      )
      .refine(
        (pw: string) => /[a-z]/.test(pw),
        "Must contain one lowercase letter",
      )
      .refine((pw: string) => /\d/.test(pw), "Must contain one number")
      .refine(
        (pw: string) => /\W/.test(pw),
        "Must contain one special character",
      ),
  });

  const validation = signupSchema.safeParse({ email, password });

  if (!validation.success) {
    const errorMessage = validation.error.issues
      .map((issue) => issue.message)
      .join(", ");
    console.error("Signup validation error:", errorMessage);
    redirect(
      `/register?error=validation&message=${encodeURIComponent(errorMessage)}`,
    );
  }

  const { data: validatedData } = validation;

  try {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          firstName: options?.firstName || "",
          lastName: options?.lastName || "",
        },
      },
    });

    if (signUpError) {
      console.error("Sign up error:", signUpError);

      if (signUpError.message.includes("already registered")) {
        redirect("/login?error=user_exists");
      } else {
        redirect(
          `/register?error=signup_failed&message=${encodeURIComponent(signUpError.message)}`,
        );
      }
    }

    if (authData.user) {
      // Check if email confirmation is required
      if (!authData.user.email_confirmed_at) {
        redirect(
          `/login/verify-email?email=${encodeURIComponent(validatedData.email)}`,
        );
      } else {
        // Email confirmed, redirect to registration form
        redirect("/register");
      }
    }
  } catch (error: any) {
    console.error("Signup action error:", error);
    redirect(
      `/register?error=server_error&message=${encodeURIComponent(error.message || "An unexpected error occurred")}`,
    );
  }
}

// Handle OAuth callback and redirect appropriately
export async function handleOAuthCallback() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("OAuth callback auth error:", authError);
      redirect("/login?error=oauth_failed");
    }

    console.log("OAuth callback successful for user:", user.id);

    // Revalidate auth state
    revalidatePath("/", "layout");

    // Determine where to redirect based on user role
    const redirectPath = await determineUserDashboard(supabase);

    console.log("OAuth redirecting to:", redirectPath);
    redirect(redirectPath);
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    redirect("/login?error=oauth_callback_failed");
  }
}

// Helper function to check if user needs to complete registration
export async function checkRegistrationStatus() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { needsRegistration: true, isAdmin: false };
    }

    // Check if user is admin
    const { data: isUserAdmin, error: adminError } = await isAdmin(supabase);

    if (!adminError && isUserAdmin) {
      return { needsRegistration: false, isAdmin: true };
    }

    // Check if regular user has completed registration
    const { data: registration, error: regError } = await getRegistration();

    return {
      needsRegistration: regError || !registration,
      isAdmin: false,
    };
  } catch (error) {
    console.error("Error checking registration status:", error);
    return { needsRegistration: true, isAdmin: false };
  }
}

// Logout function
export async function logout() {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      redirect("/?error=logout_failed");
    }

    // Revalidate to clear cached data
    revalidatePath("/", "layout");
    redirect("/");
  } catch (error: any) {
    console.error("Logout action error:", error);
    redirect("/?error=logout_failed");
  }
}
