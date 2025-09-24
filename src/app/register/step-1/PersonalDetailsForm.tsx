"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PersonalDetailsSectionWithDefaults } from "@/components/forms/sections/PersonalDetailsSection";
import { useRegisterForm } from "@/context/RegisterFormContext";
import {
  formOptionTransformers,
  mergeFormData,
  commonFieldMappings,
} from "@/utils/formDataTransformers";
import {
  PersonalDetailsSchema,
  GenderOption,
  UniversityOption,
  MajorOption,
} from "@/types/registration";

/**
 * Props for the PersonalDetailsForm component
 */
type Props = {
  /** Initial form values containing first and last name */
  initial: { firstName: string; lastName: string; email: string };
  genders: GenderOption[];
  majors: MajorOption[];
  universities: UniversityOption[];
};

/** Type representing the personal details form data structure */
type PersonalForm = z.infer<typeof PersonalDetailsSchema>;

/**
 * PersonalDetailsForm component for the first step of user registration.
 *
 * This form collects personal information including name, gender, university,
 * major, year of study, and previous attendance. It integrates with the
 * registration context to maintain state across multiple registration steps.
 *
 * @param props - Component props
 * @param props.initial - Initial form values with first and last name
 * @param props.genders - Available gender options for selection
 * @param props.majors - Available major options for selection
 * @param props.universities - Available university options for selection
 * @returns JSX element representing the personal details form
 */
export default function PersonalDetailsForm({
  initial,
  genders,
  majors,
  universities,
}: Props) {
  const router = useRouter();
  const { setValues, data } = useRegisterForm();

  /**
   * Merged default values combining SSR initial data with saved context values.
   * Context values take priority if they exist, otherwise falls back to initial values.
   */
  const defaults = mergeFormData(
    data as Partial<PersonalForm>,
    initial as Partial<PersonalForm>,
    commonFieldMappings,
  );

  /** React Hook Form instance with validation and default values */
  const form = useForm<PersonalForm>({
    resolver: zodResolver(PersonalDetailsSchema),
    defaultValues: defaults,
    mode: "onBlur",
  });

  /**
   * Effect to keep registration context in sync with form changes.
   * This ensures data persistence across multiple registration steps.
   */
  React.useEffect(() => {
    const sub = form.watch((v) => {
      const current = v as Partial<PersonalForm>;
      setValues({
        ...data,
        email: initial.email, // Include email from initial data
        firstName: current.firstName ?? "",
        lastName: current.lastName ?? "",
        previousAttendance: current.previousAttendance,
        gender: current.gender || 0,
        university: current.university || 0,
        major: current.major || 0,
        yearOfStudy: current.yearOfStudy,
      });
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  /**
   * Handles form submission by saving values to context and navigating to next step.
   *
   * @param values - Validated form data from the personal details form
   */
  const onSubmit = (values: PersonalForm) => {
    // Save once more to be explicit
    setValues({
      ...data,
      email: initial.email, // Include email from initial data
      ...values,
      previousAttendance: values.previousAttendance,
      gender: values.gender || 0,
    });
    router.push("/register/step-2");
  };

  /** Transform raw option data into format expected by form components */
  const transformedGenders = formOptionTransformers.genders(genders);
  const transformedUniversities =
    formOptionTransformers.universities(universities);
  const transformedMajors = formOptionTransformers.majors(majors);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <PersonalDetailsSectionWithDefaults
          control={form.control}
          genders={transformedGenders}
          universities={transformedUniversities}
          majors={transformedMajors}
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
