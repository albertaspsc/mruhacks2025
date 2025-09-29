/**
 * @fileoverview Admin route constants
 *
 * Centralized route management for admin pages
 */

export const ADMIN_ROUTES = {
  DASHBOARD: "/admin/dashboard",
  WORKSHOPS: {
    LIST: "/admin/dashboard?tab=workshops",
    CREATE: "/admin/workshops/create",
    EDIT: (id: string) => `/admin/workshops/${id}/edit`,
    REGISTRATIONS: (id: string) => `/admin/workshops/${id}/registrations`,
  },
  PARTICIPANTS: {
    LIST: "/admin/dashboard?tab=participants",
    DETAILS: (id: string) => `/admin/participants/${id}`,
  },
  LOGIN: "/admin-login-portal",
  LOGOUT: "/auth/logout",
} as const;

export type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];
