"use client";

import React, { useState, useEffect } from "react";
import ParticipantDashboard from "@/components/dashboards/ParticipantDashboard";
import SettingsPage from "../settings/page";
import ProfilePage from "../profile/page";
import { Sidebar } from "@/components/ui/sidebar";
import { CheckCircle, Clock, AlertTriangle, Menu, X } from "lucide-react";
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
    <div
      className={`mb-4 md:mb-6 rounded-md border ${borderColor} ${bgColor} p-3 md:p-4`}
    >
      <div className="flex items-center">
        {icon}
        <h2 className={`font-semibold ${textColor} text-sm md:text-base`}>
          {title}
        </h2>
      </div>
      <p className={`mt-2 ${textColor} text-xs md:text-sm`}>{message}</p>
    </div>
  );
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Registration>();
  const [currentView, setCurrentView] = useState<DashboardView>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    // Close sidebar on mobile after navigation
    setIsSidebarOpen(false);
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("mobile-sidebar");
      const menuButton = document.getElementById("menu-button");

      if (
        isSidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent scroll when sidebar is open on mobile
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

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

  // Render dashboard with responsive sidebar
  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop: persistent, mobile: overlay (hamburger menu) */}
      <div
        id="mobile-sidebar"
        className={`
          fixed lg:static top-0 left-0 h-full z-50
          w-64 sm:w-72 lg:w-80 
          bg-white border-r shadow-lg lg:shadow-sm 
          flex-shrink-0
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4 border-b">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <Sidebar
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigation}
          currentView={currentView}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto min-w-0 flex flex-col">
        {/* Header with mobile menu button and current view title */}
        <div className="bg-white border-b px-4 md:px-6 py-3 md:py-4 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              id="menu-button"
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors mr-3"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex-1">
              {getViewTitle()}
            </h1>

            {/* Optional: Add user avatar or other header elements for mobile */}
            <div className="lg:hidden">
              {user && (
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
            {/* Status Banner - only show on main dashboard */}
            {user && currentView === "dashboard" && (
              <StatusBanner status={user.status} />
            )}

            {/* Render Current View */}
            <div className="max-w-full">{renderCurrentView()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
