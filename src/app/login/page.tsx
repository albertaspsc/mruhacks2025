"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import mascot from "@/assets/mascots/crt2.svg";
import { login, loginWithGoogle } from "./actions";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    try {
      await login(formData);
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="space-y-6 w-full max-w-md bg-white border border-gray-200 rounded-3xl px-8 py-10 shadow-lg z-10 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center text-black mb-2">
          Log In
        </h1>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="w-full">
            <Label htmlFor="email" className="text-black">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@mtroyal.ca"
              required
              autoComplete="email"
              className="mt-1 pr-10 text-black"
            />
          </div>

          <div className="w-full">
            <Label htmlFor="password" className="text-black">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="mt-1 pr-10 text-black"
            />
          </div>

          {error && (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm text-center">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-black text-white font-semibold shadow-none hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            Log In
          </Button>
        </form>

        {/* Google Sign In Button */}

        <Button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full mt-2 py-2 rounded-xl border border-gray-300 text-black font-semibold bg-white hover:bg-gray-100 text-center transition-all duration-150 flex items-center justify-center gap-2"
          style={{ color: "#000" }}
        >
          <FcGoogle size={20} /> Sign in with Google
        </Button>
        <button
          type="button"
          className="w-full mt-2 py-2 rounded-xl border border-gray-300 text-black font-semibold bg-white hover:bg-gray-100 text-center transition-all duration-150 block"
          onClick={() => router.push("/auth/forgot-password")}
        >
          Forgot password?
        </button>

        {/* Small staff login link at the bottom */}
        <div className="pt-2">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
            onClick={() => router.push("/admin-login-portal")}
          >
            Admin/Volunteer Login
          </button>
        </div>
        <div className="w-full text-center pt-2">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-black font-semibold hover:underline focus:outline-none focus:underline"
            >
              Create one
            </button>
          </p>
        </div>
        <div className="flex justify-center pt-4">
          <Image
            src={mascot}
            alt="MRUHacks Mascot"
            width={110}
            height={110}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
