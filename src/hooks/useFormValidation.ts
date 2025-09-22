"use client";

import { useMemo } from "react";
import { z } from "zod";
import { passwordValidations } from "@/types/registration";

/**
 * Represents a single validation rule with a test function and error message.
 */
export interface ValidationRule {
  /** Function that tests if the value passes the validation rule */
  test: (value: string) => boolean;
  /** Error message to display when validation fails */
  message: string;
}

/**
 * Configuration options for form validation rules.
 */
export interface UseFormValidationOptions {
  /** Password validation configuration */
  password?: {
    /** Minimum password length (default: 8) */
    minLength?: number;
    /** Whether to require uppercase letters (default: true) */
    requireUppercase?: boolean;
    /** Whether to require lowercase letters (default: true) */
    requireLowercase?: boolean;
    /** Whether to require numbers (default: true) */
    requireNumbers?: boolean;
    /** Whether to require special characters (default: true) */
    requireSpecialChars?: boolean;
  };
  /** Email validation configuration */
  email?: {
    /** Custom regex pattern for email validation */
    customPattern?: RegExp;
  };
  /** Required field validation configuration */
  required?: {
    /** Custom error message for required fields */
    customMessage?: string;
  };
}

/**
 * Custom hook for form validation with configurable rules.
 * Provides validation functions for common form fields like passwords, emails, and required fields.
 *
 * @param options - Configuration options for validation rules
 * @returns Object containing validation rules and validation functions
 */
export function useFormValidation(options: UseFormValidationOptions = {}) {
  const validationRules = useMemo(() => {
    const rules: Record<string, ValidationRule[]> = {};

    // Password validation
    if (options.password) {
      const passwordRules: ValidationRule[] = [];
      const {
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireNumbers = true,
        requireSpecialChars = true,
      } = options.password;

      if (minLength > 0) {
        passwordRules.push({
          test: (password) => password.length >= minLength,
          message: `Password must be at least ${minLength} characters`,
        });
      }

      if (requireUppercase) {
        passwordRules.push({
          test: (password) => /(?=.*[A-Z])/.test(password),
          message: "Password must include at least one uppercase letter",
        });
      }

      if (requireLowercase) {
        passwordRules.push({
          test: (password) => /(?=.*[a-z])/.test(password),
          message: "Password must include at least one lowercase letter",
        });
      }

      if (requireNumbers) {
        passwordRules.push({
          test: (password) => /(?=.*\d)/.test(password),
          message: "Password must include at least one number",
        });
      }

      if (requireSpecialChars) {
        passwordRules.push({
          test: (password) => /(?=.*[@$!%*?&])/.test(password),
          message:
            "Password must include at least one special character (@$!%*?&)",
        });
      }

      rules.password = passwordRules;
    }

    // Email validation
    if (options.email) {
      const emailRules: ValidationRule[] = [
        {
          test: (email) => email.length > 0,
          message: "Email is required",
        },
        {
          test: (email) => {
            const pattern =
              options.email?.customPattern || /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return pattern.test(email);
          },
          message: "Enter a valid email address",
        },
      ];
      rules.email = emailRules;
    }

    // Required field validation
    if (options.required) {
      rules.required = [
        {
          test: (value) => value.length > 0,
          message: options.required.customMessage || "This field is required",
        },
      ];
    }

    return rules;
  }, [options]);

  /**
   * Validates a field value against its configured validation rules.
   *
   * @param fieldName - Name of the field to validate
   * @param value - Value to validate
   * @returns Error message if validation fails, null if valid
   */
  const validateField = (fieldName: string, value: string): string | null => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    for (const rule of rules) {
      if (!rule.test(value)) {
        return rule.message;
      }
    }
    return null;
  };

  /**
   * Validates a password against configured password rules.
   *
   * @param password - Password to validate
   * @returns Object containing validation result and error messages
   */
  const validatePassword = (
    password: string,
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (options.password) {
      const rules = validationRules.password || [];
      for (const rule of rules) {
        if (!rule.test(password)) {
          errors.push(rule.message);
        }
      }
    } else {
      // Use default password validation from types
      for (const validation of passwordValidations) {
        if (!validation.test(password)) {
          errors.push(validation.message);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  /**
   * Validates an email address against configured email rules.
   *
   * @param email - Email address to validate
   * @returns Object containing validation result and error message
   */
  const validateEmail = (
    email: string,
  ): { isValid: boolean; error?: string } => {
    if (options.email) {
      const error = validateField("email", email);
      return {
        isValid: !error,
        error: error || undefined,
      };
    }

    // Default email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return { isValid: false, error: "Email is required" };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "Enter a valid email address" };
    }
    return { isValid: true };
  };

  /**
   * Validates that a required field has a non-empty value.
   *
   * @param value - Value to validate
   * @param customMessage - Custom error message to display
   * @returns Object containing validation result and error message
   */
  const validateRequired = (
    value: string,
    customMessage?: string,
  ): { isValid: boolean; error?: string } => {
    if (!value || value.trim().length === 0) {
      return {
        isValid: false,
        error: customMessage || "This field is required",
      };
    }
    return { isValid: true };
  };

  /**
   * Validates a license plate number format.
   *
   * @param plate - License plate number to validate
   * @returns Object containing validation result and error message
   */
  const validateLicensePlate = (
    plate: string,
  ): { isValid: boolean; error?: string } => {
    if (!plate) {
      return {
        isValid: false,
        error: "License plate is required when parking is selected",
      };
    }
    if (plate.length < 2 || plate.length > 10) {
      return {
        isValid: false,
        error: "License plate must be between 2-10 characters",
      };
    }
    if (!/^[A-Z0-9-\s]+$/.test(plate)) {
      return {
        isValid: false,
        error:
          "License plate can only contain letters, numbers, hyphens, and spaces",
      };
    }
    return { isValid: true };
  };

  /**
   * Validates an array of interests against count constraints.
   *
   * @param interests - Array of interest IDs to validate
   * @param minCount - Minimum number of interests required (default: 1)
   * @param maxCount - Maximum number of interests allowed (default: 3)
   * @returns Object containing validation result and error message
   */
  const validateInterests = (
    interests: number[],
    minCount: number = 1,
    maxCount: number = 3,
  ): { isValid: boolean; error?: string } => {
    if (interests.length < minCount) {
      return {
        isValid: false,
        error: `At least ${minCount} interest is required`,
      };
    }
    if (interests.length > maxCount) {
      return { isValid: false, error: `Maximum ${maxCount} interests allowed` };
    }
    return { isValid: true };
  };

  /**
   * Validates a file against size and type constraints.
   *
   * @param file - File to validate
   * @param maxSize - Maximum file size in bytes (default: 5MB)
   * @param allowedTypes - Array of allowed MIME types
   * @returns Object containing validation result and error message
   */
  const validateFile = (
    file: File,
    maxSize: number = 5 * 1024 * 1024,
    allowedTypes: string[] = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  ): { isValid: boolean; error?: string } => {
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
      };
    }
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "Only PDF, DOC, and DOCX files are allowed",
      };
    }
    return { isValid: true };
  };

  return {
    validationRules,
    validateField,
    validatePassword,
    validateEmail,
    validateRequired,
    validateLicensePlate,
    validateInterests,
    validateFile,
  };
}
