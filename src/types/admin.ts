import { z } from "zod";
import { Workshop } from "./workshop";
import { ServiceResult } from "./registration";

// Admin form schemas
export const AdminWorkshopFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().min(1, "Location is required"),
  maxCapacity: z.number().min(1, "Capacity must be at least 1"),
  isActive: z.boolean(),
});

export type AdminWorkshopFormData = z.infer<typeof AdminWorkshopFormSchema>;

// Admin user context
export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "volunteer" | "super_admin";
  status: "active" | "inactive";
}

// Admin stats
export interface AdminStats {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

// Workshop management types
export interface WorkshopWithRegistrations extends Workshop {
  currentRegistrations: number;
  registrations?: Array<{
    id: string;
    participant: {
      firstName: string;
      lastName: string;
      fullName: string;
      yearOfStudy: string;
      gender: string;
      major: string;
    };
    registeredAt: string;
  }>;
}

// Admin workshop interface (for admin dashboard)
export interface AdminWorkshop {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  maxCapacity: number;
  isActive: boolean;
  currentRegistrations?: number;
}

// Admin API response types
export interface AdminWorkshopResponse extends ServiceResult<AdminWorkshop> {}
export interface AdminWorkshopsResponse
  extends ServiceResult<AdminWorkshop[]> {}

// Admin dashboard stats
export interface AdminDashboardStats {
  totalWorkshops: number;
  totalRegistrations: number;
  averageCapacity: number;
  activeWorkshops: number;
}

// Admin form validation helpers
export const validateAdminWorkshopForm = (
  data: unknown,
): {
  success: boolean;
  data?: AdminWorkshopFormData;
  error?: string;
  fieldErrors?: Record<string, string[]>;
} => {
  const result = AdminWorkshopFormSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const fieldErrors: Record<string, string[]> = {};

    result.error.errors.forEach((error) => {
      const fieldPath = error.path.join(".");
      const errorMessage = error.message;

      if (fieldPath) {
        if (!fieldErrors[fieldPath]) {
          fieldErrors[fieldPath] = [];
        }
        fieldErrors[fieldPath].push(errorMessage);
      }
    });

    return {
      success: false,
      error: "Validation failed",
      fieldErrors,
    };
  }
};
