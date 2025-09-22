"use client";

import { useState, useCallback } from "react";

/**
 * Available toast notification types.
 */
export type ToastType = "success" | "error" | "warning" | "info";

/**
 * State object for toast notifications.
 */
export interface ToastState {
  /** Type of toast notification */
  type: ToastType;
  /** Main title/message of the toast */
  title: string;
  /** Optional detailed description */
  description?: string;
}

/**
 * Complete form state including submission status, messages, and notifications.
 */
export interface FormState {
  /** Whether the form is currently being submitted */
  isSubmitting: boolean;
  /** Whether the form is in a loading state */
  isLoading: boolean;
  /** Current error message */
  error: string | null;
  /** Current success message */
  success: string | null;
  /** Current toast notification */
  toast: ToastState | null;
}

/**
 * Initial state options for the form state hook.
 */
export interface UseFormStateOptions {
  /** Initial submitting state */
  initialSubmitting?: boolean;
  /** Initial loading state */
  initialLoading?: boolean;
  /** Initial error message */
  initialError?: string | null;
  /** Initial success message */
  initialSuccess?: string | null;
}

/**
 * Custom hook for managing form state including submission status, loading states, and notifications.
 * Provides comprehensive state management for form interactions with toast notifications.
 *
 * @param options - Initial state configuration options
 * @returns Object containing form state and state management functions
 */
export function useFormState(options: UseFormStateOptions = {}) {
  const [state, setState] = useState<FormState>({
    isSubmitting: options.initialSubmitting || false,
    isLoading: options.initialLoading || false,
    error: options.initialError || null,
    success: options.initialSuccess || null,
    toast: null,
  });

  /**
   * Sets the form submission state.
   *
   * @param isSubmitting - Whether the form is being submitted
   */
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting }));
  }, []);

  /**
   * Sets the form loading state.
   *
   * @param isLoading - Whether the form is in a loading state
   */
  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  /**
   * Sets the error message state.
   *
   * @param error - Error message to display, or null to clear
   */
  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  /**
   * Sets the success message state.
   *
   * @param success - Success message to display, or null to clear
   */
  const setSuccess = useCallback((success: string | null) => {
    setState((prev) => ({ ...prev, success }));
  }, []);

  /**
   * Sets the toast notification state.
   *
   * @param toast - Toast notification object, or null to clear
   */
  const setToast = useCallback((toast: ToastState | null) => {
    setState((prev) => ({ ...prev, toast }));
  }, []);

  /**
   * Shows a toast notification with the specified type and message.
   *
   * @param type - Type of toast notification
   * @param title - Main title/message of the toast
   * @param description - Optional detailed description
   */
  const showToast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      setToast({ type, title, description });
    },
    [setToast],
  );

  /**
   * Shows a success toast notification.
   *
   * @param message - Success message to display
   * @param description - Optional detailed description
   */
  const showSuccess = useCallback(
    (message: string, description?: string) => {
      showToast("success", message, description);
    },
    [showToast],
  );

  /**
   * Shows an error toast notification.
   *
   * @param message - Error message to display
   * @param description - Optional detailed description
   */
  const showError = useCallback(
    (message: string, description?: string) => {
      showToast("error", message, description);
    },
    [showToast],
  );

  /**
   * Shows a warning toast notification.
   *
   * @param message - Warning message to display
   * @param description - Optional detailed description
   */
  const showWarning = useCallback(
    (message: string, description?: string) => {
      showToast("warning", message, description);
    },
    [showToast],
  );

  /**
   * Shows an info toast notification.
   *
   * @param message - Info message to display
   * @param description - Optional detailed description
   */
  const showInfo = useCallback(
    (message: string, description?: string) => {
      showToast("info", message, description);
    },
    [showToast],
  );

  /**
   * Clears the current toast notification.
   */
  const clearToast = useCallback(() => {
    setToast(null);
  }, [setToast]);

  /**
   * Clears the current error message.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  /**
   * Clears the current success message.
   */
  const clearSuccess = useCallback(() => {
    setSuccess(null);
  }, [setSuccess]);

  /**
   * Clears all form state including errors, success messages, and toast notifications.
   */
  const clearAll = useCallback(() => {
    setState({
      isSubmitting: false,
      isLoading: false,
      error: null,
      success: null,
      toast: null,
    });
  }, []);

  /**
   * Resets the form state to initial values.
   */
  const reset = useCallback(() => {
    setState({
      isSubmitting: false,
      isLoading: false,
      error: null,
      success: null,
      toast: null,
    });
  }, []);

  return {
    ...state,
    setSubmitting,
    setLoading,
    setError,
    setSuccess,
    setToast,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearToast,
    clearError,
    clearSuccess,
    clearAll,
    reset,
  };
}
