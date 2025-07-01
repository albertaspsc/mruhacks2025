"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "utils/supabase/client";
import { isAdmin } from "src/db/admin";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!user || error) {
          console.log("No user found, redirecting to login");
          router.push("/login?next=/admin");
          return;
        }

        // Check if user is admin
        const { data: isUserAdmin, error: adminError } =
          await isAdmin(supabase);

        if (adminError) {
          console.error("Error checking admin status:", adminError);
          router.push("/");
          return;
        }

        if (!isUserAdmin) {
          console.log("User is not admin, redirecting to home");
          router.push("/");
          return;
        }

        console.log("User is admin, allowing access");
        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login?next=/admin");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authorized (redirect is happening)
  if (!isAuthorized) {
    return null;
  }

  // User is authorized, render the admin content
  return <>{children}</>;
}
