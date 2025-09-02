import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.delete(name);
        },
      },
    },
  );
}

// Verify authentication for API routes
export async function verifyApiAuth(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get("authorization");
    let token: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      // Fallback to cookies (for same-origin requests)
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set() {}, // No-op for reading
            remove() {}, // No-op for reading
          },
        },
      );

      const {
        data: { session },
      } = await supabase.auth.getSession();
      token = session?.access_token || null;
    }

    if (!token) {
      return { error: "No authentication token provided", status: 401 };
    }

    // Verify token with service role client
    const supabaseAdmin = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return { error: "Invalid or expired token", status: 401 };
    }

    // Get admin data if user might be an admin
    let adminData = null;
    try {
      const { data } = await supabaseAdmin
        .from("admins")
        .select("id, role, status")
        .eq("id", user.id)
        .single();

      adminData = data;
    } catch {
      // User is not an admin, that's fine
    }

    return {
      user: {
        ...user,
        role: adminData?.role || "user",
        status: adminData?.status || "active",
        isAdmin: !!adminData,
      },
    };
  } catch (error) {
    console.error("API auth verification error:", error);
    return { error: "Authentication failed", status: 500 };
  }
}

// Role-based authorization check
export function requireRole(allowedRoles: string[]) {
  return (user: any) => {
    if (!allowedRoles.includes(user.role)) {
      return { error: "Insufficient permissions", status: 403 };
    }
    return { authorized: true };
  };
}

// Wrapper for API routes that require authentication
export function withApiAuth(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
  options: { requiredRoles?: string[] } = {},
) {
  return async (req: NextRequest) => {
    const authResult = await verifyApiAuth(req);

    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    // Check role-based permissions if specified
    if (options.requiredRoles) {
      const roleCheck = requireRole(options.requiredRoles)(authResult.user);
      if (roleCheck.error) {
        return NextResponse.json(
          { error: roleCheck.error },
          { status: roleCheck.status },
        );
      }
    }

    return handler(req, authResult.user!);
  };
}
