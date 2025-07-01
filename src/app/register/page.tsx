"use client";

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
import { createClient } from "../../../utils/supabase/client";
import { FcGoogle } from "react-icons/fc";
import { Loader2, Eye, EyeOff } from "lucide-react";

type AccountForm = Pick<
  RegistrationInput,
  "firstName" | "lastName" | "schoolEmail"
> & {
  password: string;
  confirmPassword: string;
};

export default function AccountPage() {
  const router = useRouter();
  const { setValues } = useRegisterForm();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false); // ADD THIS LINE
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountForm>({
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const password = watch("password");

  // Validation function to show all password errors
  const validatePassword = (value: string) => {
    // Skips password validation for Google users
    if (isGoogleUser) return true;

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
    try {
      // For Google users, just continue (they're already authenticated)
      if (isGoogleUser) {
        const submitData = {
          firstName: data.firstName,
          lastName: data.lastName,
          schoolEmail: data.schoolEmail,
        };
        setValues(submitData);
        router.push("/register/step-1");
        return;
      }

      // For manual users, create Supabase account first
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: data.schoolEmail,
          password: data.password,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
            },
          },
        },
      );

      if (signUpError) {
        console.error("Sign up error:", signUpError);
        alert(`Registration failed: ${signUpError.message}`);
        return;
      }

      if (!authData.user) {
        alert("Registration failed. Please try again.");
        return;
      }

      // Save form data to context (WITHOUT password fields)
      setValues({
        firstName: data.firstName,
        lastName: data.lastName,
        schoolEmail: data.schoolEmail,
        // Do not include password or confirmPassword - both handled by Supabase auth
      });

      // Check if email confirmation is required
      if (!authData.session) {
        alert(
          "Please check your email and click the confirmation link before continuing.",
        );
        return;
      }

      // User is now authenticated, proceed to next step
      router.push("/register/step-1");
    } catch (err) {
      console.error("Registration error:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  // Handle Google OAuth sign up
  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/register`,
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

  useEffect(() => {
    // Prevents multiple intializations
    if (hasInitialized) return;

    const handleGoogleUser = async () => {
      try {
        // Check if user just came from Google OAuth
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // If user came from Google OAuth, pre-fill form
          const isFromGoogle = user.app_metadata?.provider === "google";

          if (isFromGoogle) {
            setIsGoogleUser(true);

            const googleFirstName =
              user.user_metadata?.given_name ||
              user.user_metadata?.first_name ||
              "";
            const googleLastName =
              user.user_metadata?.family_name ||
              user.user_metadata?.last_name ||
              "";
            const googleEmail = user.email || "";

            // Pre-fill form with Google data
            setValue("firstName", googleFirstName);
            setValue("lastName", googleLastName);
            setValue("schoolEmail", googleEmail);

            // Set values in context (without password)
            setValues({
              firstName: googleFirstName,
              lastName: googleLastName,
              schoolEmail: googleEmail,
            });
          }
        }

        // Mark as initialized to prevent running again
        setHasInitialized(true);
      } catch (err) {
        console.error("Error checking Google user:", err);
        setHasInitialized(true);
      }
    };

    handleGoogleUser();
  }, [setValue, setValues, supabase, hasInitialized]); // Include hasInitialized in dependencies

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create Your Account</h1>

      {/* Show different content based on user type */}
      {!isGoogleUser ? (
        <>
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
        </>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800 text-sm">
            ✓ Connected with Google. Please review and confirm your details
            below.
          </p>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* First Name */}
        <div>
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            {...register("firstName", { required: "First name is required" })}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <Label htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            {...register("lastName", { required: "Last name is required" })}
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.lastName.message}
            </p>
          )}
        </div>

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
            disabled={isGoogleUser} // Disabled for Google users
          />
          {errors.schoolEmail && (
            <p className="mt-1 text-sm text-red-600">
              {errors.schoolEmail.message}
            </p>
          )}
          {isGoogleUser && (
            <p className="mt-1 text-xs text-gray-500">
              This email is from your Google account and cannot be changed.
            </p>
          )}
        </div>

        {/* Password fields - only show for manual registration */}
        {!isGoogleUser && (
          <>
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
          </>
        )}

        <Button type="submit" className="w-full">
          {isGoogleUser ? "Continue to Next Step" : "Next: Personal Details"}
        </Button>
      </form>

      {/* Login Link */}
      {!isGoogleUser && (
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
      )}
    </div>
  );
}
