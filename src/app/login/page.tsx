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
      <form
        onSubmit={handleSubmit}
        className="space-y-6 w-full max-w-md bg-white border border-gray-200 rounded-3xl px-8 py-10 shadow-lg z-10 flex flex-col items-center"
      >
        <h1 className="text-3xl font-bold text-center text-black mb-2">
          Log In
        </h1>
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
            className="mt-1 pr-10 text-black"
          />
        </div>
        {error && (
          <p className="text-red-600 text-sm text-center w-full">{error}</p>
        )}
        <Button
          type="submit"
          className="w-full bg-black text-white font-semibold shadow-none hover:bg-gray-900 transition-colors"
        >
          Log In
        </Button>
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
          onClick={() => router.push("/login/forgot-password")}
        >
          Forgot password?
        </button>
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
      </form>
    </div>
  );
}
