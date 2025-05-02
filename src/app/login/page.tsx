"use client";
import Image from "next/image";
import { login, loginWithGoogle } from "./actions";
import "./styles.scss";

export default function LoginPage() {
  return (
    <>
      <form>
        <h1 className="text-2xl font-semibold">Sign Up</h1>

        <div>
          <label htmlFor="email">Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input name="password" type="password" required />
          <a href="/auth/reset-password">Forgot Password?</a>
        </div>

        <button type="submit" className="w-full" formAction={login}>
          Sign Up / Login
        </button>
      </form>
    </>
  );
}
