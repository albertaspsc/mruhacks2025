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
/**
 * Module-level helpers and exported functions replacing the previous
 * `AuthService` class. These expose the same functionality as standalone
 * functions to simplify import and testing.
 */

async function createSupabaseServerClient() {
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

async function createSupabaseClient() {
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
          } catch (error) {}
        },
      },
    },
  );
}

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  const cookieStore = request.cookies;
  const sessionCookie = cookieStore.get("sb-access-token");
  return sessionCookie?.value || null;
}

async function getUserWithAdminData(userId: string): Promise<AuthUserDTO> {
  try {
    const supabaseAdmin = await createSupabaseServerClient();

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
    throw new ExternalServiceError("Supabase", "Failed to retrieve user data");
  }
}

export async function verifyApiAuth(
  request: NextRequest,
): Promise<{ user: AuthUserDTO } | { error: string; status: number }> {
  try {
    const token = extractToken(request);

    if (!token) {
      return { error: "No authentication token provided", status: 401 };
    }

    const supabaseAdmin = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return { error: "Invalid or expired token", status: 401 };
    }

    const authUser = await getUserWithAdminData(user.id);

    return { user: authUser };
  } catch (error) {
    console.error("API auth verification error:", error);
    return { error: "Authentication failed", status: 500 };
  }
}

export async function getCurrentUser(): Promise<
  { user: AuthUserDTO } | { error: string }
> {
  try {
    const supabase = await createSupabaseClient();
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

    const authUser = await getUserWithAdminData(user.id);

    return { user: authUser };
  } catch (error) {
    console.error("Get current user error:", error);
    return { error: "Failed to get current user" };
  }
}

export function requireRole(allowedRoles: string[]) {
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

export async function getSupabaseClient() {
  return await createSupabaseClient();
}

export async function getSupabaseAdminClient() {
  return await createSupabaseServerClient();
}
