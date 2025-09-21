"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useRegisterForm } from "@/context/RegisterFormContext";
import {
  PersonalDetailsSchema,
  PersonalDetailsInput,
} from "@/types/registration";

type Props = {
  initial: { email: string; firstName: string; lastName: string };
  genders: { id: number; gender: string }[];
  majors: { id: number; major: string }[];
  universities: { id: number; uni: string }[];
};

// Use shared schema with additional form-specific fields
const PersonalFormSchema = PersonalDetailsSchema.extend({
  previousAttendance: z.enum(["true", "false"], {
    required_error: "Please answer this question",
  }),
});

type PersonalForm = z.infer<typeof PersonalFormSchema>;

export default function PersonalDetailsForm({
  initial,
  genders,
  majors,
  universities,
}: Props) {
  const router = useRouter();
  const { setValues, data } = useRegisterForm();

  // Merge SSR initial with any saved context values (context has priority if populated)
  const defaults: Partial<PersonalForm> = {
    email: data.email || initial.email || "",
    firstName: data.firstName || initial.firstName || "",
    lastName: data.lastName || initial.lastName || "",
    previousAttendance:
      data.previousAttendance === true
        ? "true"
        : data.previousAttendance === false
          ? "false"
          : undefined,
    gender: data.gender || 0,
    university: data.university || 0,
    major: data.major || 0,
    yearOfStudy: (data.yearOfStudy as PersonalForm["yearOfStudy"]) || undefined,
  };

  const form = useForm<PersonalForm>({
    resolver: zodResolver(PersonalFormSchema),
    defaultValues: defaults,
    mode: "onBlur",
  });

  // Keep context in sync on change (cheap & robust for multipage flows)
  React.useEffect(() => {
    const sub = form.watch((v) => {
      const current = v as Partial<PersonalForm>;
      setValues({
        ...data,
        email: current.email ?? "",
        firstName: current.firstName ?? "",
        lastName: current.lastName ?? "",
        previousAttendance: current.previousAttendance === "true",
        gender: current.gender || 0,
        university: current.university || 0,
        major: current.major || 0,
        yearOfStudy: current.yearOfStudy,
      });
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  const onSubmit = (values: PersonalForm) => {
    // Save once more to be explicit
    setValues({
      ...data,
      ...values,
      previousAttendance: values.previousAttendance === "true",
      gender: values.gender || 0,
    });
    router.push("/register/step-2");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        {/* Hidden email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => <input type="hidden" {...field} />}
        />

        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">
                First Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="John"
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
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">
                Last Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Doe"
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
          name="previousAttendance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">
                Have you attended MRUHacks before?{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={(v) => field.onChange(v)}
              >
                <FormControl>
                  <SelectTrigger className="mt-1 pr-10 text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-black">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">
                Gender <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <FormControl>
                  <SelectTrigger className="mt-1 pr-10 text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-black">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genders.map((g) => (
                    <SelectItem key={g.id} value={g.id.toString()}>
                      {g.gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="university"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">
                University / Institution{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <FormControl>
                  <SelectTrigger className="mt-1 pr-10 text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-black">
                    <SelectValue placeholder="Select your institution" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {universities.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.uni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="major"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">
                Major / Program <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <FormControl>
                  <SelectTrigger className="mt-1 pr-10 text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-black">
                    <SelectValue placeholder="Select your major" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {majors.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.major}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="yearOfStudy"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">
                What year will you be in as of Fall?{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="mt-1 pr-10 text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-black">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["1st", "2nd", "3rd", "4th+", "Recent Grad"].map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            className="w-full bg-black text-white font-semibold shadow-none hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            Next: Final Questions
          </Button>
        </div>
      </form>
    </Form>
  );
}
