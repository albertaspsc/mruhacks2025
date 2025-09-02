"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRegisterForm } from "@/context/RegisterFormContext";
import { Button } from "@/components/ui/button";
import MascotUrl from "@/assets/mascots/crt.svg";
import { register } from "@/db/registration";

// Simple confetti function
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
  const hasProcessed = useRef(false);
  const confettiRef = useRef<HTMLCanvasElement>(null);

  const [status, setStatus] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({
    loading: true,
    success: false,
    error: null,
  });

  useEffect(() => {
    const processRegistration = async () => {
      if (hasProcessed.current || !data) return;
      hasProcessed.current = true;

      try {
        // Validate that all required fields are present
        if (
          !data.firstName ||
          !data.lastName ||
          !data.email ||
          !data.gender ||
          !data.university ||
          !data.major ||
          !data.experience ||
          !data.marketing ||
          !data.parking ||
          !data.yearOfStudy ||
          !data.interests ||
          data.previousAttendance === undefined
        ) {
          setStatus({
            loading: false,
            success: false,
            error:
              "Missing required registration information. Please go back and complete all fields.",
          });
          return;
        }

        // Create validated registration data
        const registrationData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          gender: data.gender,
          university: data.university,
          major: data.major,
          experience: data.experience,
          marketing: data.marketing,
          previousAttendance: data.previousAttendance,
          parking: data.parking,
          yearOfStudy: data.yearOfStudy,
          accommodations: data.accommodations || "",
          dietaryRestrictions: data.dietaryRestrictions || [],
          interests: data.interests,
          resume: data.resume,
        };

        const result = await register(registrationData);

        if (result.error) {
          setStatus({
            loading: false,
            success: false,
            error: result.error,
          });
        } else {
          setStatus({
            loading: false,
            success: true,
            error: null,
          });

          // Fire confetti
          if (confettiRef.current) {
            fireConfetti(confettiRef.current);
          }
        }
      } catch (error) {
        setStatus({
          loading: false,
          success: false,
          error: "Registration failed. Please try again.",
        });
      }
    };

    processRegistration();
  }, [data]);

  // Loading state
  if (status.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">
            Processing Registration...
          </h2>
        </div>
      </div>
    );
  }

  // Error state
  if (status.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white px-4">
        <div className="w-full max-w-md bg-white border border-red-200 rounded-xl px-6 py-8 space-y-6">
          <div className="flex justify-center">
            <svg
              className="h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-center text-2xl font-semibold text-red-900">
            Registration Failed
          </h1>

          <p className="text-center text-red-700">{status.error}</p>

          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={() => router.push("/register")}
          >
            Go Back to Registration
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="flex items-start justify-center min-h-screen bg-white pt-8 px-4">
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-xl px-6 py-8 space-y-6 z-10">
        <canvas
          ref={confettiRef}
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
        />

        <div className="flex justify-center">
          <svg
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

        <h1 className="text-center text-2xl font-semibold z-10">
          Registration Complete
        </h1>

        <p className="text-center text-gray-700 z-10">
          Thanks{" "}
          <span className="font-medium text-indigo-600">{data.firstName}</span>!
          We&apos;ve got your details and can&apos;t wait to see you at
          MRUHacks.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 z-10">
          <p className="text-sm text-green-800 text-center">
            🎉 Your registration has been successfully submitted!
          </p>
        </div>

        <Button
          className="w-full bg-black hover:bg-gray-800 text-white"
          onClick={() => router.push("/user/dashboard")}
        >
          Take Me to Dashboard
        </Button>

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
