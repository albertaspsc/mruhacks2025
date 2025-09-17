"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

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
    if (pathname === "/admin-login-portal") {
      setIsLoading(false);
      setIsAuthorized(true);
      return;
    }

    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push("/admin-login-portal");
          return;
        }

        const { data: adminData, error: adminError } = await supabase
          .from("admins")
          .select("id, email, role, status")
          .eq("id", user.id)
          .single();

        if (adminError || !adminData || adminData.status !== "active") {
          await supabase.auth.signOut();
          router.push("/admin-login-portal");
          return;
        }

        if (pathname.startsWith("/admin") && adminData.role !== "admin") {
          router.push("/volunteer/dashboard");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        router.push("/admin-login-portal");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname, supabase]);

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

  if (!isAuthorized) return null;
  if (pathname === "/admin-login-portal") return <>{children}</>;

  return <>{children}</>;
}
