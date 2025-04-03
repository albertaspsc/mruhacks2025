import { createClient } from "../../../utils/supabase/client";
import { login, loginGoogle, signup } from "./actions";
export default function LoginPage() {
  // const supabase = createClient()
  // supabase.auth.signInWithOAuth({
  //     provider: 'google',
  //   })
  return (
    <>
      <form>
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="password">Password:</label>
        <input id="password" name="password" type="password" required />
        <button formAction={login}>Log in</button>
        <button formAction={signup}>Sign up</button>
      </form>
      <form>
        <button formAction={loginGoogle}>Log in wid google</button>
      </form>
    </>
  );
}
