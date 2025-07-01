"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import ProgressBar from "@/components/Register/ProgressBar";
import Image from "next/image";
import { RegisterFormProvider } from "@/context/RegisterFormContext";
import { createClient } from "utils/supabase/client";
import { getRegistration } from "src/db/registration";

type Props = { children: ReactNode };

export default function RegisterLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Add a small delay to let auth state settle
        await new Promise((resolve) => setTimeout(resolve, 100));

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        // Allow access to the main registration page even without auth
        const isMainRegisterPage = pathname === "/register";

        // Only redirect if user is not authenticated AND trying to access protected registration steps
        if (!user && !isMainRegisterPage) {
          console.error("No authenticated user found:", error);
          router.push("/login?next=/register");
          return;
        }

        // If user is on main register page but authenticated, let them continue
        // (This handles the case where they just completed OAuth or manual registration)

        // If user is authenticated, check if they're already registered
        if (user) {
          const { data: isUserRegistered } = await getRegistration();
          if (isUserRegistered) {
            router.push("/user");
            return;
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error checking user status:", err);
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [router, pathname, supabase]);

  const path = pathname ?? "";
  let step = 1;
  if (path.includes("step-1")) step = 2;
  else if (path.includes("step-2")) step = 3;
  else if (path.includes("verify-2fa")) step = 4;
  else if (path.includes("complete")) step = 5;

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
