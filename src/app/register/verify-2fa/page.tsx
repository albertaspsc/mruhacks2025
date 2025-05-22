"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import MascotUrl from "@/assets/mascots/crt.svg";

export default function Verify2FAPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string>("");
  const [cooldown, setCooldown] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Get email from query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("email");
    if (!e) {
      router.push("/register");
    } else {
      setEmail(e);
    }
  }, [router]);

  // Simulate sending email (backend call)
  const sendVerificationEmail = async () => {
    if (!email) return;
    setStatus("sending");
    setError("");

    try {
      // await fetch(`/api/send-verify-email?email=${encodeURIComponent(email)}`);
      await new Promise((res) => setTimeout(res, 1200)); // Simulate network
      setStatus("sent");
      setCooldown(30);

      // Clear any existing interval
      if (intervalId) {
        clearInterval(intervalId);
      }

      // Set new interval
      const id = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(id);
            setIntervalId(null);
            return 0;
          }
          return c - 1;
        });
      }, 1000);

      setIntervalId(id);
    } catch (e) {
      setStatus("error");
      setError("Failed to send verification email. Please try again.");
    }
  };

  useEffect(() => {
    if (email) sendVerificationEmail();

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);
  if (email === null) return null;

  return (
    <div className="flex items-start justify-center min-h-screen bg-white pt-8 px-4">
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl px-6 py-8 space-y-6 z-10 shadow-xl">
        {" "}
        {/* Added shadow-xl, changed rounded-xl to rounded-2xl */}
        {/* Email icon */}
        <div className="flex justify-center">
          <div className="bg-black/5 rounded-full p-3">
            {" "}
            {/* Changed bg-gray-100 to bg-black/5 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-9 w-9 text-black" // Changed from text-green-500 to text-black
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-center">
          Verify Your Email
        </h1>
        <p className="text-gray-700 text-base leading-relaxed text-center">
          We sent a verification link to{" "}
          <span className="font-medium text-black">{email}</span>.{" "}
          {/* Removed break-all class */}
          Please check your inbox to continue registration.
        </p>
        {status === "sent" && (
          <p className="text-black text-sm font-medium text-center">
            Verification email sent! Check your inbox.
          </p>
        )}{" "}
        {status === "error" && (
          <p className="text-red-600 text-sm font-medium text-center">
            {error}
          </p>
        )}
        <Button
          type="button"
          className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded-lg transition hover:scale-[1.02] active:scale-[0.98]" /* Added hover and active scale */
          onClick={sendVerificationEmail}
          disabled={status === "sending" || cooldown > 0}
        >
          {status === "sending"
            ? "Sending..."
            : cooldown > 0
              ? `Resend Email (${cooldown}s)`
              : "Resend Email"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full text-black hover:bg-gray-100"
          onClick={() => router.push("/register")}
        >
          Back to Register
        </Button>
        {/* Mascot */}
        <div className="flex justify-center pt-4">
          <Image
            src={MascotUrl}
            alt="MRUHacks Mascot"
            width={100}
            height={100}
            className="object-contain opacity-90" /* Changed opacity-80 to opacity-90 */
            priority
          />
        </div>
        {/* dev button */}
        <button
          type="button"
          onClick={() => router.push("/register/complete")}
          className="absolute bottom-2.5 right-[18px] text-[11px] text-black opacity-35 bg-transparent border-none cursor-pointer tracking-[1.5px] z-1"
          tabIndex={-1}
        >
          dev complete &rarr;
        </button>
      </div>
    </div>
  );
}
