"use client";

import { useState, useCallback } from "react";
import { useFormValidation } from "./useFormValidation";

/**
 * Configuration options for file upload functionality.
 */
export interface FileUploadOptions {
  /** Maximum file size in bytes (default: 5MB) */
  maxSize?: number;
  /** Array of allowed MIME types for file upload */
  allowedTypes?: string[];
  /** API endpoint for file upload */
  endpoint?: string;
  /** User ID to associate with the uploaded file */
  userId?: string;
}

/**
 * Current state of the file upload process.
 */
export interface FileUploadState {
  /** Whether a file is currently being uploaded */
  isUploading: boolean;
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Error message if upload failed */
  error: string | null;
  /** URL of the successfully uploaded file */
  uploadedUrl: string | null;
  /** Name of the uploaded file */
  fileName: string | null;
}

/**
 * Custom hook for handling file uploads with validation and progress tracking.
 * Provides state management and utility functions for file upload operations.
 *
 * @param options - Configuration options for file upload
 * @returns Object containing upload state and utility functions
 */
export function useFileUpload(options: FileUploadOptions = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    endpoint = "/api/resume",
    userId,
  } = options;

  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedUrl: null,
    fileName: null,
  });

  const { validateFile } = useFormValidation();

  /**
   * Uploads a file to the configured endpoint with validation.
   *
   * @param file - File to upload
   * @returns Promise that resolves to the uploaded file URL or null if upload failed
   */
  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      // Validate file
      const validation = validateFile(file, maxSize, allowedTypes);
      if (!validation.isValid) {
        setState((prev) => ({
          ...prev,
          error: validation.error || "Invalid file",
        }));
        return null;
      }

      setState((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
        fileName: file.name,
      }));

      try {
        const formData = new FormData();
        formData.append("file", file);

        if (userId) {
          formData.append("userId", userId);
        }

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Upload failed");
        }

        const { publicUrl } = (await response.json()) as { publicUrl: string };

        setState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 100,
          uploadedUrl: publicUrl,
          error: null,
        }));

        return publicUrl;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed unexpectedly";
        setState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 0,
          error: errorMessage,
          uploadedUrl: null,
        }));
        return null;
      }
    },
    [maxSize, allowedTypes, endpoint, userId, validateFile],
  );

  /**
   * Clears the current error state.
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Resets the upload state to initial values.
   */
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedUrl: null,
      fileName: null,
    });
  }, []);

  /**
   * Validates a file against the configured type and size constraints.
   *
   * @param file - File to validate
   * @returns Error message if validation fails, null if valid
   */
  const validateFileType = useCallback(
    (file: File): string | null => {
      const validation = validateFile(file, maxSize, allowedTypes);
      return validation.isValid ? null : validation.error || "Invalid file";
    },
    [maxSize, allowedTypes, validateFile],
  );

  return {
    ...state,
    uploadFile,
    clearError,
    reset,
    validateFileType,
  };
}

/**
 * Convenience hook specifically for resume file uploads.
 * Pre-configured with resume-specific file types and size limits.
 *
 * @param options - Configuration options including required userId
 * @returns Object containing resume upload state and functions
 */
export function useResumeUpload(
  options: { userId: string } & Partial<FileUploadOptions> = { userId: "" },
) {
  const { userId, ...restOptions } = options;
  return useFileUpload({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    endpoint: "/api/resume",
    userId,
    ...restOptions,
  });
}
