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
  const { register, handleSubmit } = useForm<AccountForm>();

  const onSubmit: SubmitHandler<AccountForm> = (data) => {
    const { confirmPassword, ...rest } = data;
    setValues(rest);
    router.push("/register/step-1");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="text-2xl font-semibold">Create Your Account</h1>

      <div>
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          {...register("firstName", { required: true })}
          placeholder="John"
        />
      </div>

      <div>
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          {...register("lastName", { required: true })}
          placeholder="Doe"
        />
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          {...register("email", { required: true })}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password", { required: true })}
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword", { required: true })}
        />
      </div>

      <Button type="submit" className="w-full">
        Next: Personal Details
      </Button>
    </form>
  );
}
