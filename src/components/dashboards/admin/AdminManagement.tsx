"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Download,
  RefreshCw,
  UserCheck,
  Users,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserPlus,
  UserMinus,
  Shield,
} from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboards/shared/ui/StatsCard";
import {
  PageHeader,
  ActionButton,
} from "@/components/dashboards/shared/utils/PageHeader";
import { AdvancedDataTable } from "@/components/dashboards/shared/ui/AdvancedDataTable";
import { SortableHeader } from "@/components/dashboards/shared/utils/SortableHeader";
import { generateFilters } from "@/components/dashboards/shared/utils/FilterUtils";
import {
  exportToCSV,
  generateFilename,
} from "@/components/dashboards/shared/utils/ExportUtils";
import { AdminErrorHandler } from "@/utils/admin/errorHandler";
import { AdminPromotionModal, AdminPromotionData } from "./AdminPromotionModal";
import { AdminRemovalModal } from "./AdminRemovalModal";

interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "super_admin" | "volunteer";
  status: "active" | "inactive" | "suspended";
  firstName?: string;
  lastName?: string;
  isAdminOnly?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastSignInAt?: string;
  emailConfirmedAt?: string;
}

const columnHelper = createColumnHelper<AdminUser>();

interface AdminManagementProps {
  className?: string;
  userRole?: "volunteer" | "admin" | "super_admin";
  readOnly?: boolean;
}

