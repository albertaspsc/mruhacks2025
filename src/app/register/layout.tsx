// src/app/register/layout.tsx
"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import ProgressBar from "@/components/Register/ProgressBar";
import Image from "next/image";
import LogoUrl from "@/assets/logos/color-logo.svg";

type Props = { children: ReactNode };

export default function RegisterLayout({ children }: Props) {
  const path = usePathname() || "";
  let step = 1;
  if (path.endsWith("/step-1")) step = 2;
  if (path.endsWith("/step-2")) step = 3;
  if (path.endsWith("/complete")) step = 3; // complete = full

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="w-full max-w-md p-8 bg-white border border-gray-300 rounded-lg space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <Image
            src={LogoUrl}
            alt="MRUHacks Logo"
            width={200}
            height={60}
            priority
          />
        </div>
        <ProgressBar step={step} totalSteps={3} />
        {children}
      </div>
    </div>
  );
}
