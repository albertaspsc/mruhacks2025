"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Users } from "lucide-react";
import Link from "next/link";

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

  useEffect(() => {
    if (workshopId) {
      fetchRegistrations();
    }
  }, [workshopId]);

  const fetchRegistrations = async () => {
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
  };

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
        a.download = `${data?.workshop.title.replace(/\s+/g, "_")}_registrations.csv`;
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

  return (
    <div className="min-h-screen bg-gray-50 pt-[70px]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard?tab=workshops">
                <Button>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Workshop Registrations
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={exportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
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
                    data.workshop.currentRegistrations >=
                    data.workshop.maxCapacity
                      ? "destructive"
                      : "default"
                  }
                >
                  {data.workshop.currentRegistrations >=
                  data.workshop.maxCapacity
                    ? "Full"
                    : "Available"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Registrations Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Registered Participants ({data.registrations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.registrations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500">No registrations yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Year of Study</TableHead>
                      <TableHead>Major</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Registered At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.registrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <div className="font-medium">
                            {registration.participant.fullName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {registration.participant.yearOfStudy}
                        </TableCell>
                        <TableCell>{registration.participant.major}</TableCell>
                        <TableCell>{registration.participant.gender}</TableCell>
                        <TableCell>
                          {new Date(
                            registration.registeredAt,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
