"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RegisterFormProvider } from "@/context/RegisterFormContext";
import ProgressBar from "@/components/Register/ProgressBar";
import Image from "next/image";

type Props = { children: ReactNode };

export default function RegisterLayout({ children }: Props) {
  const path = usePathname() || "";
  let step = 1;
  if (path.includes("step-1")) step = 2;
  if (path.includes("step-2")) step = 3;
  if (path.includes("complete")) step = 3;

  return (
    <RegisterFormProvider>
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <div className="w-full max-w-md p-8 bg-white border rounded-lg space-y-6">
          <div className="flex justify-center">
            <Image
              src="/color-logo.svg"
              alt="MRUHacks"
              width={200}
              height={60}
              className="h-auto w-full"
              priority
            />
          </div>
          <ProgressBar step={step} totalSteps={3} />
          {children}
        </div>
      </div>
    </RegisterFormProvider>
  );
}
