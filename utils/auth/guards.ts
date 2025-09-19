/**
 * Small auth guard helpers used by registration pages/layout.
 */

/**
 * Returns true when a session contains a user object.
 * @param user - Supabase-like session or wrapper object
 */
export function isAuthenticated(user?: any): boolean {
  return Boolean(user);
}

/**
 * Decide if layout should perform a redirect for a given path + session.
 * Returns a redirect path string (absolute, starting with '/') or null when
 * no redirect is needed.
 */
/**
 * Compute a canonical redirect (string) for the registration layout based on
 * the current session, path, and whether the registration record exists.
 * This function is pure and must not perform IO or call `redirect()`;
 * the caller (layout) performs the actual redirect side-effect.
 *
 * @param user - Supabase-like session or wrapper object
 * @param path - the current pathname (from usePathname())
 * @param registrationExists - whether an existing registration record was found
 * @returns string|null - redirect path (e.g. '/register') or null to allow access
 */
export function getRegisterRedirect(
  user: any,
  path: string,
  registrationExists = false,
): string | null {
  // User completed registration
  if (registrationExists) return "/user/dashboard";

  // Main registration landing
  if (path === "/register") {
    if (user) return "/register/step-1";
    return null;
  }

  // Step pages require auth and confirmation for step-1/step-2 flow
  if (path.includes("step-1") || path.includes("step-2")) {
    if (!user) return "/register";
    return null;
  }

  // Completion page: require auth
  if (path.includes("complete")) {
    if (!user) return "/register";
    return null;
  }

  return null;
}
