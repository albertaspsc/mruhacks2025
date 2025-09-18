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
import { redirect } from "next/dist/server/api-utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const schema = z.object({
  email: z.string().email("Enter a valid email").min(1, "Email is required"),
  password: z
    .string()
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}/, {
      message:
        "Password must be at least 8 characters and include one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&).",
    }),
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Student Email Address <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="student@mtroyal.ca" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Password <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Sign Up</Button>
      </form>
    </Form>
  );
}
