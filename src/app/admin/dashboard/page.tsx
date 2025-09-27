"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams.get("tab")) {
      router.replace("/admin/dashboard?tab=stats");
    }
  }, [searchParams, router]);

  return null; // Parallel routes handle content
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
