"use client";

import React, { useEffect, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit,
  Download,
  Trash2,
} from "lucide-react";
import Link from "next/link";
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
import { type ColumnDef } from "@tanstack/react-table";
import { useWorkshops } from "@/hooks/admin/useWorkshops";
import { AdminWorkshop } from "@/types/admin";
import { AdminErrorHandler } from "@/utils/admin/errorHandler";
import { ADMIN_ROUTES } from "@/utils/admin/routes";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default function WorkshopsSlot({ searchParams }: PageProps) {
  const { workshops, loading, error, fetchWorkshops, deleteWorkshop } =
    useWorkshops();
  const resolvedSearchParams = use(searchParams);
  const isActive = resolvedSearchParams.tab === "workshops";

  useEffect(() => {
    if (isActive) {
      fetchWorkshops();
    }
  }, [isActive, fetchWorkshops]);

  // Export workshop registrations
  const handleExportWorkshops = async () => {
    try {
      const response = await fetch("/api/workshops/registrations/export", {
        credentials: "include",
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = generateFilename("workshop-registrations-mruhacks2025");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        AdminErrorHandler.showSuccessToast(
          "Workshop registrations exported successfully",
        );
      } else {
        AdminErrorHandler.showErrorToast(
          "Failed to export workshop data. Please try again.",
        );
      }
    } catch (error) {
      AdminErrorHandler.showErrorToast(
        "Error exporting workshop data. Please try again.",
      );
    }
  };

  // Handle workshop deletion
  const handleDeleteWorkshop = async (workshopId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this workshop? This action cannot be undone.",
      )
    ) {
      return;
    }
    try {
      await deleteWorkshop(workshopId);
      AdminErrorHandler.showSuccessToast("Workshop deleted successfully");
    } catch (error) {
      const errorMessage = AdminErrorHandler.handleApiError(error);
      AdminErrorHandler.showErrorToast(errorMessage);
    }
  };

  // Handle bulk workshop deletion
  const handleBulkDeleteWorkshops = async (
    selectedWorkshops: AdminWorkshop[],
  ) => {
    if (selectedWorkshops.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedWorkshops.length} workshop(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const workshopIds = selectedWorkshops.map((w) => w.id);
      const response = await fetch("/api/admin/workshops/bulk-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workshopIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete workshops");
      }

      const result = await response.json();

      // Refresh workshops list
      await fetchWorkshops();

      if (result.skippedCount > 0) {
        AdminErrorHandler.showSuccessToast(
          `Successfully deleted ${result.deletedCount} workshop(s). ${result.skippedCount} workshop(s) were skipped because they have registrations.`,
        );
      } else {
        AdminErrorHandler.showSuccessToast(
          `Successfully deleted ${result.deletedCount} workshop(s)`,
        );
      }
    } catch (error) {
      const errorMessage = AdminErrorHandler.handleApiError(error);
      AdminErrorHandler.showErrorToast(errorMessage);
    }
  };

  // Convert columns to ColumnDef format for AdvancedDataTable
  const columns: ColumnDef<AdminWorkshop>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <SortableHeader column={column}>Workshop</SortableHeader>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {row.original.description}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date & Time",
      cell: ({ row }) => (
        <div>
          <div className="flex items-center space-x-1 text-sm">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(row.original.date).toLocaleDateString("en-US", {
                timeZone: "UTC",
              })}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              {row.original.startTime} - {row.original.endTime}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex items-center space-x-1 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{row.original.location}</span>
        </div>
      ),
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => {
        const workshop = row.original;
        const percentage =
          workshop.maxCapacity > 0
            ? ((workshop.currentRegistrations || 0) / workshop.maxCapacity) *
              100
            : 0;

        return (
          <div className="text-sm">
            <div className="font-medium">
              {workshop.currentRegistrations || 0}/{workshop.maxCapacity}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${Math.min(100, percentage)}%`,
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Link href={ADMIN_ROUTES.WORKSHOPS.EDIT(row.original.id)}>
            <Button size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={ADMIN_ROUTES.WORKSHOPS.REGISTRATIONS(row.original.id)}>
            <Button size="sm">
              <Users className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteWorkshop(row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Prepare bulk actions
  const bulkActions = [
    {
      label: "Delete Selected",
      onClick: handleBulkDeleteWorkshops,
      variant: "destructive" as const,
      className: "bg-red-600 hover:bg-red-700",
    },
  ];

  // Prepare filters
  const filters = generateFilters(workshops, [
    {
      column: "isActive",
      getValue: (w) => (w.isActive ? "active" : "inactive"),
      getLabel: (value) => (value === "active" ? "Active" : "Inactive"),
      placeholder: "All Status",
    },
  ]);

  if (!isActive) {
    return null;
  }

  const pageActions = (
    <>
      <ActionButton onClick={handleExportWorkshops} icon={Download}>
        Export Registrations
      </ActionButton>
      <ActionButton href={ADMIN_ROUTES.WORKSHOPS.CREATE} icon={Plus}>
        Create Workshop
      </ActionButton>
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workshop Management"
        description="Create, edit, and manage workshops for MRUHacks 2025"
        actions={pageActions}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Workshops"
          value={workshops.length}
          icon={Calendar}
        />
        <StatsCard
          title="Total Registrations"
          value={workshops.reduce(
            (total: number, w: AdminWorkshop) =>
              total + (w.currentRegistrations || 0),
            0,
          )}
          icon={Users}
        />
        <StatsCard
          title="Average Capacity"
          value={`${
            workshops.length > 0
              ? Math.round(
                  workshops.reduce((total: number, w: AdminWorkshop) => {
                    const percentage =
                      w.maxCapacity > 0
                        ? ((w.currentRegistrations || 0) / w.maxCapacity) * 100
                        : 0;
                    return total + percentage;
                  }, 0) / workshops.length,
                )
              : 0
          }%`}
          icon={Users}
        />
      </div>

      {/* Workshops Table */}
      <AdvancedDataTable
        data={workshops}
        columns={columns}
        title="All Workshops"
        loading={loading}
        emptyMessage="No workshops found."
        onRefresh={fetchWorkshops}
        onExport={handleExportWorkshops}
        searchPlaceholder="Search workshops..."
        searchColumn="title"
        filters={filters}
        bulkActions={bulkActions}
        enableSelection={true}
        enablePagination={true}
        pageSizeOptions={[10, 20, 30, 50]}
      />
    </div>
  );
}
