import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const isDev = process.env.NODE_ENV === "development";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Log successful auth with structured data
      console.log("Auth successful", {
        userId: data.user.id,
        provider: data.user.app_metadata.provider,
        hasNextParam: !!next,
      });

      // If this is a registration flow, redirect to the specified next URL
      if (next) {
        if (isDev) {
          console.log("Registration flow - redirecting to:", next);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Login flow - check if user has completed registration
      try {
        // Check if user has a profile in your database
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (profileError && profileError.code === "PGRST116") {
          // User not found - redirect to complete registration
          if (isDev) {
            console.log("User needs to complete registration");
          }

          if (data.user.app_metadata.provider === "google") {
            return NextResponse.redirect(`${origin}/register`);
          } else {
            return NextResponse.redirect(`${origin}/register/step-1`);
          }
        } else if (userProfile) {
          // User has complete profile
          if (isDev) {
            console.log("User has complete profile - redirecting to dashboard");
          }
          return NextResponse.redirect(`${origin}/user/dashboard`);
        }
      } catch (dbError) {
        console.error("Database error during profile check", {
          error: dbError,
          userId: data.user.id,
        });
        return NextResponse.redirect(`${origin}/error?message=database_error`);
      }
    } else {
      console.error("Auth exchange failed", {
        error: error?.message || "Unknown error",
        hasCode: !!code,
      });
    }
  } else {
    console.error("Auth callback missing code parameter");
  }

  return NextResponse.redirect(`${origin}/error`);
}
