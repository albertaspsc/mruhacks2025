"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const schema = z.object({
  email: z.string().email("Enter a valid email").min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])/, "Password must include at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must include at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must include at least one number")
    .regex(
      /(?=.*[@$!%*?&])/,
      "Password must include at least one special character (@$!%*?&)",
    ),
});

type FormValues = z.infer<typeof schema>;

export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (data && !error) {
        router.replace("/register/step-1");
      }
    };
    run();
  }, [path, supabase.auth, router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  async function onSubmit(values: FormValues) {
    const { error } = await supabase.auth.signUp({
      password: values.password,
      email: values.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/register/step-1`,
      },
    });

    if (error) {
      alert(error.message);

      return;
    }

    router.replace("/register/step-1");
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-center text-black mb-2">
        Sign Up
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">
                  Student Email Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="student@mtroyal.ca"
                    {...field}
                    className="mt-1 pr-10 text-black"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => {
              const passwordErrors = form.formState.errors.password;
              const passwordValue = field.value || "";

              // Individual validation checks
              const validations = [
                {
                  test: passwordValue.length >= 8,
                  message: "Password must be at least 8 characters",
                },
                {
                  test: /(?=.*[a-z])/.test(passwordValue),
                  message:
                    "Password must include at least one lowercase letter",
                },
                {
                  test: /(?=.*[A-Z])/.test(passwordValue),
                  message:
                    "Password must include at least one uppercase letter",
                },
                {
                  test: /(?=.*\d)/.test(passwordValue),
                  message: "Password must include at least one number",
                },
                {
                  test: /(?=.*[@$!%*?&])/.test(passwordValue),
                  message:
                    "Password must include at least one special character (@$!%*?&)",
                },
              ];

              return (
                <FormItem>
                  <FormLabel className="text-black">
                    Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      className="mt-1 pr-10 text-black"
                    />
                  </FormControl>
                  {passwordValue && (
                    <div className="space-y-1">
                      {validations.map((validation, index) => (
                        <p
                          key={index}
                          className={`text-sm ${
                            validation.test ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {validation.test ? "✓" : "✗"} {validation.message}
                        </p>
                      ))}
                    </div>
                  )}
                  {passwordErrors && !passwordValue && <FormMessage />}
                </FormItem>
              );
            }}
          />

          <Button
            type="submit"
            className="w-full bg-black text-white font-semibold shadow-none hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            Sign Up
          </Button>
        </form>
      </Form>

      <div className="w-full text-center pt-2">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-black font-semibold hover:underline focus:outline-none focus:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </>
  );
}
