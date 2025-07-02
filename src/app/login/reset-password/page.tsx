"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import mascot from "@/assets/mascots/crt2.svg";
import { createClient } from "utils/supabase/client";

function validatePassword(password: string) {
  if (!password) return "Password is required";
  if (password.length < 8) return "At least 8 characters";
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/.test(password))
    return "Must include upper, lower, number & special";
  return null;
}

const requirements = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw: string) => /\d/.test(pw) },
  { label: "One special character", test: (pw: string) => /\W/.test(pw) },
];

// Confetti helper
const fireConfetti = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = (canvas.width = canvas.parentElement?.clientWidth || 300);
  const h = (canvas.height = 200);
  const pieces = Array.from({ length: 60 }).map(() => ({
    x: Math.random() * w,
    y: Math.random() * -h,
    r: Math.random() * 6 + 4,
    d: Math.random() * 10 + 10,
    tilt: Math.random() * 10 - 10,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
  }));
  let angle = 0;
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    pieces.forEach((p) => {
      p.y += Math.cos(angle + p.d) + 2 + p.r / 2;
      p.x += Math.sin(angle);
      p.tilt += Math.sin(angle) * 0.5;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.lineTo(p.x + p.tilt - p.r / 2, p.y);
      ctx.fill();
    });
    angle += 0.02;
    requestAnimationFrame(draw);
  };
  draw();
};

const ResetPasswordPageContent = () => {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const confettiRef = useRef<HTMLCanvasElement>(null);

  // For animated requirements
  const getReqStatus = (pw: string) => requirements.map((r) => r.test(pw));
  const reqStatus = getReqStatus(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const { error: passwChangeError } = await supabase.auth.updateUser({
      password,
    });
    if (passwChangeError) {
      setError(passwChangeError.message);
      return;
    }
    setError("");
    setSuccess(true);
    setTimeout(() => router.push("/user/dashboard"), 1800);
  };

  useEffect(() => {
    if (success && confettiRef.current) fireConfetti(confettiRef.current);
  }, [success]);

  useEffect(() => {
    if (error === "Passwords do not match") {
      if (password === confirmPassword) {
        setError("");
      }
    }
  }, [password, confirmPassword, error]);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        const { error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.log("ATUH", authError);
        }
      }
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 w-full max-w-md bg-white border border-gray-200 rounded-3xl px-8 py-10 shadow-lg z-10 flex flex-col items-center relative"
      >
        {/* Confetti canvas inside the card, only visible on success */}
        {success && (
          <canvas
            ref={confettiRef}
            className="pointer-events-none absolute inset-x-0 top-0 h-40"
          />
        )}
        <h1 className="text-3xl font-bold text-center text-black mb-2">
          Change your password
        </h1>
        <div className="w-full relative">
          <Label htmlFor="password">
            New Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            required
            className="mt-1 pr-10"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={0}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-black focus:outline-none"
            style={{ outline: "none" }}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.33 1.14-.86 2.197-1.555 3.104M15.54 15.54A5.978 5.978 0 0112 17c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.104"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.104M6.223 6.223A9.956 9.956 0 012.458 12c1.274 4.057 5.065 7 9.542 7 1.61 0 3.13-.38 4.437-1.06M17.657 16.657A9.956 9.956 0 0021.542 12c-.33-1.14-.86-2.197-1.555-3.104M9.88 9.88A3 3 0 0115 12m-3 3a3 3 0 01-3-3m0 0a3 3 0 013-3m0 0a3 3 0 013 3"
                />
              </svg>
            )}
          </button>
          {/* Live requirements list with checkmarks */}
          <ul className="mt-2 ml-1 space-y-1 text-sm">
            {requirements.map((r, i) => (
              <li
                key={r.label}
                className="flex items-center gap-2 font-medium transition-colors duration-200"
              >
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200`}
                >
                  {r.test(password) ? (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      viewBox="0 0 16 16"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8l3 3 5-5"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-gray-300"
                      fill="none"
                      viewBox="0 0 16 16"
                      stroke="currentColor"
                    >
                      <circle cx="8" cy="8" r="7" strokeWidth={2} />
                    </svg>
                  )}
                </span>
                <span
                  className={r.test(password) ? "text-black" : "text-gray-400"}
                >
                  {r.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full">
          <Label htmlFor="confirmPassword">
            Confirm New Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
            className="mt-1"
          />
          {error === "Passwords do not match" && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
        {error && error !== "Passwords do not match" && (
          <p className="text-red-600 text-sm text-center w-full">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm text-center w-full">
            Password changed! Redirecting...
          </p>
        )}
        <Button
          type="submit"
          className="w-full bg-black text-white font-semibold shadow-none hover:bg-gray-900 transition-colors"
        >
          Change Password
        </Button>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full mt-2 py-2 rounded-xl border border-gray-300 text-black font-semibold bg-white hover:bg-gray-100 text-center transition-all duration-150 block"
        >
          Back to Login
        </button>
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
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
