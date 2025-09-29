"use client";

import * as React from "react";
import { Control, FieldValues } from "react-hook-form";
import {
  InterestsCheckboxGroup,
  DietaryRestrictionsCheckboxGroup,
} from "../fields/CheckboxGroupField";
import { AccommodationsTextareaField } from "../fields/TextareaField";

import { CheckboxOption } from "@/utils/formDataTransformers";

interface PreferencesSectionProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  control: Control<TFieldValues>;
  disabled?: boolean;
  // Form options
  interests: CheckboxOption[];
  dietaryRestrictions: CheckboxOption[];
}

export function PreferencesSection<
  TFieldValues extends FieldValues = FieldValues,
>({
  control,
  disabled = false,
  interests,
  dietaryRestrictions,
}: PreferencesSectionProps<TFieldValues>) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Interests & Preferences</h3>

      {/* Interests selection */}
      <InterestsCheckboxGroup
        control={control}
        name={"interests" as any}
        label="Interests (max 3)"
        options={interests}
        disabled={disabled}
        required
        gridCols="2"
      />

      {/* Dietary restrictions */}
      <DietaryRestrictionsCheckboxGroup
        control={control}
        name={"dietaryRestrictions" as any}
        label="Dietary Restrictions"
        options={dietaryRestrictions}
        disabled={disabled}
        gridCols="2"
      />

      {/* Accommodations */}
      <AccommodationsTextareaField
        control={control}
        name={"accommodations" as any}
        label="Special Accommodations"
        disabled={disabled}
        description="Please let us know if you have any special accommodation needs for the event."
      />
    </div>
  );
}
