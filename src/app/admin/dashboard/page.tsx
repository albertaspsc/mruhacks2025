"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ParticipantManagement } from "@/components/admin/ParticipantManagement";
import { createClient } from "../../../../utils/supabase/client";

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  // Simple logout function (no auth checks)
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/admin-login-portal");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                MRUHacks Admin Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Admin
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Participant Management
            </h2>
            <p className="text-gray-600">
              Manage registrations, view participant details, change status, and
              handle check-ins
            </p>
          </div>

          {/* Participant Management Component */}
          <ParticipantManagement
            userRole="admin"
            readOnly={false}
            className=""
          />
        </div>
      </main>
    </div>
  );
}
