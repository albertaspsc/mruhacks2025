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

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/admin-login-portal"];
  const isPublicRoute = publicRoutes.some((route) =>
    url.pathname.startsWith(route),
  );

  // Protected routes
  const adminRoutes = ["/admin"];
  const userRoutes = ["/user"];
  const isAdminRoute = adminRoutes.some((route) =>
    url.pathname.startsWith(route),
  );
  const isUserRoute = userRoutes.some((route) =>
    url.pathname.startsWith(route),
  );

  // Redirect unauthenticated users
  if (!user && !isPublicRoute) {
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Handle admin route protection
  if (isAdminRoute && user) {
    try {
      const { data: adminData } = await supabase
        .from("admins")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (!adminData || adminData.status !== "active") {
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }

      // Add admin context to headers
      supabaseResponse.headers.set("x-admin-role", adminData.role);
      supabaseResponse.headers.set("x-admin-status", adminData.status);
    } catch (error) {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && isPublicRoute) {
    try {
      const { data: adminData } = await supabase
        .from("admins")
        .select("role, status")
        .eq("id", user.id)
        .single();

      if (adminData && adminData.status === "active") {
        url.pathname = "/admin/dashboard";
      } else {
        url.pathname = "/user/dashboard";
      }
      return NextResponse.redirect(url);
    } catch {
      url.pathname = "/user/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: Return the supabaseResponse object as it is
  return supabaseResponse;
}
