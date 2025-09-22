"use client";

import * as React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

interface TextareaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  textareaClassName?: string;
  rows?: number;
  maxLength?: number;
}

export function TextareaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  description,
  disabled = false,
  required = false,
  className,
  textareaClassName,
  rows = 4,
  maxLength,
}: TextareaFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-black">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <textarea
              placeholder={placeholder}
              rows={rows}
              maxLength={maxLength}
              className={`w-full rounded-md border px-3 py-2 text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${textareaClassName || ""}`}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-sm text-muted-foreground">
              {description}
            </FormDescription>
          )}
          {maxLength && (
            <FormDescription className="text-sm text-muted-foreground">
              {field.value?.length || 0}/{maxLength} characters
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Convenience component for accommodations
export function AccommodationsTextareaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Omit<TextareaFieldProps<TFieldValues, TName>, "rows" | "placeholder">,
) {
  return (
    <TextareaField
      {...props}
      rows={6}
      placeholder="If yes, please specify…"
      maxLength={500}
    />
  );
}
