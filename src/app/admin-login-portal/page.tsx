"use client";

{
  /* Handles Admin and Volunteer login for MRUHacks Staff Portal */
}

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import mascot from "@/assets/mascots/crt2.svg";
import { createClient } from "../../../utils/supabase/client";

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🔐 Starting login with:", credentials.email);

      // Step 1: Authenticate with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

      if (authError) {
        console.log("🚫 Auth failed:", authError);
        setError("Invalid credentials");
        return;
      }

      if (!authData.user) {
        console.log("🚫 No user data");
        setError("Login failed");
        return;
      }

      console.log("✅ Auth successful!");
      console.log("👤 User ID:", authData.user.id);
      console.log("📧 User email:", authData.user.email);

      // Step 2: Check if user exists in admins table
      console.log("🔍 Querying admins table...");
      console.log("🔍 Looking for ID:", authData.user.id);

      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("id, email, role, status")
        .eq("id", authData.user.id)
        .single();

      // Detailed logging
      console.log("📊 Raw admin query response:");
      console.log("  - adminData:", adminData);
      console.log("  - adminError:", adminError);
      console.log("  - adminData type:", typeof adminData);
      console.log("  - adminData is null:", adminData === null);
      console.log("  - adminData is undefined:", adminData === undefined);

      if (adminError) {
        console.log("🚫 Admin query error details:", {
          message: adminError.message,
          details: adminError.details,
          hint: adminError.hint,
          code: adminError.code,
        });
        await supabase.auth.signOut();
        setError(`Database error: ${adminError.message}`);
        return;
      }

      if (!adminData) {
        console.log("🚫 adminData is falsy");
        console.log("🚫 Exact adminData value:", adminData);
        await supabase.auth.signOut();
        setError("Access denied. Admin account required.");
        return;
      }

      console.log("✅ Admin record found!");
      console.log("  - ID:", adminData.id);
      console.log("  - Email:", adminData.email);
      console.log("  - Role:", adminData.role);
      console.log("  - Status:", adminData.status);

      // Step 3: Check if admin account is active
      if (adminData.status !== "active") {
        console.log("🚫 Admin account not active. Status:", adminData.status);
        await supabase.auth.signOut();
        setError("Admin account is inactive. Contact support.");
        return;
      }

      // Step 4: Redirect based on role
      console.log("🎯 Redirecting based on role:", adminData.role);

      if (adminData.role === "admin") {
        console.log("➡️ Redirecting to admin dashboard");
        router.push("/admin/dashboard");
      } else if (adminData.role === "volunteer") {
        console.log("➡️ Redirecting to volunteer dashboard");
        router.push("/volunteer/dashboard");
      } else {
        console.log("🚫 Invalid admin role:", adminData.role);
        setError("Invalid admin role");
      }
    } catch (error) {
      console.error("💥 Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="space-y-6 w-full max-w-md bg-white border border-gray-200 rounded-3xl px-8 py-10 shadow-lg z-10 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-black mb-2">Staff Login</h1>
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 text-center">
              <strong>Admin & Volunteer Access</strong>
              <br />
              Use your organization credentials
            </p>
          </div>
        </div>

        {/* Email Field */}
        <div className="w-full">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={credentials.email}
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
            placeholder="Enter your email"
            required
            disabled={loading}
            className="mt-1 pr-10"
          />
        </div>

        {/* Password Field */}
        <div className="w-full">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            placeholder="Enter your password"
            required
            disabled={loading}
            className="mt-1 pr-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin(e);
              }
            }}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Login Button */}
        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white font-semibold shadow-none hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>

        {/* Back to main site link */}
        <div className="pt-2">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
          >
            ← Back to main site
          </Link>
        </div>

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

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400 pt-2">
          <p>MRUHacks Staff Portal</p>
          <p>Contact admin if you need access</p>
        </div>
      </div>
    </div>
  );
}
