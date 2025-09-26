"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import mascot from "@/assets/mascots/crt2.svg";
import { createClient } from "@/utils/supabase/client";
import { useFormValidation } from "@/components/hooks";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const { validateEmail } = useFormValidation({
    email: {},
  });
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | "success" | "fail" | "loading">(
    null,
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    // Validate email
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      setStatus("fail");
      setError(emailResult.error || "Please enter a valid email address");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?type=recovery&next=/auth/reset-password`,
      });

      if (error) {
        setStatus("fail");
        setError(error.message);
        return;
      }

      setStatus("success");
      // Redirect to the reset link sent page
      setTimeout(() => {
        router.push("/auth/reset-link-sent");
      }, 1500);
    } catch (err) {
      console.error("Password reset error:", err);
      setStatus("fail");
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 w-full max-w-md bg-white border border-gray-200 rounded-3xl px-8 py-10 shadow-lg z-10 flex flex-col items-center"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-black mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-600 text-sm">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        {/* Email Input */}
        <div className="w-full">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@mtroyal.ca"
            required
            className="mt-1"
            disabled={status === "loading"}
          />
        </div>

        {/* Status Messages */}
        {status === "success" && (
          <div className="w-full bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm text-center">
              Password reset link sent! Check your email and follow the
              instructions to reset your password.
            </p>
          </div>
        )}

        {status === "fail" && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-black text-white font-semibold shadow-none hover:bg-gray-900 transition-colors disabled:opacity-50"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending..." : "Send Reset Link"}
        </Button>

        {/* Back to Login */}
        <a
          href="/login"
          className="w-full mt-2 py-2 rounded-xl border border-gray-300 text-black font-semibold bg-white hover:bg-gray-100 text-center transition-all duration-150 block"
        >
          &lt;- Back to Login
        </a>

        {/* Mascot */}
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

        {/* Help Text */}
        <div className="text-center text-xs text-gray-400 pt-2">
          <p>Having trouble? Contact us at hello@mruhacks.ca</p>
        </div>
      </form>
    </div>
  );
}
