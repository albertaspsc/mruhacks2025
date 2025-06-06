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
import React from "react";

type PersonalForm = Pick<
  RegistrationInput,
  "previousAttendance" | "gender" | "university" | "major" | "yearOfStudy"
>;

export default function Step1Page() {
  const router = useRouter();
  const { setValues } = useRegisterForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalForm>();

  const institutions = [
    "Mount Royal University",
    "University of Calgary",
    "SAIT Polytechnic",
    "Ambrose University",
    "Bow Valley College",
    "St. Mary's University",
    "Other…",
  ];
  const majors = [
    "Bachelor of Arts – Policy Studies",
    "Bachelor of Computer Information Systems",
    "Bachelor of Science – Biology",
    "Bachelor of Science – Chemistry",
    "Bachelor of Science – Computer Science",
    "Bachelor of Science – Data Science",
    "Bachelor of Science – Environmental Science",
    "Bachelor of Science – General Science",
    "Bachelor of Science – Geology",
    "Other…",
  ];

  const onSubmit: SubmitHandler<PersonalForm> = (data) => {
    setValues(data);
    router.push("/register/step-2");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="text-2xl font-semibold">Personal Details</h1>

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
          <option value="">— Select —</option>
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
          <option value="">— Select —</option>
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
          placeholder="Start typing…"
          {...register("university", { required: "Institution is required" })}
        />
        <datalist id="university-list">
          {/* TODO change to uni */}
          {institutions.map((i) => (
            <option key={i} value={i} />
          ))}
        </datalist>
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
          placeholder="e.g. Computer Science"
          {...register("major", { required: "Major is required" })}
        />
        <datalist id="major-list">
          {majors.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
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
          <option value="">— Select —</option>
          {Object.values(RegistrationSchema.shape.yearOfStudy.enum).map(
            (x, i) => (
              <option key={i}>{x}</option>
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
