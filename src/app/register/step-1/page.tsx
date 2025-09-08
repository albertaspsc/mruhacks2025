"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  useRegisterForm,
  RegistrationInput,
  RegistrationSchema,
} from "@/context/RegisterFormContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useRef } from "react";
import { getMajorsAndUniversities } from "@/db/registration";
import { useAuthRegistration } from "@/context/AuthRegistrationContext";

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
  const router = useRouter();
  const { setValues, data, goBack } = useRegisterForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PersonalForm>({
    defaultValues: {},
  });

  const [institutions, setInstitutions] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [genders, setGenders] = useState<{ id: number; gender: string }[]>([]);
  const { user, loading } = useAuthRegistration();
  const hasSetInitialValues = useRef(false); // Prevent multiple calls

  // Gender options loaded dynamically (no hardcoded fallback)

  // All auth + redirect logic handled in layout + shared context now.

  useEffect(() => {
    const loadLists = async () => {
      const { majors, universities } = await getMajorsAndUniversities();
      setMajors(majors);
      setInstitutions(universities);
    };
    loadLists();
  }, []);

  useEffect(() => {
    // Load gender options from DB
    const loadGenders = async () => {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase
          .from("gender")
          .select("id, gender")
          .order("id");
        if (!error && data) {
          setGenders(data);
        } else {
          setGenders([]); // remain empty on error (no fallback)
        }
      } catch (e) {
        setGenders([]);
      }
    };
    loadGenders();
  }, []);

  // Re-apply saved gender once options are available
  useEffect(() => {
    if (data.gender !== undefined && data.gender !== null) {
      setValue("gender", String(data.gender));
    }
  }, [data.gender, genders, setValue]);

  // Load saved form data from context and set initial values
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        // Only proceed if we have a verified user and haven't set values yet
        if (!user || hasSetInitialValues.current) return;

        hasSetInitialValues.current = true; // Prevent multiple calls

        console.log("Setting initial values for user:", user.email);

        // Load saved data from context first
        const savedData = data;

        // If user came from Google OAuth and no saved data, pre-fill form
        const isGoogleUser = user.app_metadata?.provider === "google";

        if (isGoogleUser && !savedData.firstName && !savedData.lastName) {
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
          // Load saved data into form fields
          setValue("firstName", savedData.firstName || "");
          setValue("lastName", savedData.lastName || "");
          setValue("email", savedData.email || user.email || "");
          setValue(
            "previousAttendance",
            savedData.previousAttendance ? "true" : "false",
          );
          setValue("gender", savedData.gender ? String(savedData.gender) : "");
          setValue("university", savedData.university || "");
          setValue("major", savedData.major || "");
          if (savedData.yearOfStudy) {
            setValue("yearOfStudy", savedData.yearOfStudy);
          }

          // Ensure email is in context
          if (!savedData.email) {
            setValues({ ...savedData, email: user.email || "" });
          }
        }
      } catch (err) {
        console.error("Error getting user profile:", err);
      }
    };

    getUserProfile();
  }, [user, data, setValue, setValues]); // Include dependencies for hook consistency

  // Save current form data to context
  const saveCurrentFormData = () => {
    const formData = watch();
    const formattedData = {
      ...formData,
      previousAttendance: formData.previousAttendance === "true",
      gender:
        formData.gender && formData.gender !== ""
          ? Number(formData.gender)
          : undefined,
    };
    setValues(formattedData);
  };

  // Handle form submission to next step
  const onSubmit: SubmitHandler<PersonalForm> = (data) => {
    console.log("Form submitted with data:", data);

    const formattedData = {
      ...data,
      previousAttendance: data.previousAttendance === "true", // Now correctly typed
      gender: data.gender ? Number(data.gender) : undefined,
    };

    console.log("Formatted data:", formattedData);

    setValues(formattedData);
    router.push("/register/step-2");
  };

  // Handle back navigation with data saving
  const handleBack = () => {
    saveCurrentFormData();
    goBack();
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
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center space-y-4 max-w-md mx-auto px-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Please sign in to continue
          </h1>
          <p className="text-gray-600">Your session was not found.</p>
        </div>
      </div>
    );
  }

  // Show the actual step-1 form content once authenticated
  return (
    <div className="space-y-6">
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
            {genders.map((g) => (
              <option key={g.id} value={g.id}>
                {g.gender}
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

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Next: Final Questions
          </Button>
        </div>
      </form>
    </div>
  );
}
