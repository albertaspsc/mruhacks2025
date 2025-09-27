/**
 * @fileoverview Admin error handling utilities
 *
 * Provides consistent error handling and user feedback for admin operations
 */

import { toast } from "@/components/hooks/use-toast";

export class AdminErrorHandler {
  /**
   * Handles API errors and returns user-friendly error messages
   */
  static handleApiError(error: unknown): string {
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes("validation")) {
        return "Please check your input and try again.";
      }
      if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        return "Network error. Please check your connection and try again.";
      }
      if (
        error.message.includes("unauthorized") ||
        error.message.includes("403")
      ) {
        return "You do not have permission to perform this action.";
      }
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        return "The requested resource was not found.";
      }
      if (error.message.includes("conflict") || error.message.includes("409")) {
        return "This action conflicts with existing data. Please try again.";
      }

      // Return the error message if it's user-friendly
      return error.message;
    }

    // Fallback for unknown error types
    return "An unexpected error occurred. Please try again.";
  }

  /**
   * Shows success toast notification
   */
  static showSuccessToast(message: string): void {
    toast({
      title: "Success",
      description: message,
      variant: "success",
    });
  }

  /**
   * Shows error toast notification
   */
  static showErrorToast(message: string): void {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  }

  /**
   * Shows warning toast notification
   */
  static showWarningToast(message: string): void {
    toast({
      title: "Warning",
      description: message,
      variant: "default",
    });
  }

  /**
   * Shows info toast notification
   */
  static showInfoToast(message: string): void {
    toast({
      title: "Info",
      description: message,
      variant: "default",
    });
  }
}
