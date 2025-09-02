"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function AdminWorkshopsPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.push("/admin/dashboard?tab=workshops");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">Redirecting to dashboard...</div>
    </div>
  );
}
