import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          supabaseResponse.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Helper function to copy cookies properly
  const createRedirectWithCookies = (redirectUrl: URL) => {
    const redirectResponse = NextResponse.redirect(redirectUrl);

    // Copy all cookies from supabaseResponse to redirectResponse
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        domain: cookie.domain,
        path: cookie.path,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
      });
    });

    return redirectResponse;
  };

  if (url.pathname === "/admin-login-portal") {
    return supabaseResponse; // Let users access the login page
  }

  // Define protected routes
  const adminRoutes = ["/admin"];
  const isAdminRoute = adminRoutes.some((route) =>
    url.pathname.startsWith(route),
  );

  // Handle admin route protection
  if (isAdminRoute) {
    // Check if user is authenticated
    if (!user) {
      console.log(
        "Unauthenticated user attempting to access admin route:",
        url.pathname,
      );
      url.pathname = "/admin-login-portal";
      url.searchParams.set("next", request.nextUrl.pathname);
      return createRedirectWithCookies(url);
    }

    try {
      // Verify admin privileges server-side
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("id, role, status")
        .eq("id", user.id)
        .in("role", ["volunteer", "admin", "super_admin"])
        .single();

      if (adminError) {
        console.error("Error fetching admin data:", adminError);
        url.pathname = "/unauthorized";
        return createRedirectWithCookies(url);
      }

      if (!adminData) {
        console.log("User is not an admin:", user.id);
        url.pathname = "/unauthorized";
        return createRedirectWithCookies(url);
      }

      if (adminData.status !== "active") {
        console.log(
          "Admin account is not active:",
          user.id,
          "Status:",
          adminData.status,
        );
        url.pathname = "/unauthorized";
        url.searchParams.set("reason", "account_inactive");
        return createRedirectWithCookies(url);
      }

      // Add admin context headers to the supabaseResponse
      supabaseResponse.headers.set("x-admin-role", adminData.role);
      supabaseResponse.headers.set("x-admin-status", adminData.status);

      console.log("Admin access granted:", user.id, "Role:", adminData.role);

      // IMPORTANT: Return the original supabaseResponse with cookies intact
      return supabaseResponse;
    } catch (error) {
      console.error("Unexpected error in admin verification:", error);
      url.pathname = "/error";
      url.searchParams.set("message", "authentication_error");
      return createRedirectWithCookies(url);
    }
  }

  // Handle authenticated users trying to access login/signup pages
  if (user && (url.pathname === "/login" || url.pathname === "/signup")) {
    console.log("Authenticated user redirected from auth page");

    try {
      const { data: adminData } = await supabase
        .from("admins")
        .select("id, role, status")
        .eq("id", user.id)
        .single();

      if (adminData && adminData.status === "active") {
        url.pathname = "/admin/dashboard";
      } else {
        url.pathname = "/dashboard";
      }

      return createRedirectWithCookies(url);
    } catch (error) {
      // If admin check fails, redirect to regular dashboard
      url.pathname = "/dashboard";
      return createRedirectWithCookies(url);
    }
  }

  // Handle root path redirect for authenticated users
  if (user && url.pathname === "/") {
    try {
      const { data: adminData } = await supabase
        .from("admins")
        .select("id, role, status")
        .eq("id", user.id)
        .single();

      if (adminData && adminData.status === "active") {
        url.pathname = "/admin/dashboard";
        return createRedirectWithCookies(url);
      }
    } catch (error) {
      // Continue to normal flow if admin check fails
    }
  }

  // IMPORTANT: Return the supabaseResponse object as it is
  return supabaseResponse;
}
