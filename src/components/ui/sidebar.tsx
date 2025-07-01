"use client";

{
  /* Conditional Side Bar compojent based on the user roel (user, admin, superadmin) */
}

import React from "react";
import {
  Home,
  Users,
  UserCog,
  Settings,
  User,
  Shield,
  FileText,
  Database,
  LogOut,
} from "lucide-react";

export interface SidebarProps {
  userRole: "admin" | "super_admin" | "user";
  currentView: string;
  onNavigate?: (view: any) => void;
  onLogout?: () => void;
  adminDetails?: {
    email: string;
    firstName?: string;
    lastName?: string;
    role: "admin" | "super_admin";
  };
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: "confirmed" | "pending" | "waitlisted";
  };
}

interface SidebarItemProps {
  view: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
  superAdminOnly?: boolean;
  userRole: "admin" | "super_admin" | "user";
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  view,
  label,
  icon: Icon,
  isActive,
  onClick,
  superAdminOnly = false,
  userRole,
}) => {
  // Don't render super admin only items for regular admins or users
  if (superAdminOnly && userRole !== "super_admin") {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
          : "text-gray-700"
      } ${superAdminOnly ? "bg-red-50 hover:bg-red-100" : ""}`}
    >
      <Icon
        className={`w-5 h-5 mr-3 ${isActive ? "text-blue-600" : "text-gray-500"} ${superAdminOnly ? "text-red-600" : ""}`}
      />
      <span className="font-medium">
        {label}
        {superAdminOnly && (
          <span className="ml-2 text-xs text-red-600">(Super Admin)</span>
        )}
      </span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  currentView,
  onNavigate,
  onLogout,
  adminDetails,
  user,
}) => {
  const isSuperAdmin = userRole === "super_admin";
  const isAdmin = userRole === "admin" || userRole === "super_admin";
  const isUser = userRole === "user";

  // User Dashboard Sidebar
  if (isUser) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* User Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <User className="w-8 h-8 mr-3 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
              {user && (
                <p className="text-sm text-gray-500">
                  {user.firstName} {user.lastName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* User Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-1">
            <SidebarItem
              view="dashboard"
              label="Dashboard"
              icon={Home}
              isActive={currentView === "dashboard"}
              onClick={() => onNavigate?.("dashboard")}
              userRole={userRole}
            />

            <SidebarItem
              view="profile"
              label="Profile"
              icon={User}
              isActive={currentView === "profile"}
              onClick={() => onNavigate?.("profile")}
              userRole={userRole}
            />

            <SidebarItem
              view="settings"
              label="Settings"
              icon={Settings}
              isActive={currentView === "settings"}
              onClick={() => onNavigate?.("settings")}
              userRole={userRole}
            />
          </div>
        </nav>

        {/* User Status Display */}
        {user && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-500 mb-1">Registration Status</p>
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full ${
                  user.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : user.status === "pending"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>
          </div>
        )}

        {/* User Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-left hover:bg-red-50 text-red-600 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // Admin/Super Admin Dashboard Sidebar
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Admin Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <Shield
            className={`w-8 h-8 mr-3 ${isSuperAdmin ? "text-red-600" : "text-blue-600"}`}
          />
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isSuperAdmin ? "Super Admin" : "Admin"} Panel
            </h2>
            {adminDetails && (
              <p className="text-sm text-gray-500">
                {adminDetails.firstName || adminDetails.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {/* Standard Admin Items */}
          <SidebarItem
            view="dashboard"
            label="Dashboard"
            icon={Home}
            isActive={currentView === "dashboard"}
            onClick={() => onNavigate?.("dashboard")}
            userRole={userRole}
          />

          <SidebarItem
            view="participants"
            label="Participants"
            icon={Users}
            isActive={currentView === "participants"}
            onClick={() => onNavigate?.("participants")}
            userRole={userRole}
          />

          <SidebarItem
            view="roles"
            label="Role Manager"
            icon={UserCog}
            isActive={currentView === "roles"}
            onClick={() => onNavigate?.("roles")}
            userRole={userRole}
          />

          {/* Divider for Super Admin Section */}
          {isSuperAdmin && (
            <div className="py-2">
              <div className="border-t border-red-200"></div>
              <p className="text-xs text-red-600 font-semibold mt-2 px-2">
                SUPER ADMIN ONLY
              </p>
            </div>
          )}

          {/* Super Admin Only Items */}
          <SidebarItem
            view="admin-management"
            label="Admin Management"
            icon={Shield}
            isActive={currentView === "admin-management"}
            onClick={() => onNavigate?.("admin-management")}
            superAdminOnly={true}
            userRole={userRole}
          />

          <SidebarItem
            view="audit-logs"
            label="Audit Logs"
            icon={FileText}
            isActive={currentView === "audit-logs"}
            onClick={() => onNavigate?.("audit-logs")}
            superAdminOnly={true}
            userRole={userRole}
          />

          <SidebarItem
            view="system-settings"
            label="System Settings"
            icon={Database}
            isActive={currentView === "system-settings"}
            onClick={() => onNavigate?.("system-settings")}
            superAdminOnly={true}
            userRole={userRole}
          />

          {/* Divider */}
          <div className="py-2">
            <div className="border-t border-gray-200"></div>
          </div>

          {/* Settings & Profile */}
          <SidebarItem
            view="settings"
            label="Settings"
            icon={Settings}
            isActive={currentView === "settings"}
            onClick={() => onNavigate?.("settings")}
            userRole={userRole}
          />

          <SidebarItem
            view="profile"
            label="Profile"
            icon={User}
            isActive={currentView === "profile"}
            onClick={() => onNavigate?.("profile")}
            userRole={userRole}
          />
        </div>
      </nav>

      {/* Admin Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 text-left hover:bg-red-50 text-red-600 rounded-md transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
