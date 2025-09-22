import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { parkingState, yearOfStudy } from "@/db/schema";

// Type for parking state enum values
export type ParkingState = "Yes" | "No" | "Not sure";

// Type for year of study enum values
export type YearOfStudy = "1st" | "2nd" | "3rd" | "4th+" | "Recent Grad";

// Password validation schema for authentication
export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/(?=.*[a-z])/, "Password must include at least one lowercase letter")
  .regex(/(?=.*[A-Z])/, "Password must include at least one uppercase letter")
  .regex(/(?=.*\d)/, "Password must include at least one number")
  .regex(
    /(?=.*[@$!%*?&])/,
    "Password must include at least one special character (@$!%*?&)",
  );

// Password validation helper for UI components
export const passwordValidations = [
  {
    test: (password: string) => password.length >= 8,
    message: "Password must be at least 8 characters",
  },
  {
    test: (password: string) => /(?=.*[a-z])/.test(password),
    message: "Password must include at least one lowercase letter",
  },
  {
    test: (password: string) => /(?=.*[A-Z])/.test(password),
    message: "Password must include at least one uppercase letter",
  },
  {
    test: (password: string) => /(?=.*\d)/.test(password),
    message: "Password must include at least one number",
  },
  {
    test: (password: string) => /(?=.*[@$!%*?&])/.test(password),
    message: "Password must include at least one special character (@$!%*?&)",
  },
];

// Email validation schema
export const EmailSchema = z
  .string()
  .min(1, "Please enter your email address")
  .email("Please enter a valid email address");

// Base registration schema that can be reused across forms
export const BaseRegistrationSchema = z.object({
  firstName: z.string().min(1, "Please enter your first name"),
  lastName: z.string().min(1, "Please enter your last name"),
  email: EmailSchema,
  gender: z.number().min(1, "Please select your gender"),
  university: z.number().min(1, "Please select your university"),
  major: z.number().min(1, "Please select your major"),
  yearOfStudy: createSelectSchema(yearOfStudy),
  experience: z.number().min(1, "Please select your experience level"),
  marketing: z.number().min(1, "Please tell us how you heard about us"),
  previousAttendance: z.boolean(),
  parking: createSelectSchema(parkingState),
  accommodations: z.string().optional().default(""),
  dietaryRestrictions: z.array(z.number()).default([]),
  interests: z.array(z.number()).min(1, "Please select at least one interest"),
  resume: z.string().url().optional().or(z.literal("")).default(""),
});

// Authentication schema for login/register
export const AuthSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

// Schema for profile updates (allows partial updates)
export const ProfileUpdateSchema = BaseRegistrationSchema.partial();

// File upload validation schema
export const FileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB
      "File size must be less than 5MB",
    )
    .refine(
      (file) =>
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type),
      "Only PDF, DOC, and DOCX files are allowed",
    ),
});

// Interest selection validation schema
export const InterestSelectionSchema = z.object({
  interests: z
    .array(z.number())
    .min(1, "At least one interest is required")
    .max(3, "Maximum 3 interests allowed"),
});

// Form options type for dropdowns and selections
export interface FormOptions {
  genders: { id: number; gender: string }[];
  universities: { id: number; uni: string }[];
  majors: { id: number; major: string }[];
  interests: { id: number; interest: string }[];
  dietaryRestrictions: { id: number; restriction: string }[];
  marketingTypes: { id: number; marketing: string }[];
}

// Type exports
export type BaseRegistrationInput = z.infer<typeof BaseRegistrationSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type AuthInput = z.infer<typeof AuthSchema>;
export type FileUploadInput = z.infer<typeof FileUploadSchema>;
export type InterestSelectionInput = z.infer<typeof InterestSelectionSchema>;

// Database entity types
export interface UserRegistration {
  id: string;
  email: string;
  f_name: string;
  l_name: string;
  gender: number;
  university: number;
  major: number;
  yearOfStudy: YearOfStudy;
  experience: number;
  marketing: number;
  prev_attendance: boolean;
  parking: ParkingState;
  accommodations: string;
  resume_url?: string;
  resume_filename?: string;
  status: "pending" | "confirmed" | "waitlisted" | "rejected";
  checked_in: boolean;
  timestamp?: string;
  updated_at?: string;
}

// Lookup table types
export interface GenderOption {
  id: number;
  gender: string;
}

export interface UniversityOption {
  id: number;
  uni: string;
}

export interface MajorOption {
  id: number;
  major: string;
}

export interface InterestOption {
  id: number;
  interest: string;
}

export interface DietaryRestrictionOption {
  id: number;
  restriction: string;
}

export interface MarketingTypeOption {
  id: number;
  marketing: string;
}

// Service result types
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

// Form step schemas for multi-step registration
export const PersonalDetailsSchema = BaseRegistrationSchema.pick({
  firstName: true,
  lastName: true,
  gender: true,
  university: true,
  major: true,
  yearOfStudy: true,
  previousAttendance: true,
});

export const FinalQuestionsSchema = BaseRegistrationSchema.pick({
  experience: true,
  interests: true,
  dietaryRestrictions: true,
  accommodations: true,
  parking: true,
  marketing: true,
  resume: true,
});

export type PersonalDetailsInput = z.infer<typeof PersonalDetailsSchema>;
export type FinalQuestionsInput = z.infer<typeof FinalQuestionsSchema>;

// Validation utility functions
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    // Group errors by field for better error handling
    const fieldErrors: Record<string, string[]> = {};
    const generalErrors: string[] = [];

    result.error.errors.forEach((error) => {
      const fieldPath = error.path.join(".");
      const errorMessage = error.message;

      if (fieldPath) {
        if (!fieldErrors[fieldPath]) {
          fieldErrors[fieldPath] = [];
        }
        fieldErrors[fieldPath].push(errorMessage);
      } else {
        generalErrors.push(errorMessage);
      }
    });

    // Create a comprehensive error message
    const errorMessages: string[] = [];

    // Add field-specific errors
    Object.entries(fieldErrors).forEach(([field, errors]) => {
      const fieldName =
        field.charAt(0).toUpperCase() +
        field.slice(1).replace(/([A-Z])/g, " $1");
      errorMessages.push(`${fieldName}: ${errors.join(", ")}`);
    });

    // Add general errors
    if (generalErrors.length > 0) {
      errorMessages.push(...generalErrors);
    }

    return {
      success: false,
      error: errorMessages.join("; "),
      fieldErrors,
    };
  }
}
