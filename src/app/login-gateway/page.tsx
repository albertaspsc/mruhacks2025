"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import mascot from "@/assets/mascots/crt.svg";
import logo from "@/assets/logos/color-logo.svg";
import { Button } from "@/components/ui/button";

export default function LoginGateway() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-fuchsia-50 to-amber-50 relative overflow-hidden">
      {/* Background accent blob */}
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-indigo-200 via-fuchsia-100 to-amber-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 right-0 w-[320px] h-[320px] bg-gradient-to-tr from-fuchsia-200 via-indigo-100 to-amber-100 rounded-full blur-2xl opacity-30" />
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl px-8 py-12 shadow-2xl ring-2 ring-indigo-100 flex flex-col items-center z-10 relative border border-white/40">
        {/* Logo */}
        <Image
          src={logo}
          alt="MRUHacks Logo"
          width={120}
          height={120}
          className="mb-4"
          priority
        />
        {/* Mascot */}
        <Image
          src={mascot}
          alt="MRUHacks Mascot"
          width={110}
          height={110}
          className="mb-6 drop-shadow-xl"
          priority
        />
        {/* Welcome Text */}
        <h1 className="text-4xl font-extrabold text-center text-black mb-2 drop-shadow">
          Welcome to MRUHacks
        </h1>
        <p className="text-center text-gray-600 mb-8 text-lg font-medium">
          Join the hackathon. Build, learn, and connect.
          <br />
          Are you ready?
        </p>
        {/* Action Buttons */}
        <div className="flex flex-col gap-4 w-full">
          <Button
            className="w-full bg-black text-white font-bold py-3 rounded-xl text-lg shadow-none hover:bg-gray-900 transition-colors"
            onClick={() => router.push("/login")}
          >
            Log In
          </Button>
          <Button
            className="w-full bg-white !text-black font-bold py-3 rounded-xl text-lg border border-gray-300 shadow-none hover:bg-gray-100 transition-colors"
            onClick={() => router.push("/register")}
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
}
