import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = "px-4 py-2 rounded-md font-medium transition-opacity";

  let styles = "";

  switch (variant) {
    case "primary":
      styles = "bg-black text-white hover:opacity-90 disabled:opacity-50";
      break;
    case "secondary":
      styles = "bg-gray-100 text-black hover:opacity-90 disabled:opacity-50";
      break;
    case "ghost":
      styles =
        "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50";
      break;
    default:
      styles = "bg-black text-white hover:opacity-90 disabled:opacity-50";
  }

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
