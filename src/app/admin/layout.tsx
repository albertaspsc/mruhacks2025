"use client";

import React, { ReactNode, useEffect } from "react";
import { redirect } from "next/navigation";
import { createClient } from "utils/supabase/client";
import { isAdmin } from "src/db/admin";

type Props = { children: ReactNode };

export default function RegisterLayout({ children }: Props) {
  // if ()
  const supabase = createClient();
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!user) {
        console.error(error);
        redirect("/login?next=/admin");
      }
      const { data: isUserAdmin } = await isAdmin();
      if (!isUserAdmin) {
        redirect("/register");
      }
    };
    getUser();
  });

  return <>{children}</>;
}