export function AdminManagement({
  className = "",
  userRole = "admin",
  readOnly = false,
}: AdminManagementProps) {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [removalModalOpen, setRemovalModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [roleModal, setRoleModal] = useState<{
    open: boolean;
    mode: "remove" | "role";
  }>({ open: false, mode: "remove" });

  // Role-based permissions
  const isVolunteer = userRole === "volunteer";
  const isAdmin = userRole === "admin";
  const isSuperAdmin = userRole === "super_admin";

  // Define what each role can do
  const permissions = useMemo(
    () => ({
      canEdit: !readOnly && !isVolunteer, // Admins and super admins can edit
      canBulkEdit: (isAdmin || isSuperAdmin) && !readOnly, // Only admins+ can bulk edit
      canExport: !isVolunteer || isSuperAdmin, // Volunteers cannot export, unless super admin
      canChangeStatus: !readOnly && !isVolunteer, // Only admins+ can change status
      canPromoteToAdmin: !readOnly && isAdmin, // Only admins can promote users to admin
      canRemoveAdmin: !readOnly && (isAdmin || isSuperAdmin), // Admins+ can remove admin privileges
    }),
    [readOnly, isVolunteer, isAdmin, isSuperAdmin],
  );

  // Update admin status (admin+ only)
  const updateStatus = useCallback(
    async (id: string, newStatus: string) => {
      if (!permissions.canChangeStatus) {
        AdminErrorHandler.showErrorToast(
          "You don't have permission to change admin status",
        );
        return;
      }

      try {
        const response = await fetch(`/api/admin/admins/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setAdminUsers((prev) =>
          prev.map((admin) =>
            admin.id === id ? { ...admin, status: newStatus as any } : admin,
          ),
        );

        AdminErrorHandler.showSuccessToast(
          `Admin status updated to ${newStatus}`,
        );
      } catch (error) {
        console.error("Error updating status:", error);
        const errorMessage = AdminErrorHandler.handleApiError(error);
        AdminErrorHandler.showErrorToast(errorMessage);
      }
    },
    [permissions.canChangeStatus],
  );

  // Promote user to admin (admin+ only)
  const promoteToAdmin = useCallback(
    async (participantId: string, adminData: AdminPromotionData) => {
      if (!permissions.canPromoteToAdmin) {
        AdminErrorHandler.showErrorToast(
          "You don't have permission to promote users to admin",
        );
        return;
      }

      try {
        const response = await fetch("/api/admin/promote-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantId,
            adminData,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        const result = await response.json();
        AdminErrorHandler.showSuccessToast(
          `Successfully promoted ${adminData.fName} ${adminData.lName} to ${adminData.role}`,
        );
      } catch (error) {
        console.error("Error promoting user to admin:", error);
        const errorMessage = AdminErrorHandler.handleApiError(error);
        AdminErrorHandler.showErrorToast(errorMessage);
        throw error; // Re-throw to let the modal handle it
      }
    },
    [permissions.canPromoteToAdmin],
  );

  // Handle opening promotion modal
  const handlePromoteClick = useCallback(
    (admin: AdminUser) => {
      if (!permissions.canPromoteToAdmin) {
        AdminErrorHandler.showErrorToast(
          "You don't have permission to promote users to admin",
        );
        return;
      }
      setSelectedAdmin(admin);
      setPromotionModalOpen(true);
    },
    [permissions.canPromoteToAdmin],
  );

  // Remove admin privileges (admin+ only)
  const removeAdmin = useCallback(
    async (adminId: string) => {
      if (!permissions.canRemoveAdmin) {
        AdminErrorHandler.showErrorToast(
          "You don't have permission to remove admin privileges",
        );
        return;
      }

      try {
        const response = await fetch("/api/admin/remove-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantId: adminId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        const result = await response.json();
        AdminErrorHandler.showSuccessToast(
          "Admin privileges removed successfully",
        );

        // Update admin data to reflect removal
        setAdminUsers((prev) => prev.filter((admin) => admin.id !== adminId));
      } catch (error) {
        console.error("Error removing admin privileges:", error);
        const errorMessage = AdminErrorHandler.handleApiError(error);
        AdminErrorHandler.showErrorToast(errorMessage);
        throw error; // Re-throw to let the modal handle it
      }
    },
    [permissions.canRemoveAdmin],
  );

  // Change admin role (admin+ only)
  const changeAdminRole = useCallback(
    async (adminId: string, newRole: "admin" | "super_admin" | "volunteer") => {
      if (!permissions.canRemoveAdmin) {
        AdminErrorHandler.showErrorToast(
          "You don't have permission to change admin role",
        );
        return;
      }

      try {
        const response = await fetch(`/api/admin/admins/${adminId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        setAdminUsers((prev) =>
          prev.map((a) => (a.id === adminId ? { ...a, role: newRole } : a)),
        );

        AdminErrorHandler.showSuccessToast(`Admin role updated to ${newRole}`);
      } catch (error) {
        console.error("Error updating admin role:", error);
        const errorMessage = AdminErrorHandler.handleApiError(error);
        AdminErrorHandler.showErrorToast(errorMessage);
        throw error;
      }
    },
    [permissions.canRemoveAdmin],
  );

  // Handle opening removal modal
  const handleRemoveClick = useCallback(
    (admin: AdminUser) => {
      if (!permissions.canRemoveAdmin) {
        AdminErrorHandler.showErrorToast(
          "You don't have permission to remove admin privileges",
        );
        return;
      }
      setSelectedAdmin(admin);
      setRoleModal({ open: true, mode: "role" });
    },
    [permissions.canRemoveAdmin],
  );

  // Handle dropdown toggle
  const toggleDropdown = useCallback((adminId: string) => {
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(adminId)) {
        newSet.delete(adminId);
      } else {
        newSet.add(adminId);
      }
      return newSet;
    });
  }, []);

  // Handle status change and close dropdown
  const handleStatusChange = useCallback(
    (adminId: string, newStatus: string) => {
      updateStatus(adminId, newStatus);
      setOpenDropdowns((prev) => {
        const newSet = new Set(prev);
        newSet.delete(adminId);
        return newSet;
      });
    },
    [updateStatus],
  );

  // Column definitions for AdvancedDataTable
  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) =>
          `${row.firstName || ""} ${row.lastName || ""}`.trim(),
        header: ({ column }) => (
          <SortableHeader column={column}>Admin</SortableHeader>
        ),
        cell: ({ row }) => {
          const admin = row.original;
          return (
            <div>
              <div className="font-medium">
                <span>
                  {admin.firstName} {admin.lastName}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">{admin.email}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <SortableHeader column={column}>Role</SortableHeader>
        ),
        cell: ({ row }) => {
          const role = row.getValue("role") as string;
          const getRoleColor = (role: string) => {
            switch (role) {
              case "super_admin":
                return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200";
              case "admin":
                return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
              case "volunteer":
                return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
              default:
                return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
            }
          };

          return (
            <Badge
              variant="outline"
              className={`rounded-full ${getRoleColor(role)}`}
            >
              {role === "super_admin" ? "Super Admin" : role}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column}>Status</SortableHeader>
        ),
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const getStatusColor = (status: string) => {
            switch (status) {
              case "active":
                return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
              case "inactive":
                return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
              case "suspended":
                return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
              default:
                return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
            }
          };

          return (
            <Badge
              variant="outline"
              className={`rounded-full ${getStatusColor(status)}`}
            >
              {status || "active"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "lastSignInAt",
        header: ({ column }) => (
          <SortableHeader column={column}>Last Sign In</SortableHeader>
        ),
        cell: ({ row }) => {
          const lastSignIn = row.getValue("lastSignInAt") as string;
          return (
            <div className="text-sm">
              {lastSignIn ? new Date(lastSignIn).toLocaleDateString() : "Never"}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <SortableHeader column={column}>Created</SortableHeader>
        ),
        cell: ({ row }) => {
          const createdAt = row.getValue("createdAt") as string;
          return (
            <div className="text-sm">
              {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
            </div>
          );
        },
      },
      ...(permissions.canChangeStatus || permissions.canRemoveAdmin
        ? [
            {
              id: "actions",
              header: "Actions",
              cell: ({ row }) => {
                const admin = row.original;
                return (
                  <div className="flex items-center space-x-2">
                    {permissions.canChangeStatus && (
                      <div className="relative status-dropdown-container">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDropdown(admin.id)}
                          className="w-36 h-8 text-sm rounded-full"
                        >
                          Change Status
                        </Button>
                        {openDropdowns.has(admin.id) && (
                          <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <div className="py-1">
                              <button
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                                onClick={() =>
                                  handleStatusChange(admin.id, "active")
                                }
                              >
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span>Active</span>
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                                onClick={() =>
                                  handleStatusChange(admin.id, "inactive")
                                }
                              >
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span>Inactive</span>
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                                onClick={() =>
                                  handleStatusChange(admin.id, "suspended")
                                }
                              >
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span>Suspended</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {permissions.canRemoveAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveClick(admin)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Change Role
                      </Button>
                    )}
                  </div>
                );
              },
            } as ColumnDef<AdminUser>,
          ]
        : []),
    ],
    [
      permissions,
      handleRemoveClick,
      toggleDropdown,
      handleStatusChange,
      openDropdowns,
    ],
  );

  // Fetch admin users
  const fetchAdminUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/admins");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Ensure data is an array
      let adminUsersData: AdminUser[] = [];
      if (Array.isArray(data.admins)) {
        adminUsersData = data.admins;
      } else {
        throw new Error("Invalid data format received from API");
      }

      setAdminUsers(adminUsersData);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch admin users",
      );
      setAdminUsers([]); // Ensure adminUsers is always an array
    } finally {
      setLoading(false);
    }
  };

  // Export data (admin+ only)
  const exportData = () => {
    if (!permissions.canExport) {
      AdminErrorHandler.showErrorToast(
        "You don't have permission to export data",
      );
      return;
    }

    try {
      const columns = [
        {
          key: "name",
          header: "Name",
          getValue: (a: AdminUser) =>
            `${a.firstName || ""} ${a.lastName || ""}`.trim(),
        },
        {
          key: "email",
          header: "Email",
          getValue: (a: AdminUser) => a.email || "",
        },
        {
          key: "role",
          header: "Role",
          getValue: (a: AdminUser) => a.role || "admin",
        },
        {
          key: "status",
          header: "Status",
          getValue: (a: AdminUser) => a.status || "active",
        },
        {
          key: "lastSignInAt",
          header: "Last Sign In",
          getValue: (a: AdminUser) =>
            a.lastSignInAt
              ? new Date(a.lastSignInAt).toLocaleDateString()
              : "Never",
        },
        {
          key: "createdAt",
          header: "Created",
          getValue: (a: AdminUser) =>
            a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "N/A",
        },
      ];

      exportToCSV(adminUsers, columns, generateFilename("admin-users"));
      AdminErrorHandler.showSuccessToast(
        "Admin users data exported successfully",
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      AdminErrorHandler.showErrorToast("Failed to export admin users data");
    }
  };

  // Statistics - ensure adminUsers is always an array
  const stats = useMemo(() => {
    if (!Array.isArray(adminUsers)) {
      return {
        total: 0,
        superAdmins: 0,
        admins: 0,
        volunteers: 0,
        active: 0,
      };
    }

    const total = adminUsers.length;
    const superAdmins = adminUsers.filter(
      (a) => a.role === "super_admin",
    ).length;
    const admins = adminUsers.filter((a) => a.role === "admin").length;
    const volunteers = adminUsers.filter((a) => a.role === "volunteer").length;
    const active = adminUsers.filter((a) => a.status === "active").length;

    return { total, superAdmins, admins, volunteers, active };
  }, [adminUsers]);

  const getRoleDisplay = () => {
    switch (userRole) {
      case "volunteer":
        return "Volunteer";
      case "admin":
        return "Admin";
      case "super_admin":
        return "Super Admin";
      default:
        return "User";
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    // Only attach the listener when any dropdown is open
    if (openDropdowns.size === 0) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".status-dropdown-container")) {
        setOpenDropdowns(new Set());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdowns.size]);

  // Prepare filters for AdvancedDataTable
  const filters = useMemo(() => {
    return generateFilters(adminUsers, [
      {
        column: "role",
        getValue: (a) => a.role,
        placeholder: "All Roles",
      },
      {
        column: "status",
        getValue: (a) => a.status,
        placeholder: "All Status",
      },
    ]);
  }, [adminUsers]);

  if (loading) {
    return (
      <div className={`${className}`} data-testid="loading">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading admin users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-500 text-center" data-testid="error-message">
            <p className="text-lg font-semibold">Error loading admin users</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={fetchAdminUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} data-testid="admin-management">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard
          title="Total"
          value={stats.total}
          icon={Shield}
          data-testid="stats-card"
        />
        <StatsCard
          title="Super Admins"
          value={stats.superAdmins}
          icon={Shield}
          data-testid="stats-card"
        />
        <StatsCard
          title="Admins"
          value={stats.admins}
          icon={Users}
          data-testid="stats-card"
        />
        <StatsCard
          title="Volunteers"
          value={stats.volunteers}
          icon={UserCheck}
          data-testid="stats-card"
        />
        <StatsCard
          title="Active"
          value={stats.active}
          icon={UserCheck}
          data-testid="stats-card"
        />
      </div>

      {/* Advanced Data Table */}
      <AdvancedDataTable
        data={adminUsers}
        columns={columns}
        loading={loading}
        emptyMessage="No admin users found."
        onRefresh={fetchAdminUsers}
        onExport={permissions.canExport ? exportData : undefined}
        searchPlaceholder="Search admin users..."
        searchColumn="name"
        filters={filters}
        enableSelection={false}
        enablePagination={true}
        pageSizeOptions={[10, 20, 30, 40, 50]}
      />

      {/* Admin Promotion Modal */}
      <AdminPromotionModal
        isOpen={promotionModalOpen}
        onClose={() => {
          setPromotionModalOpen(false);
          setSelectedAdmin(null);
        }}
        participant={selectedAdmin}
        onPromote={promoteToAdmin}
      />

      {/* Admin Removal Modal */}
      <AdminRemovalModal
        isOpen={roleModal.open}
        onClose={() => {
          setRoleModal({ open: false, mode: "role" });
          setSelectedAdmin(null);
        }}
        participant={selectedAdmin}
        onRemove={removeAdmin}
        onChangeRole={changeAdminRole}
        mode={roleModal.mode}
      />
    </div>
  );
}
