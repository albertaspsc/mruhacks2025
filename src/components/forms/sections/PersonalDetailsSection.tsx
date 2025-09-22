"use client";

import * as React from "react";
import { Control, FieldValues } from "react-hook-form";
import {
  FirstNameInputField,
  LastNameInputField,
} from "../fields/TextInputField";
import {
  IdSelectField,
  StringSelectField,
  BooleanSelectField,
} from "../fields/SelectField";

import { SelectOption, StringSelectOption } from "@/utils/formDataTransformers";

interface PersonalDetailsSectionProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  control: Control<TFieldValues>;
  disabled?: boolean;
  // Form options
  genders: SelectOption[];
  universities: SelectOption[];
  majors: SelectOption[];
  // Year of study options
  yearOfStudyOptions: StringSelectOption[];
  // Previous attendance options
  previousAttendanceOptions: { value: boolean; label: string }[];
}

export function PersonalDetailsSection<
  TFieldValues extends FieldValues = FieldValues,
>({
  control,
  disabled = false,
  genders,
  universities,
  majors,
  yearOfStudyOptions,
  previousAttendanceOptions,
}: PersonalDetailsSectionProps<TFieldValues>) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Personal Information</h3>

      {/* Name fields */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FirstNameInputField
          control={control}
          name={"firstName" as any}
          label="First Name"
          placeholder="John"
          disabled={disabled}
          required
        />

        <LastNameInputField
          control={control}
          name={"lastName" as any}
          label="Last Name"
          placeholder="Doe"
          disabled={disabled}
          required
        />
      </div>

      {/* Previous attendance */}
      <BooleanSelectField
        control={control}
        name={"previousAttendance" as any}
        label="Have you attended MRUHacks before?"
        placeholder="Select an option"
        options={previousAttendanceOptions}
        disabled={disabled}
        required
      />

      {/* Demographics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-1">
        <IdSelectField
          control={control}
          name={"gender" as any}
          label="Gender"
          placeholder="Select gender"
          options={genders}
          disabled={disabled}
          required
        />

        <IdSelectField
          control={control}
          name={"university" as any}
          label="University / Institution"
          placeholder="Select your institution"
          options={universities}
          disabled={disabled}
          required
        />

        <IdSelectField
          control={control}
          name={"major" as any}
          label="Major / Program"
          placeholder="Select your major"
          options={majors}
          disabled={disabled}
          required
        />
      </div>

      {/* Year of study */}
      <StringSelectField
        control={control}
        name={"yearOfStudy" as any}
        label="What year will you be in as of Fall?"
        placeholder="Select year"
        options={yearOfStudyOptions}
        disabled={disabled}
        required
      />
    </div>
  );
}

// Convenience component with default options
export function PersonalDetailsSectionWithDefaults<
  TFieldValues extends FieldValues = FieldValues,
>({
  control,
  disabled = false,
  genders,
  universities,
  majors,
}: Omit<
  PersonalDetailsSectionProps<TFieldValues>,
  "yearOfStudyOptions" | "previousAttendanceOptions"
>) {
  const yearOfStudyOptions: StringSelectOption[] = [
    { value: "1st", label: "1st" },
    { value: "2nd", label: "2nd" },
    { value: "3rd", label: "3rd" },
    { value: "4th+", label: "4th+" },
    { value: "Recent Grad", label: "Recent Grad" },
  ];

  const previousAttendanceOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  return (
    <PersonalDetailsSection
      control={control}
      disabled={disabled}
      genders={genders}
      universities={universities}
      majors={majors}
      yearOfStudyOptions={yearOfStudyOptions}
      previousAttendanceOptions={previousAttendanceOptions}
    />
  );
}
