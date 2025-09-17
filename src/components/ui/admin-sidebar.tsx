"use client";

{
  /* Conditional Side Bar component based on the user role (volunteer, admin, super_admin) */
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
  UserCheck,
  Eye,
} from "lucide-react";

export interface SidebarProps {
  userRole: "admin" | "super_admin" | "volunteer";
  currentView: string;
  onNavigate?: (view: any) => void;
  onLogout?: () => void;
  adminDetails?: {
    email: string;
    firstName?: string;
    lastName?: string;
    role: "admin" | "super_admin" | "volunteer";
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
  adminOnly?: boolean; // New prop for admin+ only features
  volunteerAccess?: boolean; // New prop for volunteer accessible features
  userRole: "admin" | "super_admin" | "volunteer" | "user";
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  view,
  label,
  icon: Icon,
  isActive,
  onClick,
  superAdminOnly = false,
  adminOnly = false,
  volunteerAccess = true,
  userRole,
}) => {
  // Don't render super admin only items for non-super admins
  if (superAdminOnly && userRole !== "super_admin") {
    return null;
  }

  // Don't render admin only items for volunteers
  if (adminOnly && userRole === "volunteer") {
    return null;
  }

  // Don't render volunteer inaccessible items for volunteers
  if (!volunteerAccess && userRole === "volunteer") {
    return null;
  }

  // Get styling based on role and restrictions
  const getItemStyling = () => {
    if (superAdminOnly) {
      return "bg-red-50 hover:bg-red-100";
    }
    if (adminOnly && userRole === "admin") {
      return "bg-blue-50 hover:bg-blue-100";
    }
    if (userRole === "volunteer") {
      return "bg-green-50 hover:bg-green-100";
    }
    return "";
  };

  const getIconColor = () => {
    if (isActive) {
      if (superAdminOnly) return "text-red-600";
      if (userRole === "volunteer") return "text-green-600";
      return "text-blue-600";
    }
    if (superAdminOnly) return "text-red-600";
    if (userRole === "volunteer") return "text-green-500";
    return "text-gray-500";
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
        isActive
          ? `bg-blue-50 text-blue-600 border-r-2 ${
              superAdminOnly
                ? "border-red-600 bg-red-50 text-red-600"
                : userRole === "volunteer"
                  ? "border-green-600 bg-green-50 text-green-600"
                  : "border-blue-600"
            }`
          : "text-gray-700"
      } ${getItemStyling()}`}
    >
      <Icon className={`w-5 h-5 mr-3 ${getIconColor()}`} />
      <span className="font-medium">
        {label}
        {superAdminOnly && (
          <span className="ml-2 text-xs text-red-600">(Super Admin)</span>
        )}
        {adminOnly && userRole !== "super_admin" && (
          <span className="ml-2 text-xs text-blue-600">(Admin+)</span>
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
  const isVolunteer = userRole === "volunteer";

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Admin/Volunteer Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          {isVolunteer ? (
            <Users className="w-8 h-8 mr-3 text-green-600" />
          ) : (
            <Shield
              className={`w-8 h-8 mr-3 ${isSuperAdmin ? "text-red-600" : "text-blue-600"}`}
            />
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isSuperAdmin
                ? "Super Admin"
                : isVolunteer
                  ? "Volunteer"
                  : "Admin"}{" "}
              Panel
            </h2>
            {adminDetails && (
              <p className="text-sm text-gray-500">
                {adminDetails.firstName || adminDetails.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Admin/Volunteer Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {/* Standard Items Available to All Staff */}
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
            view="check-in"
            label="Check-in"
            icon={UserCheck}
            isActive={currentView === "check-in"}
            onClick={() => onNavigate?.("check-in")}
            userRole={userRole}
          />

          {/* Admin+ Only Features */}
          {!isVolunteer && (
            <>
              <SidebarItem
                view="roles"
                label="Role Manager"
                icon={UserCog}
                isActive={currentView === "roles"}
                onClick={() => onNavigate?.("roles")}
                adminOnly={true}
                userRole={userRole}
              />
            </>
          )}

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

          {/* Settings & Profile - Available to All */}
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

      {/* Role-based Access Indicator */}
      <div className="p-4 border-t border-gray-200">
        <div
          className={`rounded-lg p-3 mb-3 ${
            isVolunteer
              ? "bg-green-50"
              : isSuperAdmin
                ? "bg-red-50"
                : "bg-blue-50"
          }`}
        >
          <div className="flex items-center">
            {isVolunteer ? (
              <Eye className="w-4 h-4 mr-2 text-green-600" />
            ) : isSuperAdmin ? (
              <Shield className="w-4 h-4 mr-2 text-red-600" />
            ) : (
              <Shield className="w-4 h-4 mr-2 text-blue-600" />
            )}
            <div>
              <p
                className={`text-xs font-medium ${
                  isVolunteer
                    ? "text-green-900"
                    : isSuperAdmin
                      ? "text-red-900"
                      : "text-blue-900"
                }`}
              >
                {isVolunteer
                  ? "Volunteer Access"
                  : isSuperAdmin
                    ? "Super Admin Access"
                    : "Admin Access"}
              </p>
              <p
                className={`text-xs ${
                  isVolunteer
                    ? "text-green-700"
                    : isSuperAdmin
                      ? "text-red-700"
                      : "text-blue-700"
                }`}
              >
                {isVolunteer
                  ? "Check-ins & support"
                  : isSuperAdmin
                    ? "Full system control"
                    : "Participant management"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
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
