"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import ProgressBar from "@/components/Register/ProgressBar";
import Image from "next/image";
import { RegisterFormProvider } from "@/context/RegisterFormContext";
import { createClient } from "utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { getRegistration } from "src/db/registration";

type Props = { children: ReactNode };

export default function RegisterLayout({ children }: Props) {
  useEffect(() => {
    const getUser = async () => {
      const { data: userRegistration } = await getRegistration();
      if (!userRegistration) {
        redirect("/register");
      }
    };
    getUser();
  });

  return <>{children}</>;
}
