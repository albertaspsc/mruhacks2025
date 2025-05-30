"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import mascot from "@/assets/mascots/crt2.svg";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | "success" | "fail">(null);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: Accept any email ending with @mtroyal.ca as success
    if (/^[^@\s]+@mtroyal\.ca$/.test(email)) {
      setStatus("success");
      setError("");
      setTimeout(() => (window.location.href = "/login/reset-link-sent"), 1200);
    } else {
      setStatus("fail");
      setError("No account found with that email.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 w-full max-w-md bg-white border border-gray-200 rounded-3xl px-8 py-10 shadow-lg z-10 flex flex-col items-center"
      >
        <h1 className="text-3xl font-bold text-center text-black mb-2">
          Forgot Password
        </h1>
        <div className="w-full">
          <Label htmlFor="email">Enter your student email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@mtroyal.ca"
            required
            className="mt-1 pr-10"
          />
        </div>
        {status === "success" && (
          <p className="text-green-600 text-sm text-center w-full">
            If an account exists, a reset link has been sent to your email.
          </p>
        )}
        {status === "fail" && (
          <p className="text-red-600 text-sm text-center w-full">{error}</p>
        )}
        <Button
          type="submit"
          className="w-full bg-black text-white font-semibold shadow-none hover:bg-gray-900 transition-colors"
        >
          Send Reset Link
        </Button>
        <a
          href="/login"
          className="w-full mt-2 py-2 rounded-xl border border-gray-300 text-black font-semibold bg-white hover:bg-gray-100 text-center transition-all duration-150 block"
        >
          Back to Login
        </a>
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
}
