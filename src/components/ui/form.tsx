"use client";

import * as React from "react";
import {
  Controller,
  ControllerProps,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/components/lib/utils";

const Form = FormProvider;

// Context for form fields
const FormFieldContext = React.createContext<{ name: string }>({ name: "" });

// FormField component
const FormField = (props: ControllerProps<any>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

// Context for form items
const FormItemContext = React.createContext<{ id: string }>({ id: "" });

// Custom hook for form fields
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    id: itemContext.id,
    name: fieldContext.name,
    formItemId: `${itemContext.id}-form-item`,
    formDescriptionId: `${itemContext.id}-form-item-description`,
    formMessageId: `${itemContext.id}-form-item-message`,
    ...fieldState,
  };
};

// FormItem component
const FormItem = React.forwardRef(
  (
    props: React.HTMLAttributes<HTMLDivElement>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const id = React.useId();
    const { className, ...rest } = props;

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...rest} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = "FormItem";

// FormLabel component
const FormLabel = React.forwardRef(
  (
    props: React.LabelHTMLAttributes<HTMLLabelElement>,
    ref: React.Ref<HTMLLabelElement>,
  ) => {
    const { className, ...rest } = props;
    const { error, formItemId } = useFormField();

    return (
      <Label
        ref={ref}
        className={cn(error && "text-red-500", className)}
        htmlFor={formItemId}
        {...rest}
      />
    );
  },
);
FormLabel.displayName = "FormLabel";

// FormControl component
const FormControl = React.forwardRef(
  (
    props: React.HTMLAttributes<HTMLDivElement>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const { error, formItemId, formDescriptionId, formMessageId } =
      useFormField();

    return (
      <div
        ref={ref}
        id={formItemId}
        aria-describedby={
          !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        {...props}
      />
    );
  },
);
FormControl.displayName = "FormControl";

// FormDescription component
const FormDescription = React.forwardRef(
  (
    props: React.HTMLAttributes<HTMLParagraphElement>,
    ref: React.Ref<HTMLParagraphElement>,
  ) => {
    const { className, ...rest } = props;
    const { formDescriptionId } = useFormField();

    return (
      <p
        ref={ref}
        id={formDescriptionId}
        className={cn("text-sm text-gray-500", className)}
        {...rest}
      />
    );
  },
);
FormDescription.displayName = "FormDescription";

// FormMessage component
const FormMessage = React.forwardRef(
  (
    props: React.HTMLAttributes<HTMLParagraphElement>,
    ref: React.Ref<HTMLParagraphElement>,
  ) => {
    const { className, children, ...rest } = props;
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) {
      return null;
    }

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn("text-sm font-medium text-red-500", className)}
        {...rest}
      >
        {body}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
