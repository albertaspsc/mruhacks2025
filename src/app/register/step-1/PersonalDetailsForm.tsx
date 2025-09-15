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
import { useRegisterForm } from "@/context/RegisterFormContext"; // keep your context for cross-step persistence
import { RegistrationSchema } from "@/context/RegisterFormContext"; // uses your existing enum for yearOfStudy

type Props = {
  initial: { email: string; firstName: string; lastName: string };
  genders: { id: number; label: string }[];
  majors: string[];
  universities: string[];
};

// Schema (client-side)
const PersonalSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  previousAttendance: z.enum(["true", "false"], {
    required_error: "Please answer this question",
  }),
  gender: z.string().min(1, "Please select gender"),
  university: z.string().min(1, "Institution is required"),
  major: z.string().min(1, "Major is required"),
  yearOfStudy: RegistrationSchema.shape.yearOfStudy, // reuse your enum
});

type PersonalForm = z.infer<typeof PersonalSchema>;

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
          : ("" as any),
    gender: (data.gender ? String(data.gender) : "") as string,
    university: data.university || "",
    major: data.major || "",
    yearOfStudy: (data.yearOfStudy as PersonalForm["yearOfStudy"]) || undefined,
  };

  const form = useForm<PersonalForm>({
    resolver: zodResolver(PersonalSchema),
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
        gender: current.gender || undefined,
        university: current.university ?? "",
        major: current.major ?? "",
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
      gender: values.gender || undefined,
    });
    router.push("/register/step-2");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Hidden email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => <input type="hidden" {...field} />}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  First Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
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
                <FormLabel>
                  Last Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="previousAttendance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Have you attended MRUHacks before?{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={(v) => field.onChange(v)}
              >
                <FormControl>
                  <SelectTrigger>
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
              <FormLabel>
                Gender <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genders.map((g) => (
                    <SelectItem key={g.id} value={g.label}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  University / Institution{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    list="university-list"
                    placeholder="Select or type your institution"
                    {...field}
                  />
                </FormControl>
                <datalist id="university-list">
                  {universities.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
                <p className="text-sm text-muted-foreground">
                  You can type any Canadian university or select from
                  suggestions.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="major"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Major / Program <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    list="major-list"
                    placeholder="Select or type your major"
                    {...field}
                  />
                </FormControl>
                <datalist id="major-list">
                  {majors.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="yearOfStudy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                What year will you be in as of Fall?{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(RegistrationSchema.shape.yearOfStudy.enum).map(
                    (x) => (
                      <SelectItem key={x} value={x}>
                        {x}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Next: Final Questions
          </Button>
        </div>
      </form>
    </Form>
  );
}
