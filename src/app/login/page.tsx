"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import mascot from "@/assets/mascots/crt2.svg";
import { login, loginWithGoogle } from "./actions";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Pass email and password as individual parameters
      const result = await login(email, password);
      // Regular users will be redirected to /dashboard
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      await loginWithGoogle();
      // Regular users will be redirected to /dashboard
    } catch (err: any) {
      console.error("Google login error:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check for URL error params
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      switch (errorParam) {
        case "invalid_credentials":
          setError("Invalid email or password. Please try again.");
          break;
        case "oauth_failed":
          setError("Google sign-in failed. Please try again.");
          break;
        case "account_inactive":
          setError(
            "Your account has been deactivated. Please contact support.",
          );
          break;
        case "authentication_error":
          setError("Authentication error. Please try logging in again.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="space-y-6 w-full max-w-md bg-white border border-gray-200 rounded-3xl px-8 py-10 shadow-lg z-10 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center text-black mb-2">
          Log In
        </h1>

        <div className="w-full">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@mtroyal.ca"
            required
            disabled={isLoading}
            className="mt-1 pr-10"
          />
        </div>

        <div className="w-full">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            disabled={isLoading}
            className="mt-1 pr-10"
          />
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-black text-white font-semibold shadow-none hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Signing In..." : "Log In / Sign Up"}
        </Button>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2 px-4 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <FcGoogle className="w-5 h-5" />
          <span className="text-gray-700 font-medium">Sign in with Google</span>
        </button>

        <button
          type="button"
          className="w-full mt-2 py-2 rounded-xl border border-gray-300 text-black font-semibold bg-white hover:bg-gray-100 text-center transition-all duration-150 block"
          onClick={() => router.push("/login/forgot-password")}
          disabled={isLoading}
        >
          Forgot password?
        </button>

        {/* Small staff login link at the bottom */}
        <div className="pt-2">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
            onClick={() => router.push("/admin-login-portal")}
            disabled={isLoading}
          >
            Admin/Volunteer Login
          </button>
        </div>

        {/* Mascot inside the card, below the buttons */}
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
      </div>
    </div>
  );
}
