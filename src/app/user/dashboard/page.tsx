"use client";

import React, { useState, useEffect } from "react";
import ParticipantDashboard from "@/components/dashboards/ParticipantDashboard";
import SettingsPage from "../settings/page";
import ProfilePage from "../profile/page";
import { Sidebar } from "@/components/ui/sidebar";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RegistrationInput } from "@/context/RegisterFormContext";
import { Registration, getRegistration } from "@/db/registration";

// Define available views
type DashboardView = "dashboard" | "settings" | "profile";

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

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Registration>();
  const [currentView, setCurrentView] = useState<DashboardView>("dashboard");

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: registration } = await getRegistration();
        setUser(registration);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle logout
  const handleLogout = () => {
    // Redirects to logout route with next parameter pointing to main site
    // Route handles Supabase logout and redirect automatically
    window.location.href = "/auth/logout?next=/";
  };

  // Handle navigation from sidebar
  const handleNavigation = (view: DashboardView) => {
    setCurrentView(view);
  };

  // Render the current view component
  const renderCurrentView = () => {
    switch (currentView) {
      case "settings":
        return <SettingsPage />;
      case "profile":
        return <ProfilePage />;
      case "dashboard":
      default:
        return <ParticipantDashboard user={user || undefined} />;
    }
  };

  // Get the title for the current view
  const getViewTitle = () => {
    switch (currentView) {
      case "settings":
        return "Settings";
      case "profile":
        return "Profile";
      case "dashboard":
      default:
        return "Dashboard";
    }
  };

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Render dashboard with persistent sidebar
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Persistent Sidebar - Always visible on all screen sizes */}
      <div className="w-64 sm:w-72 lg:w-80 bg-white border-r shadow-sm flex-shrink-0">
        <Sidebar
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigation}
          currentView={currentView}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto min-w-0">
        {/* Header with current view title */}
        <div className="bg-white border-b px-6 py-4 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">{getViewTitle()}</h1>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Status Banner - only show on main dashboard */}
          {user && currentView === "dashboard" && (
            <StatusBanner status={user.status} />
          )}

          {/* Render Current View */}
          <div className="max-w-full">{renderCurrentView()}</div>
        </div>
      </div>
    </div>
  );
}
