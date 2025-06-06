"use client";

import React, { useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import mascot from "@/assets/mascots/crt2.svg";
import { login } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const params = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(email && password)) {
      setError("Please enter your email and password.");
    }

    const loginResult = await login(email, password);
    if (!loginResult.success) {
      setError(loginResult.error?.message ?? "");
      return;
    }

    if (loginResult.type == "signin") {
      const next = params.get("next");
      redirect(next ?? "/register");
    } else {
      redirect("/login/verify-2fa");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 w-full max-w-md bg-white border border-gray-200 rounded-3xl px-8 py-10 shadow-lg z-10 flex flex-col items-center"
      >
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
            className="mt-1 pr-10"
          />
        </div>
        {error && (
          <p className="text-red-600 text-sm text-center w-full">{error}</p>
        )}
        <Button
          type="submit"
          className="w-full bg-black text-white font-semibold shadow-none hover:bg-gray-900 transition-colors"
        >
          Log In / Sign Up
        </Button>
        {/* <Button
          type="submit"
          className="w-full bg-black text-white font-semibold shadow-none hover:bg-gray-900 transition-colors"
        >
          Sign in with Google
        </Button> */}
        <button
          type="button"
          className="w-full mt-2 py-2 rounded-xl border border-gray-300 text-black font-semibold bg-white hover:bg-gray-100 text-center transition-all duration-150 block"
          onClick={() => router.push("/login/forgot-password")}
        >
          Forgot password?
        </button>

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
      </form>
    </div>
  );
}

/*
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}
.animate-bounce-slow {
  animation: bounce-slow 2.5s infinite;
}
*/
