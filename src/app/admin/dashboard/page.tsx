"use client";

{
  /* Admin Dashboard Page with Role-Based Access Control (Volunteer, Admin, Super Admin) */
}

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@components/ui/admin-sidebar";
import SettingsPage from "../settings/page";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { RoleManager } from "@/components/admin/RoleManager";
import { ParticipantManagement } from "@/components/admin/ParticipantManagement";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { createClient } from "utils/supabase/client";

// Define view types for all admin roles including volunteers
type AdminDashboardView =
  | "dashboard"
  | "participants"
  | "check-in" // Available to volunteers
  | "roles" // Super admin only (fixed from admin+ to super admin only)
  | "settings"
  | "profile"
  | "admin-management" // Super admin only
  | "audit-logs" // Super admin only
  | "system-settings"; // Super admin only

interface AdminUser {
  id: string;
  email: string;
  role: "volunteer" | "admin" | "super_admin";
  status: "active" | "inactive" | "suspended";
  firstName?: string;
  lastName?: string;
}

export default function AdminDashboardPage() {
  const [currentView, setCurrentView] =
    useState<AdminDashboardView>("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Initialize admin user data
  useEffect(() => {
    const initializeAdminUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!user || error) {
          console.error("No authenticated user found");
          router.push("/login?next=/admin");
          return;
        }

        // Get admin info from the admins table
        const { data: adminData, error: adminError } = await supabase
          .from("admins")
          .select("id, email, role, status, firstName, lastName")
          .eq("id", user.id)
          .single();

        if (adminError || !adminData) {
          console.error("Admin data not found:", adminError);
          router.push("/login?next=/admin");
          return;
        }

        // Verify admin status is active
        if (adminData.status !== "active") {
          console.error("Admin account is not active:", adminData.status);
          router.push("/unauthorized?reason=account_inactive");
          return;
        }

        // Set admin user data from the admins table
        setAdminUser({
          id: adminData.id,
          email: adminData.email,
          role: adminData.role as "volunteer" | "admin" | "super_admin",
          status: adminData.status as "active" | "inactive" | "suspended",
          firstName: adminData.firstName,
          lastName: adminData.lastName,
        });
      } catch (error) {
        console.error("Error initializing admin user:", error);
        router.push("/login?next=/admin");
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAdminUser();
  }, [router, supabase]);

  // Handle navigation with role-based restrictions
  const handleNavigation = (view: AdminDashboardView) => {
    if (isLoading) return;

    const userRole = adminUser?.role;

    // Define role permissions - CORRECTED VERSION
    const rolePermissions = {
      volunteer: [
        "dashboard",
        "participants",
        "check-in",
        "settings",
        "profile",
      ],
      admin: [
        "dashboard",
        "participants",
        "check-in",
        "settings",
        "profile",
        // NOTE: "roles" removed - only super admin can manage roles
      ],
      super_admin: [
        "dashboard",
        "participants",
        "check-in",
        "roles", // Only super admin can access role management
        "admin-management",
        "audit-logs",
        "system-settings",
        "settings",
        "profile",
      ],
    };

    // Check if user has permission for this view
    if (userRole && !rolePermissions[userRole].includes(view)) {
      const roleDisplay =
        userRole === "volunteer"
          ? "Volunteer"
          : userRole === "admin"
            ? "Admin"
            : "Super Admin";
      alert(
        `Access denied. ${roleDisplay} privileges are insufficient for this section.`,
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setCurrentView(view);
      setIsLoading(false);
    }, 100);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        alert("Failed to logout. Please try again.");
        return;
      }

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render the current view component with role restrictions
  const renderCurrentView = () => {
    const userRole = adminUser?.role;

    switch (currentView) {
      case "participants":
        // All roles can view participants, with role-based permissions
        return (
          <ParticipantManagement
            userRole={userRole}
            readOnly={userRole === "volunteer"}
          />
        );

      case "check-in":
        // All staff roles can handle check-ins
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Event Check-in</h2>
            <p className="text-gray-600 mb-4">
              Manage participant check-ins during the event.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900">Checked In</h3>
                <p className="text-2xl font-bold text-green-600">--</p>
                <p className="text-sm text-green-700">Participants present</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">Registered</h3>
                <p className="text-2xl font-bold text-blue-600">--</p>
                <p className="text-sm text-blue-700">Total registrations</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900">Check-in Rate</h3>
                <p className="text-2xl font-bold text-yellow-600">--%</p>
                <p className="text-sm text-yellow-700">Attendance rate</p>
              </div>
            </div>

            <div
              className={`rounded-lg p-4 ${
                userRole === "volunteer" ? "bg-green-50" : "bg-blue-50"
              }`}
            >
              <p
                className={`text-sm ${
                  userRole === "volunteer" ? "text-green-700" : "text-blue-700"
                }`}
              >
                <strong>
                  {userRole === "volunteer"
                    ? "Volunteer Access:"
                    : userRole === "admin"
                      ? "Admin Access:"
                      : "Super Admin Access:"}
                </strong>
                {userRole === "volunteer"
                  ? " You can check participants in/out and view attendance data."
                  : " Full check-in management including bulk operations and reporting."}
              </p>
            </div>
          </div>
        );

      case "settings":
        return <SettingsPage />;

      case "roles":
        // ONLY super admin can access this - corrected logic
        return userRole === "super_admin" ? (
          <RoleManager showHeader={true} className="max-w-7xl mx-auto" />
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You need super admin privileges to manage roles and create admin
              accounts.
            </p>
          </div>
        );

      case "admin-management":
        return userRole === "super_admin" ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Admin Management</h2>
            <p className="text-gray-600 mb-4">
              Advanced admin account management and system oversight.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">Total Admins</h3>
                <p className="text-2xl font-bold text-blue-600">--</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900">Volunteers</h3>
                <p className="text-2xl font-bold text-green-600">--</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900">
                  Regular Admins
                </h3>
                <p className="text-2xl font-bold text-purple-600">--</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900">Active Accounts</h3>
                <p className="text-2xl font-bold text-red-600">--</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Super Admin Only:</strong> Advanced admin account
                management, system monitoring, and security oversight.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You need super admin privileges to access admin management.
            </p>
          </div>
        );

      case "audit-logs":
        return userRole === "super_admin" ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Audit Logs</h2>
            <p className="text-gray-600 mb-4">
              View system audit logs and admin activity history.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Recent Admin Actions</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Loading audit logs...</span>
                  <span className="text-xs text-gray-400">--</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Super Admin Only:</strong> Complete audit trail of all
                admin actions and system events.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You need super admin privileges to access audit logs.
            </p>
          </div>
        );

      case "system-settings":
        return userRole === "super_admin" ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">System Settings</h2>
            <p className="text-gray-600 mb-4">
              Configure system-wide settings and preferences.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Database Settings</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Manage database backup and maintenance.
                </p>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
                  Configure Database
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Event Settings</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Configure event-specific settings.
                </p>
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm">
                  Configure Event
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Security Settings</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Manage authentication and security policies.
                </p>
                <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">
                  Security Config
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Email Settings</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Configure email templates and notifications.
                </p>
                <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm">
                  Email Config
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Super Admin Only:</strong> These settings affect the
                entire system. Changes require careful consideration.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You need super admin privileges to access system settings.
            </p>
          </div>
        );

      case "profile":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              {userRole === "volunteer"
                ? "Volunteer"
                : userRole === "admin"
                  ? "Admin"
                  : "Super Admin"}{" "}
              Profile
            </h2>
            {adminUser && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="text-gray-900">{adminUser.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <p className="text-gray-900 capitalize">
                    {adminUser.role === "super_admin"
                      ? "Super Admin"
                      : adminUser.role === "admin"
                        ? "Admin"
                        : "Volunteer"}
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        adminUser.role === "super_admin"
                          ? "bg-red-100 text-red-800"
                          : adminUser.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {adminUser.role === "super_admin"
                        ? "Full Access"
                        : adminUser.role === "admin"
                          ? "Admin Access"
                          : "Volunteer Access"}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <p className="text-gray-900 capitalize">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        adminUser.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {adminUser.status}
                    </span>
                  </p>
                </div>

                {adminUser.firstName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <p className="text-gray-900">
                      {adminUser.firstName} {adminUser.lastName || ""}
                    </p>
                  </div>
                )}

                {/* Role-specific information */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Your Permissions</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {userRole === "volunteer" && (
                      <>
                        <li>• View participant information (read-only)</li>
                        <li>• Check participants in/out</li>
                        <li>• Access basic event statistics</li>
                        <li>• Update personal settings</li>
                      </>
                    )}
                    {userRole === "admin" && (
                      <>
                        <li>• Full participant management</li>
                        <li>• Bulk participant operations</li>
                        <li>• Access detailed event analytics</li>
                        <li>• Manage check-in systems</li>
                        <li>• Export participant data</li>
                      </>
                    )}
                    {userRole === "super_admin" && (
                      <>
                        <li>• Complete system administration</li>
                        <li>• Create and manage all admin accounts</li>
                        <li>• Access audit logs and system monitoring</li>
                        <li>• Configure system-wide settings</li>
                        <li>• Advanced security and backup management</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    Profile editing functionality coming soon. Use Settings to
                    update your password and preferences.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "dashboard":
      default:
        return <AdminDashboard className="" userRole={userRole} />;
    }
  };

  // Get the title for headers
  const getViewTitle = () => {
    const rolePrefix =
      adminUser?.role === "volunteer"
        ? "Volunteer"
        : adminUser?.role === "admin"
          ? "Admin"
          : "Super Admin";

    switch (currentView) {
      case "participants":
        return "Participant Management";
      case "check-in":
        return "Event Check-in";
      case "roles":
        return "Role Manager";
      case "admin-management":
        return "Admin Management";
      case "audit-logs":
        return "Audit Logs";
      case "system-settings":
        return "System Settings";
      case "settings":
        return "Settings";
      case "profile":
        return `${rolePrefix} Profile`;
      case "dashboard":
      default:
        return `${rolePrefix} Dashboard`;
    }
  };

  // Get view description for context
  const getViewDescription = () => {
    const userRole = adminUser?.role;

    switch (currentView) {
      case "participants":
        return userRole === "volunteer"
          ? "View participant information and assist with event support"
          : "Manage registrations, check-ins, and participant status";
      case "check-in":
        return "Manage participant check-ins during the event";
      case "roles":
        return "Create and manage admin and volunteer accounts";
      case "admin-management":
        return "Advanced admin account management and system oversight";
      case "audit-logs":
        return "View system audit logs and admin activity history";
      case "system-settings":
        return "Configure system-wide settings and preferences";
      case "settings":
        return "Configure your account preferences and settings";
      case "profile":
        return "Manage your profile information and view permissions";
      case "dashboard":
      default:
        return userRole === "volunteer"
          ? "Your volunteer dashboard with event information and check-in tools"
          : userRole === "admin"
            ? "Admin dashboard with participant management and analytics"
            : "Super admin dashboard with complete system oversight";
    }
  };

  // Show loading during initialization
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2 text-gray-600">Initializing dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if no admin user (will redirect)
  if (!adminUser) {
    return null;
  }

  // Single layout with role-aware sidebar
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Role-aware Sidebar */}
      <Sidebar
        userRole={adminUser.role}
        currentView={currentView}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        adminDetails={adminUser}
      />

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getViewTitle()}
              </h1>
              <p className="text-gray-600 mt-1">{getViewDescription()}</p>
            </div>

            {/* Role-based action buttons */}
            <div className="flex items-center space-x-3">
              {currentView === "participants" && (
                <button
                  className={`px-4 py-2 rounded-md transition-colors text-white ${
                    adminUser?.role === "volunteer"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {adminUser?.role === "volunteer"
                    ? "Quick Check-in"
                    : "Export Data"}
                </button>
              )}
              {currentView === "check-in" && (
                <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
                  Scan QR Code
                </button>
              )}
              {currentView === "roles" && adminUser?.role === "super_admin" && (
                <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
                  Add Admin
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">{renderCurrentView()}</div>
      </div>
    </div>
  );
}
