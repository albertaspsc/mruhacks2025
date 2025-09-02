import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={
        `w-full px-3 py-2 border border-gray-300 rounded-md ` +
        `focus:outline-none focus:ring-2 focus:ring-black ` +
        className
      }
      {...props}
    />
  );
}
