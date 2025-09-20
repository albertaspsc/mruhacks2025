"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ProgressBar from "@/components/Register/ProgressBar";

export default function RegisterLayoutInner({
  children,
}: {
  children: ReactNode;
}) {
  const path = usePathname() ?? "";
  // Deterministic route → step mapping for the registration flow
  // Account = 1, Personal = 2, Final = 3, Complete = 4
  const ROUTE_STEP: Array<[RegExp, number]> = [
    [/^\/register\/?$/, 1],
    [/^\/register\/verify-2fa\/?$/, 1],
    [/^\/register\/step-1\/?$/, 2],
    [/^\/register\/step-2\/?$/, 3],
    [/^\/register\/complete\/?$/, 4],
  ];

  const step = ROUTE_STEP.find(([re]) => re.test(path))?.[1] ?? 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white pt-[70px] max-[375px]:pt-[60px] max-[320px]:pt-[55px]">
      <div className="space-y-6 w-full max-w-md bg-white border border-gray-200 rounded-3xl px-8 py-10 shadow-lg z-10 flex flex-col items-center">
        <div className="flex justify-center">
          <Image
            src="/color-logo.svg"
            alt="MRUHacks Logo"
            width={200}
            height={60}
            className="w-full h-auto"
            priority
          />
        </div>
        <ProgressBar step={step} totalSteps={4} />
        {children}
      </div>
    </div>
  );
}
