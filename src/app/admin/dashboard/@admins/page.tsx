"use client";

import { use } from "react";
import { AdminManagement } from "@/components/dashboards/admin/AdminManagement";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default function AdminsSlot({ searchParams }: PageProps) {
  const resolvedSearchParams = use(searchParams);
  const isActive = resolvedSearchParams.tab === "admins";

  if (!isActive) {
    return null;
  }

  return (
    <div className="space-y-6">
      <AdminManagement userRole="admin" readOnly={false} className="" />
    </div>
  );
}
