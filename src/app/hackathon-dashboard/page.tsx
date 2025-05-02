"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ParticipantDashboard from "@/components/dashboards/ParticipantDashboard";

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
  </div>
);

interface User {
  id: string;
  name: string;
  email: string;
  status: "confirmed" | "pending" | "waitlisted";
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        //
        // TODO - replace with your actual auth check
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock user data
        const mockUser: User = {
          id: "user123",
          name: "Asia Hacker",
          email: "asia@example.com",
          status: "confirmed",
        };

        setUser(mockUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Render the simplified dashboard
  return <ParticipantDashboard user={user || undefined} />;
}
