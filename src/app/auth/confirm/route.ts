import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // Log ALL parameters for debugging
  console.log("=== AUTH CONFIRM DEBUG ===");
  console.log("Full URL:", request.url);
  console.log("All search params:", Object.fromEntries(searchParams.entries()));

  // Get all possible parameters
  const code = searchParams.get("code");
  const token = searchParams.get("token");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const access_token = searchParams.get("access_token");
  const refresh_token = searchParams.get("refresh_token");
  const next = searchParams.get("next") ?? "/register/step-1";
  const error = searchParams.get("error");

  console.log("Extracted params:", {
    code: code ? "present" : "missing",
    token: token ? "present" : "missing",
    token_hash: token_hash ? "present" : "missing",
    type,
    access_token: access_token ? "present" : "missing",
    refresh_token: refresh_token ? "present" : "missing",
    next,
    error,
  });

  if (error) {
    console.error("Auth error received:", error);
    return NextResponse.redirect(
      `${origin}/register?error=verification_failed`,
    );
  }

  const supabase = await createClient();

  // Method 1: Handle authorization code (OAuth flow)
  if (code) {
    console.log("Attempting code exchange...");
    const { data, error: codeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (codeError) {
      console.error("Code exchange failed:", codeError);
      return NextResponse.redirect(
        `${origin}/register?error=code_exchange_failed`,
      );
    }

    if (data.user) {
      console.log("Code exchange successful for:", data.user.email);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Method 2: Handle direct session tokens
  if (access_token && refresh_token) {
    console.log("Attempting session setting...");
    const { data, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError) {
      console.error("Session setting failed:", sessionError);
      return NextResponse.redirect(`${origin}/register?error=session_failed`);
    }

    if (data.user) {
      console.log("Session set successful for:", data.user.email);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Method 3: Handle token hash verification
  if (token_hash && type) {
    console.log("Attempting OTP verification...");
    const { data, error: otpError } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (otpError) {
      console.error("OTP verification failed:", otpError);
      return NextResponse.redirect(`${origin}/register?error=otp_failed`);
    }

    if (data.user) {
      console.log("OTP verification successful for:", data.user.email);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fallback: Check if user is already authenticated
  console.log("Checking existing session...");
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (user && !userError) {
    console.log("User already authenticated:", user.email);
    return NextResponse.redirect(`${origin}${next}`);
  }

  console.log("No valid authentication method found");
  return NextResponse.redirect(`${origin}/register?error=no_valid_auth`);
}
