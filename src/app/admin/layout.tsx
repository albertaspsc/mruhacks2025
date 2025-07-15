"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "./../../../utils/supabase/client";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    // Skip auth check for admin login portal
    if (pathname === "/admin-login-portal") {
      setIsLoading(false);
      setIsAuthorized(true);
      return;
    }

    const checkAuth = async () => {
      try {
        // Step 1: Check Supabase authentication
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.log("No authenticated user, redirecting to admin login");
          router.push("/admin-login-portal");
          return;
        }

        // Step 2: Check if user is in admins table
        const { data: adminData, error: adminError } = await supabase
          .from("admins")
          .select("id, email, role, status")
          .eq("id", user.id)
          .single();

        if (adminError || !adminData) {
          console.log("User is not an admin, redirecting to login");
          await supabase.auth.signOut();
          router.push("/admin-login-portal");
          return;
        }

        // Step 3: Check admin status
        if (adminData.status !== "active") {
          console.log("Admin account is not active");
          await supabase.auth.signOut();
          router.push("/admin-login-portal");
          return;
        }

        // Step 4: Check role permissions for admin routes
        if (pathname.startsWith("/admin") && adminData.role !== "admin") {
          console.log("User is not admin, redirecting to volunteer dashboard");
          router.push("/volunteer/dashboard");
          return;
        }

        console.log("Admin access granted:", adminData.email);
        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/admin-login-portal");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname, supabase]);

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

  // For admin login portal, render without any wrapper
  if (pathname === "/admin-login-portal") {
    return <>{children}</>;
  }

  // For other admin pages, just render children
  return <>{children}</>;
}
