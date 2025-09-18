import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { RegisterFormProvider } from "@/context/RegisterFormContext";
import { createClient } from "@/utils/supabase/server";
import { getRegistration } from "@/db/registration";
import { AuthRegistrationProvider } from "@/context/AuthRegistrationContext";
import { RegisterOptionsProvider } from "@/context/RegisterOptionsContext";
import RegisterLayoutInner from "./RegisterLayoutInner";

type Props = { children: ReactNode };

export default async function RegisterLayout({ children }: Props) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const { data: registration } = await getRegistration();
  const registrationExists = !!registration;
  const user = data.user;

  /** If a registration is complete, redirect to the dash */
  if (registrationExists) {
    redirect("/user/dashboard");
  }

  return (
    <AuthRegistrationProvider initial={{ user, registrationExists }}>
      <RegisterOptionsProvider>
        <RegisterFormProvider>
          <RegisterLayoutInner>{children}</RegisterLayoutInner>
        </RegisterFormProvider>
      </RegisterOptionsProvider>
    </AuthRegistrationProvider>
  );
}