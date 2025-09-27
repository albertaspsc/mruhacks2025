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
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Admin Management
        </h3>
        <p className="text-gray-600">
          Manage admin users, view admin details, change status, and handle
          admin privileges
        </p>
      </div>
      <AdminManagement userRole="admin" readOnly={false} className="" />
    </div>
  );
}
