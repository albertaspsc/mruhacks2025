"use client";

import React from "react";
import Link from "next/link";
import { UserCheck, LogOut, Home } from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      console.log("🚪 Signing out...");

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        alert("Error signing out. Please try again.");
        return;
      }

      console.log("✅ Signed out successfully");
      router.push("/");
    } catch (error) {
      console.error("Unexpected sign out error:", error);
      alert("Error signing out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <UserCheck className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  MRUHacks Volunteer
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>

              <div className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700">
                <UserCheck className="h-4 w-4 mr-2" />
                Volunteer
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
