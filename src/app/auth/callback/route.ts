import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      console.log("Auth successful for user:", data.user.id);

      // If this is a registration flow, redirect to the specified next URL
      if (next) {
        console.log("📝 Registration flow - redirecting to:", next);
        return NextResponse.redirect(`${origin}${next}`);
      }

      // This is a login flow - check if user has completed registration
      try {
        // Check if user has a profile in your database
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (profileError && profileError.code === "PGRST116") {
          // User not found - redirect to complete registration
          console.log("🆕 User needs to complete registration");

          if (data.user.app_metadata.provider === "google") {
            return NextResponse.redirect(`${origin}/register`);
          } else {
            return NextResponse.redirect(`${origin}/register/step-1`);
          }
        } else if (userProfile) {
          // User has complete profile
          console.log("User has complete profile - redirecting to dashboard");
          return NextResponse.redirect(`${origin}/user/dashboard`);
        }
      } catch (dbError) {
        console.error("Database error during profile check:", dbError);
        return NextResponse.redirect(`${origin}/error?message=database_error`);
      }
    } else {
      console.error("Auth exchange failed:", error);
    }
  }

  return NextResponse.redirect(`${origin}/error`);
}
