import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ children, className = "", ...props }: LabelProps) {
  return (
    <label className={`block mb-1 font-semibold ${className}`} {...props}>
      {children}
    </label>
  );
}
