"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ParticipantManagement } from "@/components/admin/ParticipantManagement";
import { createClient } from "@/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Get initial tab from URL or default to participants
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(urlTab || "participants");
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  // Update tab based on URL parameter
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab, activeTab]);

  // Fetch workshops when workshops tab is active
  useEffect(() => {
    if (activeTab === "workshops") {
      fetchWorkshops();
    }
  }, [activeTab]);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/workshops");
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

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

  // Simple logout function (no auth checks)
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/admin-login-portal");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Export workshop registrations
  const handleExportWorkshops = async () => {
    try {
      const response = await fetch("/api/workshops/registrations/export");
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

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newUrl = `/admin/dashboard${value !== "participants" ? `?tab=${value}` : ""}`;
    router.push(newUrl, { scroll: false });
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
      });
      if (response.ok) {
        // Remove the workshop from state
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

  return (
    <div className="min-h-screen bg-gray-50 pt-[70px]">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h2>
            <p className="text-gray-600">
              Manage participants, workshops, and event logistics
            </p>
          </div>

          {/* Navigation Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="participants"
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Participants
              </TabsTrigger>
              <TabsTrigger
                value="workshops"
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Workshops
              </TabsTrigger>
            </TabsList>

            {/* Participants Tab */}
            <TabsContent value="participants" className="space-y-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Participant Management
                </h3>
                <p className="text-gray-600">
                  Manage registrations, view participant details, change status,
                  and handle check-ins
                </p>
              </div>

              <ParticipantManagement
                userRole="admin"
                readOnly={false}
                className=""
              />
            </TabsContent>

            {/* Workshops Tab - Full Workshop Management */}
            <TabsContent value="workshops" className="space-y-6">
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
                                <div className="font-medium">
                                  {workshop.title}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {workshop.description}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center space-x-1 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(workshop.date).toLocaleDateString(
                                    "en-US",
                                    { timeZone: "UTC" },
                                  )}
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
                                variant={
                                  workshop.isActive ? "default" : "secondary"
                                }
                              >
                                {workshop.isActive ? "Inactive" : "Active"}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex space-x-2">
                                <Link
                                  href={`/admin/workshops/${workshop.id}/edit`}
                                >
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
                                  onClick={() =>
                                    handleDeleteWorkshop(workshop.id)
                                  }
                                  className="text-red-600 hover:text-red-700 hover:border-red-300"
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
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
