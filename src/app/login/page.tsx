"use client";
import { useEffect } from "react";
import { createClient } from "../../../utils/supabase/client";
import { login, signup } from "./actions";
import OneTapComponent from "../../components/GoogleOneTap/OneTap";
export default function LoginPage() {
  const supabase = createClient();
  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/register`,
      },
    });
  }

  return (
    <>
      <button onClick={() => loginWithGoogle()}>Log in with google</button>
      <form>
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="password">Password:</label>
        <input id="password" name="password" type="password" required />
        <button formAction={login}>Log in</button>
        <button formAction={signup}>Sign up</button>
      </form>
    </>
  );
}
