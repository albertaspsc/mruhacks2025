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
    }),
    [readOnly, isVolunteer, isAdmin, isSuperAdmin],
  );

  // Update participant status (admin+ only)
  const updateStatus = useCallback(
    async (id: string, newStatus: string) => {
      if (!permissions.canChangeStatus) {
        alert("You don't have permission to change participant status");
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
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update participant status");
      }
    },
    [permissions.canChangeStatus],
  );

  // Toggle check-in (all roles can do this)
  const toggleCheckIn = useCallback(
    async (id: string) => {
      if (!permissions.canCheckIn) {
        alert("You don't have permission to check in participants");
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
      } catch (error) {
        console.error("Error updating check-in:", error);
        alert("Failed to update check-in status");
      }
    },
    [permissions.canCheckIn, participants],
  );

  // Column definitions for AdvancedDataTable
  const columns = useMemo<ColumnDef<Participant>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableHeader column={column}>Participant</SortableHeader>
        ),
        cell: ({ row }) => {
          const participant = row.original;
          return (
            <div>
              <div className="font-medium">
                {participant.f_name} {participant.l_name}
              </div>
              <div className="text-sm text-muted-foreground">
                {participant.email}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "university",
        header: "University",
        cell: ({ row }) => row.getValue("university") || "N/A",
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => {
          const gender = row.getValue("gender") as string;
          return gender
            ? gender.charAt(0).toUpperCase() + gender.slice(1)
            : "Not specified";
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
          return (
            <Badge variant={getStatusVariant(status)}>
              {status || "pending"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "checked_in",
        header: "Check-in",
        cell: ({ row }) => {
          const checkedIn = row.getValue("checked_in") as boolean;
          return (
            <Button
              variant={checkedIn ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCheckIn(row.original.id)}
              disabled={!permissions.canCheckIn}
              className={checkedIn ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {checkedIn ? "Checked In" : "Check In"}
            </Button>
          );
        },
      },
      ...(permissions.canChangeStatus
        ? [
            {
              id: "actions",
              header: "Actions",
              cell: ({ row }) => {
                const participant = row.original;
                return (
                  <Select
                    value={participant.status || "pending"}
                    onValueChange={(value) =>
                      updateStatus(participant.id, value)
                    }
                    disabled={!permissions.canChangeStatus}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="waitlisted">Waitlisted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                );
              },
            } as ColumnDef<Participant>,
          ]
        : []),
    ],
    [permissions, toggleCheckIn, updateStatus],
  );

  // Get unique gender values for filter dropdown
  const availableGenders = useMemo(() => {
    if (!Array.isArray(participants)) return [];

    const genders = participants
      .map((p) => p.gender)
      .filter(Boolean) // Remove null/undefined values
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
      .sort(); // Sort alphabetically

    return genders;
  }, [participants]);

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
      if (Array.isArray(data)) {
        setParticipants(data);
      } else if (data && Array.isArray(data.participants)) {
        // If the API returns an object with a participants array
        setParticipants(data.participants);
      } else if (data && typeof data === "object") {
        // If it's an object, try to extract an array
        const possibleArray = Object.values(data).find((value) =>
          Array.isArray(value),
        );
        if (possibleArray) {
          setParticipants(possibleArray as Participant[]);
        } else {
          throw new Error(
            "API response does not contain a valid participants array",
          );
        }
      } else {
        throw new Error("Invalid data format received from API");
      }
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
      alert("You don't have permission to bulk update participants");
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
    } catch (error) {
      console.error("Error bulk updating:", error);
      alert("Failed to bulk update participants");
    }
  };

  // Export data (admin+ only)
  const exportData = () => {
    if (!permissions.canExport) {
      alert("You don't have permission to export data");
      return;
    }

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
        key: "university",
        header: "University",
        getValue: (p: Participant) => p.university || "N/A",
      },
      {
        key: "gender",
        header: "Gender",
        getValue: (p: Participant) => p.gender || "Not specified",
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
        genderStats: {},
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

    // Calculate gender statistics
    const genderStats = participants.reduce(
      (acc, participant) => {
        const gender = participant.gender || "Not specified";
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, confirmed, pending, waitlisted, checkedIn, genderStats };
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
        column: "gender",
        getValue: (p) => p.gender,
        getLabel: (value) => value.charAt(0).toUpperCase() + value.slice(1),
        placeholder: "All Genders",
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Role-based access indicator */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex items-center">
          {isVolunteer ? (
            <Eye className="h-5 w-5 text-blue-400" />
          ) : (
            <Users className="h-5 w-5 text-blue-400" />
          )}
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>{getRoleDisplay()} Access:</strong>{" "}
              {isVolunteer
                ? "You can view participant information and check people in/out."
                : readOnly
                  ? "Read-only access to participant management."
                  : "Full participant management access including status changes and bulk operations."}
            </p>
          </div>
        </div>
      </div>

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

      {/* Gender Statistics */}
      {Object.keys(stats.genderStats).length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Gender Distribution
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(stats.genderStats).map(([gender, count]) => (
              <div key={gender} className="text-center">
                <p className="text-sm font-medium text-gray-600 capitalize">
                  {gender}
                </p>
                <p className="text-lg font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}
