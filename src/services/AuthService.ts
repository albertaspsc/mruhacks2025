import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AuthUserDTO } from "@/dto/user.dto";
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  ExternalServiceError,
} from "@/errors";

/**
 * AuthService - Centralizes Supabase authentication functionality
 *
 * Provides methods for:
 * - API authentication verification
 * - Current user retrieval
 * - Role-based authorization
 * - Supabase client creation
 */
export class AuthService {
  /**
   * Creates a Supabase admin client with service role key
   * Used for server-side operations requiring elevated privileges
   */
  private static async createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    );
  }

  /**
   * Creates a Supabase client for regular user operations
   * Uses anonymous key for client-side compatible operations
   */
  private static async createSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    );
  }

  /**
   * Extracts authentication token from request
   * Supports both Authorization header and cookie-based authentication
   */
  private static extractToken(request: NextRequest): string | null {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // Fallback to cookies (for same-origin requests)
    const cookieStore = request.cookies;
    const sessionCookie = cookieStore.get("sb-access-token");
    return sessionCookie?.value || null;
  }

  /**
   * Retrieves user data with admin role information
   * Consolidates user and admin data fetching logic
   */
  private static async getUserWithAdminData(
    userId: string,
  ): Promise<AuthUserDTO> {
    try {
      const supabaseAdmin = await this.createSupabaseServerClient();

      // Get admin data if user might be an admin
      let adminData = null;
      try {
        const { data } = await supabaseAdmin
          .from("admins")
          .select("id, role, status")
          .eq("id", userId)
          .single();

        adminData = data;
      } catch {
        // User is not an admin, that's fine
      }

      // Get user data from Supabase auth
      const { data: authUser, error } =
        await supabaseAdmin.auth.admin.getUserById(userId);
      if (error || !authUser.user) {
        throw new AuthenticationError("User data not found");
      }

      return {
        id: authUser.user.id,
        email: authUser.user.email!,
        role: adminData?.role || "user",
        status: adminData?.status || "active",
        isAdmin: !!adminData,
      };
    } catch (error) {
      console.error("Error getting user with admin data:", error);
      throw new ExternalServiceError(
        "Supabase",
        "Failed to retrieve user data",
      );
    }
  }

  /**
   * Verify authentication for API routes
   * Extracts and validates JWT token, returns authenticated user data
   *
   * @param request - Next.js request object
   * @returns Promise resolving to user data or error response
   */
  static async verifyApiAuth(
    request: NextRequest,
  ): Promise<{ user: AuthUserDTO } | { error: string; status: number }> {
    try {
      const token = this.extractToken(request);

      if (!token) {
        return { error: "No authentication token provided", status: 401 };
      }

      // Verify token with service role client
      const supabaseAdmin = await this.createSupabaseServerClient();
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        return { error: "Invalid or expired token", status: 401 };
      }

      const authUser = await this.getUserWithAdminData(user.id);

      return { user: authUser };
    } catch (error) {
      console.error("API auth verification error:", error);
      return { error: "Authentication failed", status: 500 };
    }
  }

  /**
   * Get current authenticated user
   * Retrieves the currently authenticated user with role information
   *
   * @returns Promise resolving to user data or error
   */
  static async getCurrentUser(): Promise<
    { user: AuthUserDTO } | { error: string }
  > {
    try {
      const supabase = await this.createSupabaseClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        return { error: authError.message };
      }

      if (!user) {
        return { error: "No authenticated user" };
      }

      const authUser = await this.getUserWithAdminData(user.id);

      return { user: authUser };
    } catch (error) {
      console.error("Get current user error:", error);
      return { error: "Failed to get current user" };
    }
  }

  /**
   * Check if user has required role
   * Higher-order function that returns a role validation function
   *
   * @param allowedRoles - Array of roles that are permitted
   * @returns Function that validates user role
   * @throws ValidationError if allowedRoles is invalid
   */
  static requireRole(allowedRoles: string[]) {
    // Input validation
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
      throw new ValidationError(
        "allowedRoles",
        "Must provide non-empty array of allowed roles",
      );
    }

    return (user: AuthUserDTO) => {
      if (!allowedRoles.includes(user.role)) {
        throw new AuthorizationError(
          `Required role: ${allowedRoles.join(" or ")}, got: ${user.role}`,
        );
      }
      return { authorized: true };
    };
  }

  /**
   * Get Supabase client for authenticated user operations
   * Returns a client configured for regular user operations
   *
   * @returns Promise resolving to Supabase client
   */
  static async getSupabaseClient() {
    return await this.createSupabaseClient();
  }

  /**
   * Get Supabase admin client (service role)
   * Returns a client with elevated privileges for admin operations
   *
   * @returns Promise resolving to Supabase admin client
   */
  static async getSupabaseAdminClient() {
    return await this.createSupabaseServerClient();
  }
}
