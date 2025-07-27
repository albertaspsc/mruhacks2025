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
  const error = searchParams.get("error");

  // Handle 'next' parameter with different defaults based on type
  let next = searchParams.get("next");
  if (!next) {
    // Set default redirect based on auth type
    switch (type) {
      case "recovery":
        next = "/auth/reset-password"; // Back to auth folder
        break;
      case "signup":
        next = "/register/step-1";
        break;
      case "email_change":
        next = "/user/dashboard";
        break;
      default:
        next = "/register/step-1";
    }
  }

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
    // Different error redirects based on type
    if (type === "recovery") {
      return NextResponse.redirect(
        `${origin}/auth/forgot-password?error=verification_failed`,
      );
    }
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
      if (type === "recovery") {
        return NextResponse.redirect(
          `${origin}/auth/forgot-password?error=code_exchange_failed`,
        );
      }
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
      if (type === "recovery") {
        return NextResponse.redirect(
          `${origin}/auth/forgot-password?error=session_failed`,
        );
      }
      return NextResponse.redirect(`${origin}/register?error=session_failed`);
    }

    if (data.user) {
      console.log("Session set successful for:", data.user.email);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Method 3: Handle token hash verification (MOST IMPORTANT FOR PASSWORD RESET)
  if (token_hash && type) {
    console.log(`Attempting OTP verification for type: ${type}...`);

    try {
      const { data, error: otpError } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      });

      if (otpError) {
        console.error("OTP verification failed:", otpError);

        // Handle different types of OTP verification failures
        if (type === "recovery") {
          return NextResponse.redirect(
            `${origin}/login/forgot-password?error=invalid_or_expired_token`,
          );
        } else if (type === "signup") {
          return NextResponse.redirect(
            `${origin}/register?error=invalid_verification_link`,
          );
        } else if (type === "email_change") {
          return NextResponse.redirect(
            `${origin}/user/dashboard?error=email_change_failed`,
          );
        }

        return NextResponse.redirect(`${origin}/register?error=otp_failed`);
      }

      if (data.user && data.session) {
        console.log(`${type} verification successful for:`, data.user.email);

        // For password recovery, set the session in cookies
        if (type === "recovery") {
          console.log("Password recovery session established");

          // Create a response that will redirect
          const response = NextResponse.redirect(`${origin}${next}`);

          // Set session cookies manually to ensure they persist
          response.cookies.set(
            "supabase-auth-token",
            data.session.access_token,
            {
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24, // 24 hours
            },
          );

          response.cookies.set(
            "supabase-refresh-token",
            data.session.refresh_token,
            {
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 7, // 7 days
            },
          );

          return response;
        }

        return NextResponse.redirect(`${origin}${next}`);
      } else {
        console.error("OTP verification returned no user/session");
        if (type === "recovery") {
          return NextResponse.redirect(
            `${origin}/login/forgot-password?error=verification_incomplete`,
          );
        }
        return NextResponse.redirect(
          `${origin}/register?error=verification_incomplete`,
        );
      }
    } catch (error) {
      console.error("Unexpected error during OTP verification:", error);
      if (type === "recovery") {
        return NextResponse.redirect(
          `${origin}/login/forgot-password?error=verification_error`,
        );
      }
      return NextResponse.redirect(
        `${origin}/register?error=verification_error`,
      );
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

    // If user is already authenticated but this was a recovery type,
    // they might be trying to reset password while logged in
    if (type === "recovery") {
      return NextResponse.redirect(`${origin}/auth/reset-password`);
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  console.log("No valid authentication method found");

  // Different fallback redirects based on type
  if (type === "recovery") {
    return NextResponse.redirect(
      `${origin}/auth/forgot-password?error=no_valid_recovery_session`,
    );
  } else if (type === "email_change") {
    return NextResponse.redirect(
      `${origin}/user/dashboard?error=email_change_invalid`,
    );
  }

  return NextResponse.redirect(`${origin}/register?error=no_valid_auth`);
}
