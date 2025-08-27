"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  useRegisterForm,
  RegistrationInput,
  RegistrationSchema,
} from "@/context/RegisterFormContext";
import { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useRef } from "react";
import { getMajorsAndUniversities } from "@/db/registration";
import { createClient } from "@/utils/supabase/client";

type PersonalForm = {
  previousAttendance: string;
  gender: string;
  university: string;
  major: string;
  yearOfStudy: "1st" | "2nd" | "3rd" | "4th+" | "Recent Grad";
  firstName: string;
  lastName: string;
  email: string;
};

export default function Step1Page() {
  const supabase = createClient();
  const router = useRouter();
  const { setValues } = useRegisterForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PersonalForm>({
    defaultValues: {},
  });

  const [institutions, setInstitutions] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const hasSetInitialValues = useRef(false); // Prevent multiple calls

  const GENDER_OPTIONS = [
    { value: "1", label: "Male" },
    { value: "2", label: "Female" },
    { value: "3", label: "Other" },
    { value: "4", label: "Prefer not to say" },
  ];

  // Handle authentication and session verification
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Get current user session
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Auth error:", error);
          setAuthError("Authentication error. Please sign in again.");
          setTimeout(() => router.push("/register"), 2000);
          return;
        }

        if (!user) {
          console.log("No user found, redirecting to registration");
          setAuthError("Please complete email verification first.");
          setTimeout(() => router.push("/register"), 2000);
          return;
        }

        // Check if email is verified
        if (!user.email_confirmed_at) {
          console.log("Email not confirmed, redirecting to verification");
          setAuthError("Please verify your email first.");
          setTimeout(
            () => router.push(`/register/verify-2fa?email=${user.email}`),
            2000,
          );
          return;
        }

        // User is properly authenticated and verified
        console.log("User authenticated successfully:", user.email);
        setUser(user);
        setLoading(false);
      } catch (err) {
        console.error("Unexpected error during auth check:", err);
        setAuthError("An unexpected error occurred. Please try again.");
        setTimeout(() => router.push("/register"), 2000);
      }
    };

    checkAuthentication();
  }, [router, supabase.auth]);

  // Handle auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      if (event === "SIGNED_OUT") {
        router.push("/register");
      }

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  useEffect(() => {
    const loadLists = async () => {
      const { majors, universities } = await getMajorsAndUniversities();
      setMajors(majors.map((m) => m.value));
      setInstitutions(universities.map((u) => u.value));
    };
    loadLists();
  }, []);

  // Fixed useEffect - prevent infinite loop
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        // Only proceed if we have a verified user and haven't set values yet
        if (!user || hasSetInitialValues.current) return;

        hasSetInitialValues.current = true; // Prevent multiple calls

        console.log("Setting initial values for user:", user.email);

        // Set email in context
        setValues({ email: user.email || "" });

        // If user came from Google OAuth, pre-fill form
        const isGoogleUser = user.app_metadata?.provider === "google";

        if (isGoogleUser) {
          const googleFirstName =
            user.user_metadata?.given_name ||
            user.user_metadata?.first_name ||
            "";
          const googleLastName =
            user.user_metadata?.family_name ||
            user.user_metadata?.last_name ||
            "";

          console.log("Pre-filling Google data:", {
            googleFirstName,
            googleLastName,
          });

          // Pre-fill form with Google data
          setValue("firstName", googleFirstName);
          setValue("lastName", googleLastName);
          setValue("email", user.email || "");

          // Set values in context
          setValues({
            email: user.email || "",
            firstName: googleFirstName,
            lastName: googleLastName,
          });
        } else {
          // For non-Google users, just set email
          setValue("email", user.email || "");
        }
      } catch (err) {
        console.error("Error getting user profile:", err);
      }
    };

    getUserProfile();
  }, [user]); // Removed setValues and setValue from dependencies

  const onSubmit: SubmitHandler<PersonalForm> = (data) => {
    console.log("Form submitted with data:", data);

    const formattedData = {
      ...data,
      previousAttendance: data.previousAttendance === "true", // Now correctly typed
    };

    console.log("Formatted data:", formattedData);

    setValues(formattedData);
    router.push("/register/step-2");
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="text-gray-600">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // Show error state if authentication failed
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center space-y-4 max-w-md mx-auto px-6">
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-red-600">
            Authentication Required
          </h1>
          <p className="text-gray-600">{authError}</p>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show the actual step-1 form content once authenticated
  return (
    <div className="space-y-6">
      {/* Success message showing verified email */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Email verified successfully:{" "}
              <span className="font-semibold">{user?.email}</span>
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h1 className="text-2xl font-semibold">Personal Details</h1>

        {/* Email (hidden, auto-filled) */}
        <input type="hidden" {...register("email")} />

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

        {/* Attended Before */}
        <div>
          <Label htmlFor="previousAttendance">
            Have you attended MRUHacks before?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <select
            id="previousAttendance"
            {...register("previousAttendance", {
              required: "Please answer this question",
            })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select an option</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          {errors.previousAttendance && (
            <p className="mt-1 text-sm text-red-600">
              {errors.previousAttendance.message}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <Label htmlFor="gender">
            Gender <span className="text-red-500">*</span>
          </Label>
          <select
            id="gender"
            {...register("gender", { required: "Please select gender" })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select gender</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>

        {/* Institution */}
        <div>
          <Label htmlFor="university">
            University / Institution <span className="text-red-500">*</span>
          </Label>
          <Input
            id="university"
            list="university-list"
            placeholder="Select or type your institution"
            {...register("university", { required: "Institution is required" })}
          />
          <datalist id="university-list">
            {institutions.map((i) => (
              <option key={i} value={i} />
            ))}
          </datalist>
          <p className="mt-1 text-sm text-gray-500">
            You can type any Canadian university or select from the suggestions
            above
          </p>
          {errors.university && (
            <p className="mt-1 text-sm text-red-600">
              {errors.university.message}
            </p>
          )}
        </div>

        {/* Major */}
        <div>
          <Label htmlFor="major">
            Major / Program <span className="text-red-500">*</span>
          </Label>
          <Input
            id="major"
            list="major-list"
            placeholder="Select or type your major"
            {...register("major", { required: "Major is required" })}
          />
          <datalist id="major-list">
            {majors.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <p className="mt-1 text-sm text-gray-500">
            You can type any major/program or select from the suggestions above
          </p>
          {errors.major && (
            <p className="mt-1 text-sm text-red-600">{errors.major.message}</p>
          )}
        </div>

        {/* Year */}
        <div>
          <Label htmlFor="yearOfStudy">
            What year will you be in as of Fall?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <select
            id="yearOfStudy"
            {...register("yearOfStudy", { required: "Year is required" })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select year</option>
            {Object.values(RegistrationSchema.shape.yearOfStudy.enum).map(
              (x, i) => (
                <option key={i} value={x}>
                  {x}
                </option>
              ),
            )}
          </select>
          {errors.yearOfStudy && (
            <p className="mt-1 text-sm text-red-600">
              {errors.yearOfStudy.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full">
          Next: Final Questions
        </Button>
      </form>
    </div>
  );
}
