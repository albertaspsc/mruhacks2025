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
import React, { useEffect, useState } from "react";
import { getMajorsAndUniversities } from "src/db/registration";
import { createClient } from "utils/supabase/client";

type PersonalForm = Pick<
  RegistrationInput,
  | "previousAttendance"
  | "gender"
  | "university"
  | "major"
  | "yearOfStudy"
  | "firstName"
  | "lastName"
  | "email"
>;

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

  useEffect(() => {
    const loadLists = async () => {
      const { majors, universities } = await getMajorsAndUniversities();
      setMajors(majors);
      setInstitutions(universities);
    };
    loadLists();
  }, []);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        // Check if user is authenticated and get their profile
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setValues({ email: user.email });

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

            // Pre-fill form with Google data
            setValue("firstName", googleFirstName);
            setValue("lastName", googleLastName);

            // Set values in context
            setValues({
              firstName: googleFirstName,
              lastName: googleLastName,
            });

            return;
          }
        }
      } catch (err) {
        console.error("Error getting user profile:", err);
      }
    };

    getUserProfile();
  }, []);

  const onSubmit: SubmitHandler<PersonalForm> = (data) => {
    setValues(data);
    router.push("/register/step-2");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="text-2xl font-semibold">Personal Details</h1>

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
          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
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
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="preferNot">Prefer not to say</option>
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
  );
}
