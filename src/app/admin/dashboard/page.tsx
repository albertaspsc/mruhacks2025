"use client";

import React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";

export default function AdminDashboardPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar section */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto bg-purple-100">
        <AdminDashboard className="p-6" />
      </div>
    </div>
  );
}
