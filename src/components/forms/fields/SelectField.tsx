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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
  id: number;
  label: string;
}

export interface StringSelectOption {
  value: string;
  label: string;
}

export interface BooleanSelectOption {
  value: boolean;
  label: string;
}

interface BaseSelectFieldProps<
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
}

// ID-based select field (for gender, university, major, marketing)
interface IdSelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseSelectFieldProps<TFieldValues, TName> {
  type: "id";
  options: SelectOption[];
}

// String-based select field (for yearOfStudy, parking)
interface StringSelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseSelectFieldProps<TFieldValues, TName> {
  type: "string";
  options: StringSelectOption[];
}

// Boolean select field (for previousAttendance)
interface BooleanSelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseSelectFieldProps<TFieldValues, TName> {
  type: "boolean";
  options: BooleanSelectOption[];
}

type SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> =
  | IdSelectFieldProps<TFieldValues, TName>
  | StringSelectFieldProps<TFieldValues, TName>
  | BooleanSelectFieldProps<TFieldValues, TName>;

export function SelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder = "Select an option",
  description,
  disabled = false,
  required = false,
  className,
  type,
  options,
}: SelectFieldProps<TFieldValues, TName>) {
  const renderSelectContent = () => {
    switch (type) {
      case "id":
        return (options as SelectOption[]).map((option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.label}
          </SelectItem>
        ));
      case "string":
        return (options as StringSelectOption[]).map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ));
      case "boolean":
        return (options as BooleanSelectOption[]).map((option) => (
          <SelectItem key={String(option.value)} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ));
      default:
        return null;
    }
  };

  const getValue = (fieldValue: any) => {
    switch (type) {
      case "id":
        return fieldValue ? String(fieldValue) : undefined;
      case "string":
        return fieldValue || undefined;
      case "boolean":
        return fieldValue !== undefined ? String(fieldValue) : undefined;
      default:
        return undefined;
    }
  };

  const handleValueChange = (value: string, onChange: (value: any) => void) => {
    switch (type) {
      case "id":
        onChange(parseInt(value));
        break;
      case "string":
        onChange(value);
        break;
      case "boolean":
        onChange(value === "true");
        break;
      default:
        onChange(value);
    }
  };

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
          <Select
            value={getValue(field.value)}
            onValueChange={(value) => handleValueChange(value, field.onChange)}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className="mt-1 pr-10 text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-black">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white dark:bg-gray-800">
              {renderSelectContent()}
            </SelectContent>
          </Select>
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

// Convenience components for common use cases
export function IdSelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: Omit<IdSelectFieldProps<TFieldValues, TName>, "type">) {
  return <SelectField {...props} type="id" />;
}

export function StringSelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: Omit<StringSelectFieldProps<TFieldValues, TName>, "type">) {
  return <SelectField {...props} type="string" />;
}

export function BooleanSelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: Omit<BooleanSelectFieldProps<TFieldValues, TName>, "type">) {
  return <SelectField {...props} type="boolean" />;
}
