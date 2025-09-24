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
import { Input } from "@/components/ui/input";

interface TextInputFieldProps<
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
  type?: "text" | "email" | "password" | "tel" | "url";
  className?: string;
  inputClassName?: string;
  autoComplete?: string;
}

export function TextInputField<
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
  type = "text",
  className,
  inputClassName,
  autoComplete,
}: TextInputFieldProps<TFieldValues, TName>) {
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
            <Input
              placeholder={placeholder}
              type={type}
              autoComplete={autoComplete}
              className={`mt-1 pr-10 text-black ${inputClassName || ""}`}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-sm text-muted-foreground">
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Convenience components for common input types
export function EmailInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: Omit<TextInputFieldProps<TFieldValues, TName>, "type">) {
  return <TextInputField {...props} type="email" autoComplete="email" />;
}

export function PasswordInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: Omit<TextInputFieldProps<TFieldValues, TName>, "type">) {
  return (
    <TextInputField
      {...props}
      type="password"
      autoComplete="current-password"
    />
  );
}

export function FirstNameInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Omit<
    TextInputFieldProps<TFieldValues, TName>,
    "type" | "autoComplete"
  >,
) {
  return <TextInputField {...props} type="text" autoComplete="given-name" />;
}

export function LastNameInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Omit<
    TextInputFieldProps<TFieldValues, TName>,
    "type" | "autoComplete"
  >,
) {
  return <TextInputField {...props} type="text" autoComplete="family-name" />;
}
