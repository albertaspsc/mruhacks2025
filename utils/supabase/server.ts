import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            // [Error: @supabase/ssr: createBrowserClient in non-browser runtimes (including Next.js pre-rendering mode)
            // was not initialized cookie options that specify getAll and setAll functions (deprecated: alternatively use get, set and remove),
            // but they were needed]
            // TODO - catch that (See middleware.ts)
          }
        },
      },
    },
  );
}
