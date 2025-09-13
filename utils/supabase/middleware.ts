import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
// Supabase uses a symmetric JWT, so the same key is used to sign and verify the token.
// Supabase is planning to support asymmetric JWT in the future.
// When that happens, we should switch to using asymmetric JWT.
// See:
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  // Try to get JWT first, If the JWT is invalid or expired,
  // fall back to `supabase.auth.getUser()`.
  const user = await (async function () {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If JWT is missing `supabase.auth.getUser()` would error.
    // This mean the user is not authenticated, so user = null.
    if (!session?.access_token) return null;

    try {
      // Use `jwtVerify` to validate the JWT within the session,
      // so that a user cannot forge a session by manipulating cookies.
      await jwtVerify(
        session.access_token,
        new TextEncoder().encode(process.env.SUPABASE_JWT),
      );
      return session.user;
    } catch (err) {
      console.error(err);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    }
  })();
  // If no user and requesting a protected route, redirect to login.
  if (
    !user &&
    (request.nextUrl.pathname.startsWith("/user") ||
      request.nextUrl.pathname.startsWith("/admin"))
  ) {
    // Redirect the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return supabaseResponse;
}
