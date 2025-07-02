"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  RegistrationSchema,
  useRegisterForm,
} from "@/context/RegisterFormContext";
import { Button } from "@/components/ui/button";
import MascotUrl from "@/assets/mascots/crt.svg";
import { register } from "src/db/registration";

// tiny confetti helper
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

export default function CompletePage() {
  const router = useRouter();
  const { data } = useRegisterForm();
  const hasLogged = useRef(false);
  const confettiRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const sendRegistration = async () => {
      if (!hasLogged.current) {
        const { data: registration, error: validationError } =
          RegistrationSchema.safeParse(data);
        if (validationError) {
          console.error(validationError);
          router.push("/register?error");
        } else {
          const { error } = await register(registration);
          if (error) {
            console.error(error);
          }
        }
        hasLogged.current = true;
      }
      if (confettiRef.current) fireConfetti(confettiRef.current);
    };

    sendRegistration();
  }, [data]);

  return (
    <div className="flex items-start justify-center min-h-screen bg-white pt-8 px-4">
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-xl px-6 py-8 space-y-6 z-10">
        {/* confetti canvas inside the card */}
        <canvas
          ref={confettiRef}
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
        />

        {/* bouncing check */}
        <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-green-500 animate-bounce z-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M9 12l2 2l4-4"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-center text-2xl font-semibold z-10">
          Registration Complete
        </h1>

        {/* Personalized message */}
        <p className="text-center text-gray-700 z-10">
          Thanks{" "}
          <span className="font-medium text-indigo-600">{data.firstName}</span>!
          We’ve got your details and can’t wait to see you at MRUHacks.
        </p>

        {/* Dashboard button */}
        <Button
          type="button"
          className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded-lg transition z-10" // Changed to black button style
          onClick={() => router.push("/user/dashboard")}
        >
          Take Me to Dashboard
        </Button>

        {/* Mascot */}
        <div className="flex justify-center pt-4 z-10">
          <Image
            src={MascotUrl}
            alt="MRUHacks Mascot"
            width={120}
            height={120}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
