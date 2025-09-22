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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface CheckboxOption {
  id: number;
  label: string;
}

interface CheckboxGroupFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  options: CheckboxOption[];
  maxSelections?: number;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  gridCols?: "1" | "2" | "3" | "4";
}

export function CheckboxGroupField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  options,
  maxSelections,
  description,
  disabled = false,
  required = false,
  className,
  gridCols = "2",
}: CheckboxGroupFieldProps<TFieldValues, TName>) {
  const getGridClass = () => {
    switch (gridCols) {
      case "1":
        return "grid-cols-1";
      case "2":
        return "grid-cols-1 sm:grid-cols-2";
      case "3":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case "4":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      default:
        return "grid-cols-1 sm:grid-cols-2";
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedValues = field.value || [];
        const isAtMaxSelections = Boolean(
          maxSelections && selectedValues.length >= maxSelections,
        );

        return (
          <FormItem className={className}>
            <FormLabel className="text-black">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <div className={`mt-2 grid gap-3 ${getGridClass()}`}>
              {options.map((option) => {
                const isChecked = selectedValues.includes(option.id);
                const isDisabled =
                  disabled || (!isChecked && isAtMaxSelections);

                return (
                  <div key={option.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`${name}-${option.id}`}
                      checked={isChecked}
                      disabled={isDisabled}
                      onCheckedChange={(checked) => {
                        const isChecked = Boolean(checked);
                        if (isChecked) {
                          if (!selectedValues.includes(option.id)) {
                            if (
                              !maxSelections ||
                              selectedValues.length < maxSelections
                            ) {
                              field.onChange([...selectedValues, option.id]);
                            }
                          }
                        } else {
                          field.onChange(
                            selectedValues.filter(
                              (id: number) => id !== option.id,
                            ),
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`${name}-${option.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
            {description && (
              <FormDescription className="text-sm text-muted-foreground">
                {description}
              </FormDescription>
            )}
            {maxSelections && (
              <FormDescription className="text-sm text-muted-foreground">
                Select up to {maxSelections} options ({selectedValues.length}/
                {maxSelections} selected)
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// Convenience component for interests with max 3 selection
export function InterestsCheckboxGroup<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: Omit<CheckboxGroupFieldProps<TFieldValues, TName>, "maxSelections">) {
  return <CheckboxGroupField {...props} maxSelections={3} />;
}

// Convenience component for dietary restrictions (no max limit)
export function DietaryRestrictionsCheckboxGroup<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: Omit<CheckboxGroupFieldProps<TFieldValues, TName>, "maxSelections">) {
  return <CheckboxGroupField {...props} />;
}
