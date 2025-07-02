"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import ProgressBar from "@/components/Register/ProgressBar";
import Image from "next/image";
import { RegisterFormProvider } from "@/context/RegisterFormContext";
import { createClient } from "utils/supabase/client";
import { getRegistration } from "src/db/registration";

type Props = { children: ReactNode };

export default function RegisterLayout({ children }: Props) {
  const supabase = createClient();

  const path = usePathname() ?? "";
  let step = 1;
  if (path.includes("verify-2fa")) step = 2;
  else if (path.includes("step-1")) step = 3;
  else if (path.includes("step-2")) step = 4;
  else if (path.includes("complete")) step = 5;

  useEffect(() => {
    const assertPermission = async () => {
      const { data: isUserRegistered } = await getRegistration();
      if (isUserRegistered) {
        redirect("/user/dashboard");
      }

      const { error } = await supabase.auth.getUser();
      if (step >= 3 && error) {
        redirect("/register");
      } else if (!error) {
        redirect("/register/step-1");
      }
    };
    assertPermission();
  }, []);

  return (
    <RegisterFormProvider>
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <div className="w-full max-w-md p-8 bg-white border rounded-lg space-y-6">
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
          <ProgressBar step={step} totalSteps={5} />
          {children}
        </div>
      </div>
    </RegisterFormProvider>
  );
}
