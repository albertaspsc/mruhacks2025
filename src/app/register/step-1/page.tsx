"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  useRegisterForm,
  RegistrationData,
} from "@/context/RegisterFormContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type PersonalForm = Pick<
  RegistrationData,
  "attendedBefore" | "gender" | "institution" | "major" | "year"
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
        <Label htmlFor="attendedBefore">
          Have you attended MRUHacks before?{" "}
          <span className="text-red-500">*</span>
        </Label>
        <select
          id="attendedBefore"
          {...register("attendedBefore", {
            required: "Please answer this question",
          })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">— Select —</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        {errors.attendedBefore && (
          <p className="mt-1 text-sm text-red-600">
            {errors.attendedBefore.message}
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
        <Label htmlFor="institution">
          University / Institution <span className="text-red-500">*</span>
        </Label>
        <Input
          id="institution"
          list="institution-list"
          placeholder="Start typing…"
          {...register("institution", { required: "Institution is required" })}
        />
        <datalist id="institution-list">
          {institutions.map((i) => (
            <option key={i} value={i} />
          ))}
        </datalist>
        {errors.institution && (
          <p className="mt-1 text-sm text-red-600">
            {errors.institution.message}
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
        <Label htmlFor="year">
          What year will you be in as of Fall?{" "}
          <span className="text-red-500">*</span>
        </Label>
        <select
          id="year"
          {...register("year", { required: "Year is required" })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">— Select —</option>
          <option>1st</option>
          <option>2nd</option>
          <option>3rd</option>
          <option>4th+</option>
          <option>Recent grad</option>
        </select>
        {errors.year && (
          <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Next: Final Questions
      </Button>
    </form>
  );
}
