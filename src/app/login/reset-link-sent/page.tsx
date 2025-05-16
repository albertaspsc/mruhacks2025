"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import mascot from "@/assets/mascots/crt.svg";

export default function ResetLinkSentPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white relative overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-3xl px-8 py-10 shadow-2xl ring-2 ring-indigo-100 flex flex-col items-center space-y-6 z-10 relative">
        {/* Celebratory ico */}
        <span className="relative flex items-center justify-center mb-2">
          <svg
            className="h-16 w-16 text-indigo-500 drop-shadow-lg"
            fill="none"
            viewBox="0 0 64 64"
            stroke="currentColor"
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#a5b4fc"
              strokeWidth="4"
              fill="#f0f5ff"
            />
            <path
              d="M20 34l8 8 16-16"
              stroke="#4f46e5"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g>
              <circle cx="50" cy="18" r="2" fill="#fbbf24" />
              <circle cx="16" cy="20" r="1.5" fill="#f472b6" />
              <circle cx="44" cy="48" r="1.5" fill="#34d399" />
            </g>
          </svg>
        </span>
        <h1 className="text-4xl font-extrabold text-center text-black mb-2 drop-shadow">
          Check your email
        </h1>
        <p className="text-center text-gray-600">
          If an account exists, a password reset link has been sent to your
          email address. Please check your inbox and follow the instructions to
          reset your password.
        </p>
        <Button
          className="w-full font-semibold shadow-md"
          onClick={() => router.push("/login")}
        >
          Back to Login
        </Button>
      </div>
    </div>
  );
}
