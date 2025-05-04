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

type AccountForm = Pick<
  RegistrationData,
  "firstName" | "lastName" | "email" | "password"
> & {
  confirmPassword: string;
};

export default function AccountPage() {
  const router = useRouter();
  const { setValues } = useRegisterForm();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AccountForm>();

  const onSubmit: SubmitHandler<AccountForm> = (data) => {
    const { confirmPassword, ...rest } = data;
    setValues(rest);
    router.push("/register/step-1");
  };

  const password = watch("password", "");

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

      {/* Student Email */}
      <div>
        <Label htmlFor="email">
          Student Email Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
              message: "Enter a valid email",
            },
          })}
          placeholder="you@student.mru.ca"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password">
          Password <span className="text-red-500">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "At least 8 characters" },
            pattern: {
              value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/,
              message: "Must include upper, lower, number & special",
            },
          })}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <Label htmlFor="confirmPassword">
          Confirm Password <span className="text-red-500">*</span>
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (val) => val === password || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Next: Personal Details
      </Button>
    </form>
  );
}
