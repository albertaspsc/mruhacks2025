import React from "react";
import { RefreshCw } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      <span className="ml-2 text-gray-500">{message}</span>
    </div>
  );
}
