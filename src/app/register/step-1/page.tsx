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
  const { register, handleSubmit } = useForm<PersonalForm>();

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
    "Bachelor of Arts - Policy Studies",
    "Bachelor of Computer Information Systems",
    "Bachelor of Science - Biology",
    "Bachelor of Science - Chemistry",
    "Bachelor of Science - Computer Science",
    "Bachelor of Science - Data Science",
    "Bachelor of Science - Environmental Science",
    "Bachelor of Science - General Science",
    "Bachelor of Science - Geology",
    "Other…",
  ];

  const onSubmit: SubmitHandler<PersonalForm> = (data) => {
    setValues(data);
    router.push("/register/step-2");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="text-2xl font-semibold">Personal Details</h1>

      <div>
        <Label htmlFor="attendedBefore">
          Have you attended MRUHacks before?
        </Label>
        <select
          id="attendedBefore"
          {...register("attendedBefore", { required: true })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <Label htmlFor="gender">Gender</Label>
        <select
          id="gender"
          {...register("gender", { required: true })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="preferNot">Prefer not to say</option>
        </select>
      </div>

      <div>
        <Label htmlFor="institution">University / Institution</Label>
        <Input
          id="institution"
          list="institution-list"
          placeholder="Start typing…"
          {...register("institution", { required: true })}
        />
        <datalist id="institution-list">
          {institutions.map((i) => (
            <option key={i} value={i} />
          ))}
        </datalist>
      </div>

      <div>
        <Label htmlFor="major">Major / Program</Label>
        <Input
          id="major"
          list="major-list"
          placeholder="e.g. Computer Science"
          {...register("major", { required: true })}
        />
        <datalist id="major-list">
          {majors.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </div>

      <div>
        <Label htmlFor="year">What year will you be in as of Fall?</Label>
        <select
          id="year"
          {...register("year", { required: true })}
          className="w-full border rounded px-3 py-2"
        >
          <option>1st</option>
          <option>2nd</option>
          <option>3rd</option>
          <option>4th+</option>
          <option>Recent grad</option>
        </select>
      </div>

      <Button type="submit" className="w-full">
        Next: Final Questions
      </Button>
    </form>
  );
}
