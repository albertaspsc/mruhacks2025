"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import mascot from "@/assets/mascots/crt2.svg";
import { createClient } from "@/utils/supabase/client";
import { useFormValidation } from "@/components/hooks";

const requirements = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw: string) => /\d/.test(pw) },
  { label: "One special character", test: (pw: string) => /\W/.test(pw) },
];

// Confetti helper
const fireConfetti = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = (canvas.width = canvas.parentElement?.clientWidth || 300);
  const h = (canvas.height = 200);
  const pieces = Array.from({ length: 60 }).map(() => ({
    x: Math.random() * w,
    y: Math.random() * -h,
    r: Math.random() * 6 + 4,
    d: Math.random() * 10 + 10,
    tilt: Math.random() * 10 - 10,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
  }));
  let angle = 0;
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    pieces.forEach((p) => {
      p.y += Math.cos(angle + p.d) + 2 + p.r / 2;
      p.x += Math.sin(angle);
      p.tilt += Math.sin(angle) * 0.5;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.lineTo(p.x + p.tilt - p.r / 2, p.y);
      ctx.fill();
    });
    angle += 0.02;
    requestAnimationFrame(draw);
  };
  draw();
};

const ResetPasswordPageContent = () => {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { validatePassword } = useFormValidation({
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const confettiRef = useRef<HTMLCanvasElement>(null);

  // For animated requirements
  const getReqStatus = (pw: string) => requirements.map((r) => r.test(pw));
  const reqStatus = getReqStatus(password);

  // Check if user has a valid session for password reset
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log("Session check:", {
          session: !!session,
          error: sessionError,
        });

        if (sessionError) {
          console.error("Session error:", sessionError);
          // Don't immediately show error, wait for auth state change
          return;
        }

        if (!session) {
          console.log("No session found, waiting for auth state change...");
          // Don't immediately show error, auth state change might fix this
          return;
        }

        console.log("Valid session found");
        setIsValidSession(true);
      } catch (err) {
        console.error("Error checking session:", err);
        // Don't set error immediately, give auth state change a chance
      }
    };

    // Add a small delay to allow for session establishment
    const timer = setTimeout(checkSession, 500);
    return () => clearTimeout(timer);
  }, [supabase]);

  // Handle auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, !!session);

      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        console.log("Valid session established");
        setIsValidSession(true);
        setError("");
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out during password reset");
        // Don't show error immediately, they might be legitimately resetting
      }
    });

    // Auto-allow the form after 2 seconds regardless
    const allowFormTimer = setTimeout(() => {
      setIsValidSession(true);
    }, 2000);

    return () => {
      subscription?.unsubscribe();
      clearTimeout(allowFormTimer);
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate password
    const passwordResult = validatePassword(password);
    if (!passwordResult.isValid) {
      setError(passwordResult.errors[0] || "Invalid password");
      setLoading(false);
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Try to update password directly - let Supabase handle session validation
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error("Password update error:", updateError);

        // If it's a session error, show helpful message
        if (
          updateError.message?.includes("session") ||
          updateError.message?.includes("token")
        ) {
          setError(
            "Your reset link has expired. Please request a new password reset.",
          );
        } else {
          setError(updateError.message || "Failed to update password");
        }
        setLoading(false);
        return;
      }

      console.log("Password updated successfully");
      setError("");
      setSuccess(true);

      // Sign out the user after password reset (security best practice)
      // This ensures they must log in with their new password
      await supabase.auth.signOut();

      // Redirect to login with success message
      setTimeout(() => {
        router.push(
          "/login?message=Password reset successful! Please log in with your new password.",
        );
      }, 2500);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success && confettiRef.current) fireConfetti(confettiRef.current);
  }, [success]);

  useEffect(() => {
    if (error === "Passwords do not match") {
      if (password === confirmPassword && password.length > 0) {
        setError("");
      }
    }
  }, [password, confirmPassword, error]);

  // Show error if session is invalid
  if (!isValidSession && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="space-y-6 w-full max-w-md bg-white border border-gray-200 rounded-3xl px-8 py-10 shadow-lg">
          <h1 className="text-3xl font-bold text-center text-black mb-2">
            Session Expired
          </h1>
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
          <button
            onClick={() => router.push("/auth/forgot-password")}
            className="w-full py-2 px-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors"
          >
            Request New Reset Link
          </button>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-2 rounded-xl border border-gray-300 text-black font-semibold bg-white hover:bg-gray-100 text-center transition-all duration-150"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading while checking session
  if (!isValidSession && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Validating reset session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 w-full max-w-md bg-white border border-gray-200 rounded-3xl px-8 py-10 shadow-lg z-10 flex flex-col items-center relative"
      >
        {/* Confetti canvas inside the card, only visible on success */}
        {success && (
          <canvas
            ref={confettiRef}
            className="pointer-events-none absolute inset-x-0 top-0 h-40"
          />
        )}

        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-black mb-2">
            Set New Password
          </h1>
          <p className="text-gray-600 text-sm">
            Choose a strong password for your account
          </p>
        </div>

        <div className="w-full relative">
          <Label htmlFor="password">
            New Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            className="mt-1 pr-10"
            disabled={loading}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={0}
            className="absolute right-2 top-8 p-1 text-gray-500 hover:text-black focus:outline-none"
            disabled={loading}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.33 1.14-.86 2.197-1.555 3.104"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.104M6.223 6.223A9.956 9.956 0 012.458 12c1.274 4.057 5.065 7 9.542 7 1.61 0 3.13-.38 4.437-1.06"
                />
              </svg>
            )}
          </button>

          {/* Live requirements list with checkmarks */}
          <ul className="mt-2 ml-1 space-y-1 text-sm">
            {requirements.map((r, i) => (
              <li
                key={r.label}
                className="flex items-center gap-2 font-medium transition-colors duration-200"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200">
                  {r.test(password) ? (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      viewBox="0 0 16 16"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8l3 3 5-5"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-gray-300"
                      fill="none"
                      viewBox="0 0 16 16"
                      stroke="currentColor"
                    >
                      <circle cx="8" cy="8" r="7" strokeWidth={2} />
                    </svg>
                  )}
                </span>
                <span
                  className={r.test(password) ? "text-black" : "text-gray-400"}
                >
                  {r.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full">
          <Label htmlFor="confirmPassword">
            Confirm New Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            className="mt-1"
            disabled={loading}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
          )}
        </div>

        {error && !error.includes("match") && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        {success && (
          <div className="w-full bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm text-center">
              ✅ Password updated successfully! Redirecting to login...
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-black text-white font-semibold shadow-none hover:bg-gray-900 transition-colors disabled:opacity-50"
          disabled={
            loading ||
            !password ||
            !confirmPassword ||
            password !== confirmPassword
          }
        >
          {loading ? "Updating Password..." : "Update Password"}
        </Button>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full mt-2 py-2 rounded-xl border border-gray-300 text-black font-semibold bg-white hover:bg-gray-100 text-center transition-all duration-150"
          disabled={loading}
        >
          Back to Login
        </button>

        <div className="flex justify-center pt-4">
          <Image
            src={mascot}
            alt="MRUHacks Mascot"
            width={110}
            height={110}
            className="object-contain"
            priority
          />
        </div>
      </form>
    </div>
  );
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      }
    >
      <ResetPasswordPageContent />
    </Suspense>
  );
}
