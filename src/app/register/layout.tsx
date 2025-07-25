"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import ProgressBar from "@/components/Register/ProgressBar";
import Image from "next/image";
import { RegisterFormProvider } from "@/context/RegisterFormContext";
import { createClient } from "@/utils/supabase/client";
import { getRegistration } from "@/db/registration";

type Props = {
  children: ReactNode;
};

export default function RegisterLayout({ children }: Props) {
  const supabase = createClient();
  const path = usePathname() ?? "";
  const [isLoading, setIsLoading] = useState(true);

  let step = 1;
  if (path.includes("verify-2fa")) step = 2;
  else if (path.includes("step-1")) step = 3;
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

        // Handle different page access permissions
        if (path === "/register") {
          // On main registration page
          if (user && user.email_confirmed_at) {
            // User is authenticated and verified, go to step-1
            redirect("/register/step-1");
            return;
          }
          // Allow access to registration page
        } else if (path.includes("verify-2fa")) {
          // On email verification page - allow access
          // (Users can be here whether authenticated or not)
        } else if (path.includes("step-1")) {
          // On step-1 page - require authenticated user
          if (error || !user) {
            redirect("/register");
            return;
          }
          if (!user.email_confirmed_at) {
            redirect(`/register/verify-2fa?email=${user.email}`);
            return;
          }
          // User is properly authenticated and verified - allow access
        } else if (path.includes("step-2")) {
          // On step-2 page - require authenticated user
          if (error || !user) {
            redirect("/register");
            return;
          }
          if (!user.email_confirmed_at) {
            redirect(`/register/verify-2fa?email=${user.email}`);
            return;
          }
          // User is properly authenticated and verified - allow access
        } else if (path.includes("complete")) {
          // On completion page - require authenticated user
          if (error || !user) {
            redirect("/register");
            return;
          }
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
