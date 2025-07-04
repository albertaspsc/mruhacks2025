"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  useRegisterForm,
  RegistrationInput,
} from "@/context/RegisterFormContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from "utils/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

type AccountForm = Pick<RegistrationInput, "schoolEmail"> & {
  password: string;
  confirmPassword: string;
};

export default function AccountPage() {
  const router = useRouter();
  const { setValues } = useRegisterForm();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AccountForm>({
    mode: "onChange", // Validate on every change
    reValidateMode: "onChange", // Re-validates on every change
  });

  const password = watch("password");

  // Validation function to show all password errors
  const validatePassword = (value: string) => {
    const errors = [];

    if (value.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/(?=.*[a-z])/.test(value)) {
      errors.push("One lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      errors.push("One uppercase letter");
    }
    if (!/(?=.*\d)/.test(value)) {
      errors.push("One number");
    }
    if (!/(?=.*[@$!%*?&])/.test(value)) {
      errors.push("One special character (@$!%*?&)");
    }

    return errors.length === 0 || `Missing: ${errors.join(", ")}`;
  };

  const onSubmit: SubmitHandler<AccountForm> = async (data) => {
    setValues(data);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        password: data.password,
        email: data.schoolEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/register/step-1`,
        },
      },
    );
    if (signUpError) {
      console.log(`Failed to sign up user, ${signUpError}`);
      return;
    } else {
      router.push(`/register/verify-2fa?email=${data.schoolEmail}`);
    }
  };

  // Handle Google OAuth sign up
  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/register/step-1`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Error with Google OAuth:", error);
        alert("Failed to sign up with Google. Please try again.");
      }
    } catch (err) {
      console.error("Google sign up error:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create Your Account</h1>

      {/* Google OAuth Section */}
      <div className="space-y-4">
        <Button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center"
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FcGoogle className="mr-2 h-4 w-4" />
          )}
          <span>Continue with Google</span>
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              Or continue manually
            </span>
          </div>
        </div>
      </div>

      {/* Manual Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Student Email */}
        <div>
          <Label htmlFor="schoolEmail">
            Student Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="schoolEmail"
            type="email"
            {...register("schoolEmail", {
              required: "Email is required",
              pattern: {
                value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                message: "Enter a valid email",
              },
            })}
            placeholder="you@student.mru.ca"
          />
          {errors.schoolEmail && (
            <p className="mt-1 text-sm text-red-600">
              {errors.schoolEmail.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
                validate: validatePassword,
              })}
              placeholder="Create a secure password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            <p className="font-medium">Password requirements:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li
                className={
                  password && password.length >= 8
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                At least 8 characters
              </li>
              <li
                className={
                  password && /(?=.*[A-Z])/.test(password)
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                One uppercase letter
              </li>
              <li
                className={
                  password && /(?=.*[a-z])/.test(password)
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                One lowercase letter
              </li>
              <li
                className={
                  password && /(?=.*\d)/.test(password)
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                One number
              </li>
              <li
                className={
                  password && /(?=.*[@$!%*?&])/.test(password)
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                One special character (@$!%*?&)
              </li>
            </ul>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              placeholder="Confirm your password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full">
          Next: Verify Email
        </Button>
      </form>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
