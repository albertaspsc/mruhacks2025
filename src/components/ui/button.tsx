import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  asChild?: boolean;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  asChild = false,
  ...restProps
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

  if (asChild) {
    if (React.isValidElement(children)) {
      // Type assertion to handle unknown props
      const childElement = children as React.ReactElement<any>;
      const existingClassName = childElement.props?.className || "";

      return React.cloneElement(childElement, {
        ...restProps,
        className: `${base} ${styles} ${className} ${existingClassName}`.trim(),
      });
    }
    return children;
  }

  return (
    <button className={`${base} ${styles} ${className}`} {...restProps}>
      {children}
    </button>
  );
}
