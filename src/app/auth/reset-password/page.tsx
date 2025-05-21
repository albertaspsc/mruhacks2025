"use client";
import { redirect, useSearchParams } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";
import { Dispatch, SetStateAction, use, useEffect, useState } from "react";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { BindInput } from "../../../components/BindInput/BindInput";
import { changePassword } from "./actions";

export default function ResetPassword() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.app_metadata.provider != "email") {
        // TODO - redirect the user to an error page with some instructions
        //
        // See github issue #70
        redirect("/error?cause=not using an email provider");
      }

      if (user) {
        setUser(user);
      }
    };

    getUser();
  }, []);

  return (
    <>
      {user ? (
        <AuthorizedResetPassword {...{ supabase, user }} />
      ) : (
        <PreAuthorizationResetPassword {...{ supabase, setUser }} />
      )}
    </>
  );
}

type Props = {
  supabase: SupabaseClient;
};
function AuthorizedResetPassword({ supabase, user }: Props & { user: User }) {
  // const [passw, setPassw] = useState<string>();
  // const [passwConfirm, setPasswConfirm] = useState<string>();
  // // let usere = use(supabase.auth.getUser())
  // ;

  // const onSubmit = async () => {
  //   if (passw == passwConfirm) {
  //     const { error } = await supabase.auth.updateUser({ password: passw });
  //     if (error) {
  //       // TODO - redirect the user to an error page with some instructions
  //       //
  //       // See github issue #70
  //       redirect("/error");
  //     }

  //     redirect("/");
  //   } else {
  //     prompt("passwords don't match!");
  //   }
  // };
  return (
    <>
      <form>
        <h1>Change password for {user.email}</h1>
        <label>New Password:</label>
        <input type="password" name="password" />
        <label>Confirm Password:</label>
        <input type="password" name="confirm" />
        <button formAction={changePassword}>Change Password</button>
      </form>
    </>
  );
}

function PreAuthorizationResetPassword({
  supabase,
  setUser,
}: Props & { setUser: Dispatch<SetStateAction<User | null>> }) {
  const [email, setEmail] = useState<string>();
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      }
    });
  }, []);
  const onClick = async () => {
    if (email) {
      // zod validate
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/reset-password`,
      });
      setSent(true);
    }
  };
  return (
    <>
      <form>
        <label htmlFor="email">Email a send reset link:</label>
        <BindInput
          type="email"
          id="email"
          getState={email}
          setState={setEmail}
          placeholder="you@example.com"
          required
        />
        <button type="submit" onClick={onClick}>
          {sent ? "Code sent!" : "Send me a code"}
        </button>
      </form>
    </>
  );
}
