// src/app/register/verify-2fa/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Verify2FAPage() {
  const router = useRouter();

  // grab email from query in a browser-only effect
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("email");
    if (!e) {
      router.push("/register");
    } else {
      setEmail(e);
    }
  }, [router]);

  // six single-digit inputs
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string>("");

  // focus first box on mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  function handleChange(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError("");
    if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code === "123456") {
      router.push("/register/complete");
    } else {
      setError("🚫 Invalid code, please try again.");
      setDigits(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    }
  }

  // wait until we have email before rendering
  if (email === null) return null;

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <h1 className="text-center text-3xl font-bold">MRUHacks</h1>
      <div className="border-b border-gray-300" />

      <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
        <h2 className="text-xl font-semibold text-center">
          Two-Factor Authentication
        </h2>
        <p className="text-center text-gray-600">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-indigo-600">{email}</span>
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex justify-center space-x-2">
            {digits.map((d, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                className="w-12 h-12 border border-gray-300 rounded text-center text-lg focus:border-indigo-500 focus:outline-none"
              />
            ))}
          </div>

          {error && <p className="text-center text-red-600 text-sm">{error}</p>}

          <Button type="submit" className="w-full">
            Verify &amp; Continue
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Didn’t get a code?{" "}
          <button
            onClick={() => {
              // TODO: trigger your resend-code API
            }}
            className="text-indigo-600 hover:underline"
          >
            Resend code
          </button>
        </p>
      </div>
    </div>
  );
}
