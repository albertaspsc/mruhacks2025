"use client";

import React, { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        a.download = "workshop-registrations-mruhacks2025.csv";
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

  return (
    <div className="space-y-6">
      {/* Workshop Management Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Workshop Management
          </h3>
          <p className="text-gray-600">
            Create, edit, and manage workshops for MRUHacks 2025
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleExportWorkshops}>
            <Download className="w-4 h-4 mr-2" />
            Export Registrations
          </Button>
          <Link href="/admin/workshops/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Workshop
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Workshops
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workshops.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Registrations
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workshops.reduce(
                (total, w) => total + (w.currentRegistrations || 0),
                0,
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Capacity
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workshops.length > 0
                ? Math.round(
                    workshops.reduce((total, w) => {
                      const percentage =
                        w.maxCapacity > 0
                          ? ((w.currentRegistrations || 0) / w.maxCapacity) *
                            100
                          : 0;
                      return total + percentage;
                    }, 0) / workshops.length,
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workshops Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Workshops</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading workshops...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workshop</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workshops.map((workshop) => (
                  <TableRow key={workshop.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{workshop.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {workshop.description}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
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
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{workshop.location}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {workshop.currentRegistrations || 0}/
                          {workshop.maxCapacity}
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
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={workshop.isActive ? "default" : "secondary"}
                      >
                        {workshop.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/admin/workshops/${workshop.id}/edit`}>
                          <Button>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link
                          href={`/admin/workshops/${workshop.id}/registrations`}
                        >
                          <Button>
                            <Users className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleDeleteWorkshop(workshop.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
