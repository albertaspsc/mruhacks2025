"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { AdvancedDataTable } from "@/components/dashboards/shared/ui/AdvancedDataTable";
import { StatsCard } from "@/components/dashboards/shared/ui/StatsCard";
import { SortableHeader } from "@/components/dashboards/shared/utils/SortableHeader";
import { generateFilters } from "@/components/dashboards/shared/utils/FilterUtils";
import {
  exportToCSV,
  generateFilename,
} from "@/components/dashboards/shared/utils/ExportUtils";
import { AdminPageLayout } from "@/components/dashboards/admin/shared/AdminPageLayout";

interface Participant {
  id: string;
  registeredAt: string;
  participant: {
    firstName: string;
    lastName: string;
    fullName: string;
    yearOfStudy: string;
    gender: string;
    major: string;
  };
}

interface WorkshopData {
  id: string;
  title: string;
  maxCapacity: number;
  currentRegistrations: number;
}

interface RegistrationData {
  workshop: WorkshopData;
  registrations: Participant[];
}

export default function WorkshopRegistrationsPage() {
  const params = useParams();
  const workshopId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RegistrationData | null>(null);

  // Column definitions for AdvancedDataTable
  const columns = useMemo<ColumnDef<Participant>[]>(
    () => [
      {
        accessorKey: "participant.fullName",
        header: ({ column }) => (
          <SortableHeader column={column}>Name</SortableHeader>
        ),
        cell: ({ row }) => {
          const participant = row.original.participant;
          return <div className="font-medium">{participant.fullName}</div>;
        },
      },
      {
        accessorKey: "participant.yearOfStudy",
        header: ({ column }) => (
          <SortableHeader column={column}>Year of Study</SortableHeader>
        ),
        cell: ({ row }) => row.original.participant.yearOfStudy,
      },
      {
        accessorKey: "participant.major",
        header: "Major",
        cell: ({ row }) => row.original.participant.major,
      },
      {
        accessorKey: "participant.gender",
        header: ({ column }) => (
          <SortableHeader column={column}>Gender</SortableHeader>
        ),
        cell: ({ row }) => {
          const gender = row.original.participant.gender;
          return gender
            ? gender.charAt(0).toUpperCase() + gender.slice(1)
            : "Not specified";
        },
      },
      {
        accessorKey: "registeredAt",
        header: ({ column }) => (
          <SortableHeader column={column}>Registered At</SortableHeader>
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.registeredAt);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
    ],
    [],
  );

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/workshops/${workshopId}/registrations`,
      );

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch registrations: ${response.status} - ${errorText}`,
        );
      }

      const registrationData = await response.json();
      setData(registrationData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load registrations",
      );
      console.error("Error fetching registrations:", err);
    } finally {
      setLoading(false);
    }
  }, [workshopId]);

  useEffect(() => {
    if (workshopId) {
      fetchRegistrations();
    }
  }, [workshopId, fetchRegistrations]);

  const exportCSV = async () => {
    try {
      const response = await fetch(
        `/api/workshops/registrations/export?workshop=${workshopId}`,
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = generateFilename(
          `${data?.workshop.title.replace(/\s+/g, "_")}_registrations`,
        );
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to export registrations");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Error exporting registrations");
    }
  };

  // Prepare filters for AdvancedDataTable
  const filters = useMemo(() => {
    if (!data?.registrations) return [];

    return generateFilters(data.registrations, [
      {
        column: "participant.yearOfStudy",
        getValue: (r) => r.participant.yearOfStudy,
        placeholder: "All Years",
      },
      {
        column: "participant.major",
        getValue: (r) => r.participant.major,
        placeholder: "All Majors",
      },
      {
        column: "participant.gender",
        getValue: (r) => r.participant.gender,
        getLabel: (value) => value.charAt(0).toUpperCase() + value.slice(1),
        placeholder: "All Genders",
      },
    ]);
  }, [data?.registrations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading registrations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link href="/admin/dashboard?tab=workshops">
                <Button>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">
                Workshop Registrations
              </h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-red-600">{error}</div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Registrations",
      value: data.registrations.length,
      icon: Users,
    },
    {
      title: "Capacity Used",
      value: `${Math.round((data.workshop.currentRegistrations / data.workshop.maxCapacity) * 100)}%`,
      icon: Users,
    },
    {
      title: "Available Spots",
      value: Math.max(
        0,
        data.workshop.maxCapacity - data.workshop.currentRegistrations,
      ),
      icon: Users,
    },
  ];

  return (
    <AdminPageLayout
      title="Workshop Registrations"
      backHref="/admin/dashboard?tab=workshops"
      stats={stats}
    >
      {/* Workshop Info */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {data.workshop.title}
        </h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{data.workshop.currentRegistrations} registered</span>
          </div>
          <div>
            <span>Capacity: {data.workshop.maxCapacity}</span>
          </div>
          <div>
            <Badge
              variant={
                data.workshop.currentRegistrations >= data.workshop.maxCapacity
                  ? "destructive"
                  : "default"
              }
            >
              {data.workshop.currentRegistrations >= data.workshop.maxCapacity
                ? "Full"
                : "Available"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Advanced Data Table */}
      <AdvancedDataTable
        data={data.registrations}
        columns={columns}
        loading={loading}
        emptyMessage="No registrations yet"
        onExport={exportCSV}
        searchPlaceholder="Search participants..."
        searchColumn="participant.fullName"
        filters={filters}
        enableSelection={false}
        enablePagination={true}
        pageSizeOptions={[10, 20, 30, 50]}
      />
    </AdminPageLayout>
  );
}
