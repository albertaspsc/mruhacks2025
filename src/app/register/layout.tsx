"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import ProgressBar from "@/components/Register/ProgressBar";
import Image from "next/image";
import { RegisterFormProvider } from "@/context/RegisterFormContext";
import { createClient } from "@/utils/supabase/client";
import { getRegisterRedirect } from "@/utils/auth/guards";
import { getRegistration } from "@/db/registration";
import { AuthRegistrationProvider } from "@/context/AuthRegistrationContext";

type Props = { children: ReactNode };

// Inner component that has access to the RegisterFormContext
function RegisterLayoutInner({ children }: Props) {
  const path = usePathname() ?? "";
  let step = 1;
  if (path.includes("step-1")) step = 3;
  else if (path.includes("step-2")) step = 4;
  else if (path.includes("complete")) step = 5;

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
  const supabase = createClient();
  const path = usePathname() ?? "";
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [registrationExists, setRegistrationExists] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const { data: registration } = await getRegistration();
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser ?? null);
        const registrationFlag = Boolean(registration);
        setRegistrationExists(registrationFlag);

        if (registrationFlag) {
          redirect("/user/dashboard");
          return;
        }

        const redirectTo = getRegisterRedirect(
          { user: currentUser },
          path,
          registrationFlag,
        );
        if (redirectTo) {
          redirect(redirectTo);
          return;
        }
      } catch (e) {
        console.error("Register layout permission check failed", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [path, supabase.auth]);

  if (loading) {
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
    <AuthRegistrationProvider initial={{ user, registrationExists }}>
      <RegisterFormProvider>
        <RegisterLayoutInner>{children}</RegisterLayoutInner>
      </RegisterFormProvider>
    </AuthRegistrationProvider>
  );
}
