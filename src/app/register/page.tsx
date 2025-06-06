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
import { getProfile, Profile } from "src/db/profiles";

type AccountForm = Pick<
  RegistrationInput,
  "firstName" | "lastName" | "schoolEmail"
>;

export default function AccountPage() {
  const router = useRouter();
  const { setValues } = useRegisterForm();
  const [profile, setProfile] = useState<Profile>();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AccountForm>();

  const onSubmit: SubmitHandler<AccountForm> = (data) => {
    setValues(data);
    router.push("/register/step-1");
  };

  useEffect(() => {
    const getUserProfile = async () => {
      const { data, error } = await getProfile();
      if (error) {
        return;
      }

      setProfile(data);
      setValues({
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        schoolEmail: data.email,
      });
    };

    getUserProfile();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="text-2xl font-semibold">Create Your Account</h1>

      {/* First Name */}
      <div>
        <Label htmlFor="firstName">
          First Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="firstName"
          {...register("firstName", { required: "First name is required" })}
          {...{ value: profile?.firstName ?? undefined }}
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
          {...{ value: profile?.lastName ?? undefined }}
          placeholder="Doe"
        />
        {errors.lastName && (
          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
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
          {...{ value: profile?.email }}
          placeholder="you@student.mru.ca"
        />
        {errors.schoolEmail && (
          <p className="mt-1 text-sm text-red-600">
            {errors.schoolEmail.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Next: Personal Details
      </Button>
    </form>
  );
}
