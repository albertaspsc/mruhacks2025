"use client";

import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
  </div>
);
