import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = "px-4 py-2 rounded-md font-medium transition-opacity";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:opacity-90 disabled:opacity-50"
      : "bg-gray-100 text-black hover:opacity-90 disabled:opacity-50";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
