"use client";

import * as React from "react";
import { Control, FieldValues } from "react-hook-form";
import { StringSelectField, IdSelectField, ResumeUploadField } from "../fields";

import { SelectOption, StringSelectOption } from "@/utils/formDataTransformers";

interface EventDetailsSectionProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  control: Control<TFieldValues>;
  disabled?: boolean;
  // Form options
  marketingTypes: SelectOption[];
  // Parking options
  parkingOptions: StringSelectOption[];
  // File upload
  onResumeUpload?: (file: File) => Promise<string | null>;
  isResumeUploading?: boolean;
  resumeUploadError?: string;
  existingResumeUrl?: string;
  userId?: string;
}

export function EventDetailsSection<
  TFieldValues extends FieldValues = FieldValues,
>({
  control,
  disabled = false,
  marketingTypes,
  parkingOptions,
  onResumeUpload,
  isResumeUploading = false,
  resumeUploadError,
  existingResumeUrl,
  userId,
}: EventDetailsSectionProps<TFieldValues>) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Event Details</h3>

      {/* Parking and Marketing */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-1">
        <StringSelectField
          control={control}
          name={"parking" as any}
          label="Will you require parking?"
          placeholder="Select an option"
          options={parkingOptions}
          disabled={disabled}
          required
        />

        <IdSelectField
          control={control}
          name={"marketing" as any}
          label="How did you hear about us?"
          placeholder="Select a source"
          options={marketingTypes}
          disabled={disabled}
          required
        />
      </div>

      {/* Resume Upload */}
      <ResumeUploadField
        control={control}
        name={"resume" as any}
        label="Resume Upload (Optional but Recommended)"
        disabled={disabled}
        onUpload={onResumeUpload}
        isUploading={isResumeUploading}
        uploadError={resumeUploadError}
        existingFileUrl={existingResumeUrl}
      />
    </div>
  );
}

// Convenience component with default options
export function EventDetailsSectionWithDefaults<
  TFieldValues extends FieldValues = FieldValues,
>({
  control,
  disabled = false,
  marketingTypes,
  onResumeUpload,
  isResumeUploading = false,
  resumeUploadError,
  existingResumeUrl,
  userId,
}: Omit<EventDetailsSectionProps<TFieldValues>, "parkingOptions">) {
  const parkingOptions: StringSelectOption[] = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
    { value: "Not sure", label: "Not sure" },
  ];

  return (
    <EventDetailsSection
      control={control}
      disabled={disabled}
      marketingTypes={marketingTypes}
      parkingOptions={parkingOptions}
      onResumeUpload={onResumeUpload}
      isResumeUploading={isResumeUploading}
      resumeUploadError={resumeUploadError}
      existingResumeUrl={existingResumeUrl}
      userId={userId}
    />
  );
}
