"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams.get("tab")) {
      router.replace("/admin/dashboard?tab=stats");
    }
  }, [searchParams, router]);

  return null; // Parallel routes handle content
}
