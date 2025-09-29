import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { RegisterFormProvider } from "@/context/RegisterFormContext";
import { createClient } from "@/utils/supabase/server";
import { getRegistrationDataAction } from "@/actions/registrationActions";
import { AuthRegistrationProvider } from "@/context/AuthRegistrationContext";
import { RegisterOptionsProvider } from "@/context/RegisterOptionsContext";
import RegisterLayoutInner from "./RegisterLayoutInner";

type Props = { children: ReactNode };

export default async function RegisterLayout({ children }: Props) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (user) {
    // Check if user is already registered using the service
    const registrationResult = await getRegistrationDataAction();
    const registrationExists =
      registrationResult.success && !!registrationResult.data;

    // If a registration is complete, redirect to the dash
    if (registrationExists) {
      redirect("/user/dashboard");
    }
  }

  return (
    <AuthRegistrationProvider initial={{ user, registrationExists: false }}>
      <RegisterOptionsProvider>
        <RegisterFormProvider>
          <RegisterLayoutInner>{children}</RegisterLayoutInner>
        </RegisterFormProvider>
      </RegisterOptionsProvider>
    </AuthRegistrationProvider>
  );
}
