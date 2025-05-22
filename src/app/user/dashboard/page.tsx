"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ParticipantDashboard from "@/components/dashboards/ParticipantDashboard";
import { Sidebar } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Status banner component
const StatusBanner = ({
  status,
}: {
  status: "confirmed" | "pending" | "waitlisted";
}) => {
  // Configure based on status
  const config = {
    confirmed: {
      bgColor: "bg-green-100",
      borderColor: "border-green-400",
      textColor: "text-green-800",
      icon: <CheckCircle className="h-5 w-5 text-green-500 mr-2" />,
      title: "Registration Confirmed",
      message:
        "Your registration has been confirmed. We look forward to seeing you at the event!",
    },
    pending: {
      bgColor: "bg-blue-100",
      borderColor: "border-blue-400",
      textColor: "text-blue-800",
      icon: <Clock className="h-5 w-5 text-blue-500 mr-2" />,
      title: "Registration Pending",
      message:
        "Your registration is currently under review. We'll notify you once it's confirmed.",
    },
    waitlisted: {
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-400",
      textColor: "text-yellow-800",
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />,
      title: "Waitlisted",
      message:
        "You've been added to our waitlist. We'll notify you if a spot becomes available.",
    },
  };

  const { bgColor, borderColor, textColor, icon, title, message } =
    config[status];

  return (
    <div className={`mb-6 rounded-md border ${borderColor} ${bgColor} p-4`}>
      <div className="flex items-center">
        {icon}
        <h2 className={`font-semibold ${textColor}`}>{title}</h2>
      </div>
      <p className={`mt-2 ${textColor} text-sm`}>{message}</p>
    </div>
  );
};

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
        // TODO - replace with actual auth check
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock user data
        const mockUser: User = {
          id: "asia123",
          name: "Asia Hacker",
          email: "asia@mtroyal.ca",
          status: "confirmed", // Change to test different statuses
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

  // Handle logout
  const handleLogout = () => {
    // Redirects to logout route with next parameter pointing to main site
    // Route handles Supabase logout and redirect automatically
    window.location.href = "/auth/logout?next=/";
  };

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Render dashboard with sidebar
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white border-r">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Navbar */}
        <div className="md:hidden flex items-center p-4 border-b">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-64 bg-white !backdrop-blur-none"
              style={{ backgroundColor: "white" }}
            >
              <Sidebar user={user} onLogout={handleLogout} />
            </SheetContent>
          </Sheet>

          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>

        {/* Dashboard Content */}
        <div className="p-4">
          {/* Status Banner */}
          {user && <StatusBanner status={user.status} />}

          <ParticipantDashboard user={user || undefined} />
        </div>
      </div>
    </div>
  );
}
