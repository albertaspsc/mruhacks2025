"use client";
import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import { register } from "./actions";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
export default function PrivatePage() {
  const supabase = createClient();
  const [user, setUser] = useState<User>();
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!user) {
        console.log(error);
        redirect("/error?no_auth");
      }
      console.log(user);
    };
    getUser();
  });

  return (
    <>
      <p>
        Hello {user?.email}
        {/* TODO put in actual form */}
      </p>
      <form></form>
    </>
  );
}
