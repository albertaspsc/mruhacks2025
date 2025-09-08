"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import ProgressBar from "@/components/Register/ProgressBar";
import Image from "next/image";
import {
  RegisterFormProvider,
  useRegisterForm,
} from "@/context/RegisterFormContext";
import { createClient } from "@/utils/supabase/client";
import { getRegisterRedirect } from "@/utils/auth/guards";
import { getRegistration } from "@/db/registration";

type Props = {
  children: ReactNode;
};

// Inner component that has access to the RegisterFormContext
function RegisterLayoutInner({ children }: Props) {
  const supabase = createClient();
  const path = usePathname() ?? "";
  const [isLoading, setIsLoading] = useState(true);

  let step = 1;
  if (path.includes("step-1")) step = 3;
  else if (path.includes("step-2")) step = 4;
  else if (path.includes("complete")) step = 5;

  useEffect(() => {
    const assertPermission = async () => {
      try {
        // Check if user is already fully registered
        const { data: isUserRegistered } = await getRegistration();
        if (isUserRegistered) {
          redirect("/user/dashboard");
          return;
        }

        // Get current user and auth status
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        console.log("Current user:", user, "Error:", error);

        // Centralized decision: compute a single canonical redirect (if any)
        const redirectTo = getRegisterRedirect(
          { user },
          path,
          Boolean(isUserRegistered),
        );
        if (redirectTo) {
          redirect(redirectTo);
          return;
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Permission check error:", err);
        setIsLoading(false);
      }
    };

    assertPermission();
  }, [path, supabase.auth]);

  // Show loading while checking permissions
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black pt-[70px]">
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
  );
}

export default function RegisterLayout({ children }: Props) {
  return (
    <RegisterFormProvider>
      <RegisterLayoutInner>{children}</RegisterLayoutInner>
    </RegisterFormProvider>
  );
}
