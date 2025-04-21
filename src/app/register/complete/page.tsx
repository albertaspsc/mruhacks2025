"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MascotUrl from "@/assets/mascots/crt.svg";

export default function CompletePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 max-w-sm mx-auto">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 text-green-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2l4-4"
        />
      </svg>

      <h1 className="text-2xl font-semibold">Registration Complete</h1>

      <p className="text-gray-600">
        Thank you! We’ve received your information and look forward to seeing
        you at MRUHacks.
      </p>

      <button
        onClick={() => router.push("/")}
        className="px-6 py-2 border border-gray-800 rounded shadow-sm hover:bg-gray-900 hover:text-white transition"
      >
        Take Me Home
      </button>

      <Image
        src={MascotUrl}
        alt="MRUHacks Mascot"
        width={120}
        height={120}
        className="w-auto h-32"
        priority
      />
    </div>
  );
}
