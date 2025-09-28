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

interface Participant {
  id: string;
  f_name?: string;
  l_name?: string;
  email?: string;
  status?: "confirmed" | "pending" | "waitlisted";
  checked_in?: boolean;
  university?: string;
  gender?: string;
  timestamp?: string;
  isAdmin?: boolean;
  adminRole?: "admin" | "super_admin" | "volunteer";
  adminStatus?: "active" | "inactive" | "suspended";
}

const columnHelper = createColumnHelper<Participant>();

interface ParticipantManagementProps {
  className?: string;
  userRole?: "volunteer" | "admin" | "super_admin";
  readOnly?: boolean;
}

export function ParticipantManagement({
  className = "",
  userRole = "admin",
  readOnly = false,
}: ParticipantManagementProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [removalModalOpen, setRemovalModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

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
      canCheckIn: true, // All roles can check people in
      canChangeStatus: !readOnly && !isVolunteer, // Only admins+ can change status
      canPromoteToAdmin: !readOnly && isAdmin, // Only admins can promote users to admin
      canRemoveAdmin: !readOnly && (isAdmin || isSuperAdmin), // Admins+ can remove admin privileges
    }),
    [readOnly, isVolunteer, isAdmin, isSuperAdmin],
  );

  // Update participant status (admin+ only)
  const updateStatus = useCallback(
    async (id: string, newStatus: string) => {
      if (!permissions.canChangeStatus) {
        AdminErrorHandler.showErrorToast(
          "You don't have permission to change participant status",
        );
        return;
      }

      try {
        const response = await fetch(`/api/participants/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setParticipants((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: newStatus as any } : p,
          ),
        );

        AdminErrorHandler.showSuccessToast(
          `Participant status updated to ${newStatus}`,
        );
      } catch (error) {
        console.error("Error updating status:", error);
        const errorMessage = AdminErrorHandler.handleApiError(error);
        AdminErrorHandler.showErrorToast(errorMessage);
      }
    },
    [permissions.canChangeStatus],
  );

  // Toggle check-in (all roles can do this)
  const toggleCheckIn = useCallback(
    async (id: string) => {
      if (!permissions.canCheckIn) {
        AdminErrorHandler.showErrorToast(
          "You don't have permission to check in participants",
        );
        return;
      }

      const participant = participants.find((p) => p.id === id);
      const newCheckedIn = !participant?.checked_in;

      try {
        const response = await fetch(`/api/participants/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkedIn: newCheckedIn }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setParticipants((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, checked_in: newCheckedIn } : p,
          ),
        );

        AdminErrorHandler.showSuccessToast(
          `Participant ${newCheckedIn ? "checked in" : "checked out"} successfully`,
        );
      } catch (error) {
        console.error("Error updating check-in:", error);
        const errorMessage = AdminErrorHandler.handleApiError(error);
        AdminErrorHandler.showErrorToast(errorMessage);
      }
    },
    [permissions.canCheckIn, participants],
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
    (participant: Participant) => {
      if (!permissions.canPromoteToAdmin) {
        AdminErrorHandler.showErrorToast(
          "You don't have permission to promote users to admin",
        );
        return;
      }
      setSelectedParticipant(participant);
      setPromotionModalOpen(true);
    },
    [permissions.canPromoteToAdmin],
  );

  // Remove admin privileges (admin+ only)
  const removeAdmin = useCallback(
    async (participantId: string) => {
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
            participantId,
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

        // Update participant data to reflect admin status change
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === participantId
              ? {
                  ...p,
                  isAdmin: false,
                  adminRole: undefined,
                  adminStatus: undefined,
                }
              : p,
          ),
        );
      } catch (error) {
        console.error("Error removing admin privileges:", error);
        const errorMessage = AdminErrorHandler.handleApiError(error);
        AdminErrorHandler.showErrorToast(errorMessage);
        throw error; // Re-throw to let the modal handle it
      }
    },
    [permissions.canRemoveAdmin],
  );

  // Handle opening removal modal
  const handleRemoveClick = useCallback(
    (participant: Participant) => {
      if (!permissions.canRemoveAdmin) {
        AdminErrorHandler.showErrorToast(
          "You don't have permission to remove admin privileges",
        );
        return;
      }
      setSelectedParticipant(participant);
      setRemovalModalOpen(true);
    },
    [permissions.canRemoveAdmin],
  );

  // Handle dropdown toggle
  const toggleDropdown = useCallback((participantId: string) => {
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(participantId)) {
        newSet.delete(participantId);
      } else {
        newSet.add(participantId);
      }
      return newSet;
    });
  }, []);

  // Handle status change and close dropdown
  const handleStatusChange = useCallback(
    (participantId: string, newStatus: string) => {
      updateStatus(participantId, newStatus);
      setOpenDropdowns((prev) => {
        const newSet = new Set(prev);
        newSet.delete(participantId);
        return newSet;
      });
    },
    [updateStatus],
  );

  // Column definitions for AdvancedDataTable
  const columns = useMemo<ColumnDef<Participant>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => `${row.f_name || ""} ${row.l_name || ""}`.trim(),
        header: ({ column }) => (
          <SortableHeader column={column}>Participant</SortableHeader>
        ),
        cell: ({ row }) => {
          const participant = row.original;
          return (
            <div>
              <div className="font-medium flex items-center space-x-2">
                <span>
                  {participant.f_name} {participant.l_name}
                </span>
                {participant.isAdmin && (
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 border-blue-200 text-xs rounded-full"
                  >
                    Admin
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {participant.email}
              </div>
            </div>
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
          const getStatusVariant = (status: string) => {
            switch (status) {
              case "confirmed":
                return "default";
              case "pending":
                return "secondary";
              case "waitlisted":
                return "destructive";
              default:
                return "outline";
            }
          };

          const getStatusColor = (status: string) => {
            switch (status) {
              case "confirmed":
                return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
              case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
              case "waitlisted":
                return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200";
              case "declined":
                return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
              case "denied":
                return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
              default:
                return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
            }
          };

          return (
            <Badge
              variant="outline"
              className={`rounded-xl ${getStatusColor(status)}`}
            >
              {status || "pending"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "checked_in",
        header: ({ column }) => (
          <SortableHeader column={column}>Check-in</SortableHeader>
        ),
        cell: ({ row }) => {
          const checkedIn = row.getValue("checked_in") as boolean;
          return (
            <Button
              variant={checkedIn ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCheckIn(row.original.id)}
              disabled={!permissions.canCheckIn}
              className={`rounded-full ${checkedIn ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              {checkedIn ? "Checked In" : "Check In"}
            </Button>
          );
        },
      },
      ...(permissions.canChangeStatus || permissions.canPromoteToAdmin
        ? [
            {
              id: "actions",
              header: "Actions",
              cell: ({ row }) => {
                const participant = row.original;
                return (
                  <div className="flex items-center space-x-2">
                    {permissions.canChangeStatus && (
                      <div className="relative status-dropdown-container">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDropdown(participant.id)}
                          className="w-36 h-8 text-sm rounded-full"
                        >
                          Change Status
                        </Button>
                        {openDropdowns.has(participant.id) && (
                          <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <div className="py-1">
                              <button
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                                onClick={() =>
                                  handleStatusChange(participant.id, "pending")
                                }
                              >
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span>Pending</span>
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                                onClick={() =>
                                  handleStatusChange(
                                    participant.id,
                                    "confirmed",
                                  )
                                }
                              >
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span>Confirmed</span>
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                                onClick={() =>
                                  handleStatusChange(
                                    participant.id,
                                    "waitlisted",
                                  )
                                }
                              >
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                <span>Waitlisted</span>
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                                onClick={() =>
                                  handleStatusChange(participant.id, "declined")
                                }
                              >
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span>Declined</span>
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                                onClick={() =>
                                  handleStatusChange(participant.id, "denied")
                                }
                              >
                                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                <span>Denied</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {permissions.canPromoteToAdmin && !participant.isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePromoteClick(participant)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Promote
                      </Button>
                    )}
                    {permissions.canRemoveAdmin && participant.isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveClick(participant)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Remove Admin
                      </Button>
                    )}
                  </div>
                );
              },
            } as ColumnDef<Participant>,
          ]
        : []),
    ],
    [
      permissions,
      toggleCheckIn,
      handlePromoteClick,
      handleRemoveClick,
      toggleDropdown,
      handleStatusChange,
      openDropdowns,
    ],
  );

  // Fetch participants
  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/participants");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Ensure data is an array
      let participantsData: Participant[] = [];
      if (Array.isArray(data)) {
        participantsData = data;
      } else if (data && Array.isArray(data.participants)) {
        // If the API returns an object with a participants array
        participantsData = data.participants;
      } else if (data && typeof data === "object") {
        // If it's an object, try to extract an array
        const possibleArray = Object.values(data).find((value) =>
          Array.isArray(value),
        );
        if (possibleArray) {
          participantsData = possibleArray as Participant[];
        } else {
          throw new Error(
            "API response does not contain a valid participants array",
          );
        }
      } else {
        throw new Error("Invalid data format received from API");
      }

      // Check admin status for all participants
      if (participantsData.length > 0) {
        try {
          const adminResponse = await fetch("/api/admin/check-admin-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              participantIds: participantsData.map((p) => p.id),
            }),
          });

          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            const adminMap = new Map();
            adminData.adminStatuses.forEach((status: any) => {
              adminMap.set(status.participantId, status);
            });

            // Merge admin status with participant data
            participantsData = participantsData.map((participant) => ({
              ...participant,
              ...adminMap.get(participant.id),
            }));
          }
        } catch (adminError) {
          console.warn("Failed to fetch admin status:", adminError);
          // Continue without admin status if it fails
        }
      }

      setParticipants(participantsData);
    } catch (error) {
      console.error("Error fetching participants:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch participants",
      );
      setParticipants([]); // Ensure participants is always an array
    } finally {
      setLoading(false);
    }
  };

  // Bulk update status (admin+ only)
  const bulkUpdateStatus = async (
    selectedParticipants: Participant[],
    newStatus: string,
  ) => {
    if (!permissions.canBulkEdit) {
      AdminErrorHandler.showErrorToast(
        "You don't have permission to bulk update participants",
      );
      return;
    }

    if (selectedParticipants.length === 0) return;

    const selectedParticipantIds = selectedParticipants.map((p) => p.id);

    try {
      const response = await fetch("/api/participants/bulk-update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantIds: selectedParticipantIds,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setParticipants((prev) =>
        prev.map((p) =>
          selectedParticipantIds.includes(p.id)
            ? { ...p, status: newStatus as any }
            : p,
        ),
      );

      AdminErrorHandler.showSuccessToast(
        `Successfully updated ${selectedParticipants.length} participant(s) to ${newStatus} status`,
      );
    } catch (error) {
      console.error("Error bulk updating:", error);
      const errorMessage = AdminErrorHandler.handleApiError(error);
      AdminErrorHandler.showErrorToast(errorMessage);
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
          getValue: (p: Participant) =>
            `${p.f_name || ""} ${p.l_name || ""}`.trim(),
        },
        {
          key: "email",
          header: "Email",
          getValue: (p: Participant) => p.email || "",
        },
        {
          key: "status",
          header: "Status",
          getValue: (p: Participant) => p.status || "pending",
        },
        {
          key: "checked_in",
          header: "Checked In",
          getValue: (p: Participant) => (p.checked_in ? "Yes" : "No"),
        },
        {
          key: "timestamp",
          header: "Registration Date",
          getValue: (p: Participant) =>
            p.timestamp ? new Date(p.timestamp).toLocaleDateString() : "N/A",
        },
      ];

      exportToCSV(participants, columns, generateFilename("participants"));
      AdminErrorHandler.showSuccessToast(
        "Participants data exported successfully",
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      AdminErrorHandler.showErrorToast("Failed to export participants data");
    }
  };

  // Statistics - ensure participants is always an array
  const stats = useMemo(() => {
    if (!Array.isArray(participants)) {
      return {
        total: 0,
        confirmed: 0,
        pending: 0,
        waitlisted: 0,
        checkedIn: 0,
      };
    }

    const total = participants.length;
    const confirmed = participants.filter(
      (p) => p.status === "confirmed",
    ).length;
    const pending = participants.filter((p) => p.status === "pending").length;
    const waitlisted = participants.filter(
      (p) => p.status === "waitlisted",
    ).length;
    const checkedIn = participants.filter((p) => p.checked_in).length;

    return { total, confirmed, pending, waitlisted, checkedIn };
  }, [participants]);

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
    fetchParticipants();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
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
  }, []);

  // Prepare bulk actions for AdvancedDataTable
  const bulkActions = permissions.canBulkEdit
    ? [
        {
          label: "Make Pending",
          onClick: (selectedParticipants: Participant[]) =>
            bulkUpdateStatus(selectedParticipants, "pending"),
          className: "bg-yellow-600 hover:bg-yellow-700",
        },
        {
          label: "Confirm All",
          onClick: (selectedParticipants: Participant[]) =>
            bulkUpdateStatus(selectedParticipants, "confirmed"),
          className: "bg-green-600 hover:bg-green-700",
        },
        {
          label: "Waitlist All",
          onClick: (selectedParticipants: Participant[]) =>
            bulkUpdateStatus(selectedParticipants, "waitlisted"),
          className: "bg-orange-600 hover:bg-orange-700",
        },
      ]
    : [];

  // Prepare filters for AdvancedDataTable
  const filters = useMemo(() => {
    return generateFilters(participants, [
      {
        column: "status",
        getValue: (p) => p.status,
        placeholder: "All Status",
      },
      {
        column: "checked_in",
        getValue: (p) => (p.checked_in ? "checked_in" : "not_checked_in"),
        getLabel: (value) =>
          value === "checked_in" ? "Checked In" : "Not Checked In",
        placeholder: "Check-in Status",
      },
    ]);
  }, [participants]);

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading participants...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-500 text-center">
            <p className="text-lg font-semibold">Error loading participants</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={fetchParticipants}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard title="Total" value={stats.total} icon={Users} />
        <StatsCard title="Confirmed" value={stats.confirmed} icon={Users} />
        <StatsCard title="Pending" value={stats.pending} icon={Users} />
        <StatsCard title="Waitlisted" value={stats.waitlisted} icon={Users} />
        <StatsCard
          title="Checked In"
          value={stats.checkedIn}
          icon={UserCheck}
        />
      </div>

      {/* Advanced Data Table */}
      <AdvancedDataTable
        data={participants}
        columns={columns}
        loading={loading}
        emptyMessage="No participants found."
        onRefresh={fetchParticipants}
        onExport={permissions.canExport ? exportData : undefined}
        searchPlaceholder="Search participants..."
        searchColumn="name"
        filters={filters}
        bulkActions={bulkActions}
        enableSelection={permissions.canBulkEdit}
        enablePagination={true}
        pageSizeOptions={[10, 20, 30, 40, 50]}
      />

      {/* Admin Promotion Modal */}
      <AdminPromotionModal
        isOpen={promotionModalOpen}
        onClose={() => {
          setPromotionModalOpen(false);
          setSelectedParticipant(null);
        }}
        participant={selectedParticipant}
        onPromote={promoteToAdmin}
      />

      {/* Admin Removal Modal */}
      <AdminRemovalModal
        isOpen={removalModalOpen}
        onClose={() => {
          setRemovalModalOpen(false);
          setSelectedParticipant(null);
        }}
        participant={selectedParticipant}
        onRemove={removeAdmin}
      />
    </div>
  );
}
