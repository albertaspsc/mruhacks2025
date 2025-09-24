"use client";

import * as React from "react";
import { cn } from "@/components/lib/utils";

// Updated interface with optional children
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode; // Make children optional
}

// Enhanced Label component that supports both your styling and the form requirements
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className = "", ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  ),
);
Label.displayName = "Label";

export { Label };
