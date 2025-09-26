"use client";

import React, { useState, useEffect, use } from "react";
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
import { DataTable } from "@/components/dashboards/shared/ui/DataTable";
import { SortableHeader } from "@/components/dashboards/shared/utils/SortableHeader";
import { generateFilters } from "@/components/dashboards/shared/utils/FilterUtils";
import {
  exportToCSV,
  generateFilename,
} from "@/components/dashboards/shared/utils/ExportUtils";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

interface Workshop {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  maxCapacity: number;
  isActive: boolean;
  currentRegistrations?: number;
}

export default function WorkshopsSlot({ searchParams }: PageProps) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedSearchParams = use(searchParams);
  const isActive = resolvedSearchParams.tab === "workshops";

  useEffect(() => {
    if (isActive) {
      fetchWorkshops();
    }
  }, [isActive]);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/workshops", {
        credentials: "include",
      });
      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Workshop data received:", data);
        setWorkshops(data);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch workshops. Status:", response.status);
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Error fetching workshops:", error);
    } finally {
      setLoading(false);
    }
  };

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
      } else {
        console.error("Failed to export workshops");
        alert("Failed to export workshop data. Please try again.");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Error exporting workshop data. Please try again.");
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
      const response = await fetch(`/api/admin/workshops/${workshopId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setWorkshops((prev) => prev.filter((w) => w.id !== workshopId));
        alert("Workshop deleted successfully");
      } else {
        const error = await response.json();
        alert(`Failed to delete workshop: ${error.error}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting workshop. Please try again.");
    }
  };

  if (!isActive) {
    return null;
  }

  const pageActions = (
    <>
      <ActionButton onClick={handleExportWorkshops} icon={Download}>
        Export Registrations
      </ActionButton>
      <ActionButton href="/admin/workshops/create" icon={Plus}>
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
            (total, w) => total + (w.currentRegistrations || 0),
            0,
          )}
          icon={Users}
        />
        <StatsCard
          title="Average Capacity"
          value={`${
            workshops.length > 0
              ? Math.round(
                  workshops.reduce((total, w) => {
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
      <DataTable
        data={workshops}
        columns={[
          {
            key: "title",
            header: "Workshop",
            render: (workshop) => (
              <div>
                <div className="font-medium">{workshop.title}</div>
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {workshop.description}
                </div>
              </div>
            ),
          },
          {
            key: "date",
            header: "Date & Time",
            render: (workshop) => (
              <div>
                <div className="flex items-center space-x-1 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(workshop.date).toLocaleDateString("en-US", {
                      timeZone: "UTC",
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    {workshop.startTime} - {workshop.endTime}
                  </span>
                </div>
              </div>
            ),
          },
          {
            key: "location",
            header: "Location",
            render: (workshop) => (
              <div className="flex items-center space-x-1 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{workshop.location}</span>
              </div>
            ),
          },
          {
            key: "capacity",
            header: "Capacity",
            render: (workshop) => (
              <div className="text-sm">
                <div className="font-medium">
                  {workshop.currentRegistrations || 0}/{workshop.maxCapacity}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, workshop.maxCapacity > 0 ? ((workshop.currentRegistrations || 0) / workshop.maxCapacity) * 100 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (workshop) => (
              <Badge variant={workshop.isActive ? "default" : "secondary"}>
                {workshop.isActive ? "Active" : "Inactive"}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (workshop) => (
              <div className="flex space-x-2">
                <Link href={`/admin/workshops/${workshop.id}/edit`}>
                  <Button>
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/admin/workshops/${workshop.id}/registrations`}>
                  <Button>
                    <Users className="w-4 h-4" />
                  </Button>
                </Link>
                <Button onClick={() => handleDeleteWorkshop(workshop.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ),
          },
        ]}
        title="All Workshops"
        loading={loading}
        emptyMessage="No workshops found."
      />
    </div>
  );
}
