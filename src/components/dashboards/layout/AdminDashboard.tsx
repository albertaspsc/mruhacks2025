"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Users,
  Mail,
  Download,
  Calendar,
  RefreshCw,
} from "lucide-react";

// Updated interface to match your API response
interface Participant {
  id: string;
  f_name?: string;
  l_name?: string;
  email?: string;
  status?: "confirmed" | "pending" | "waitlisted";
  checked_in?: boolean;
  university?: string;
  timestamp?: string;
  gender?: number;
  prev_attendance?: boolean;
  major?: number;
  parking?: string;
  yearOfStudy?: string;
  experience?: number;
  accommodations?: string;
  marketing?: number;
}

interface AdminDashboardProps {
  className?: string;
  userRole?: "volunteer" | "admin" | "super_admin";
}

export function AdminDashboard({ className = "" }: AdminDashboardProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );

  // Fetch participants using your API route
  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching participants via API...");

      const response = await fetch("/api/participants");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("API response:", data);
      console.log("Number of participants found:", data?.length || 0);

      setParticipants(data || []);
    } catch (err: any) {
      console.error("Error details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update status using your API route
  const updateParticipantStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/participants/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus as any } : p)),
      );

      console.log(`Participant ${id} status updated to ${newStatus}`);
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert("Failed to update status: " + err.message);
    }
  };

  // Toggle check-in using your API route
  const toggleCheckIn = async (id: string) => {
    try {
      const participant = participants.find((p) => p.id === id);
      const newCheckedInStatus = !participant?.checked_in;

      const response = await fetch(`/api/participants/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ checkedIn: newCheckedInStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, checked_in: newCheckedInStatus } : p,
        ),
      );
    } catch (err: any) {
      console.error("Error updating check-in:", err);
      alert("Failed to update check-in status: " + err.message);
    }
  };

  // Bulk update using your bulk-update API route
  const bulkUpdateStatus = async (
    participantIds: string[],
    newStatus: string,
  ) => {
    try {
      const response = await fetch("/api/participants/bulk-update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantIds,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update local state
      setParticipants((prev) =>
        prev.map((p) =>
          participantIds.includes(p.id)
            ? { ...p, status: newStatus as any }
            : p,
        ),
      );

      setSelectedParticipants([]);
      alert(`${result.updatedCount} participants updated to ${newStatus}`);
    } catch (err: any) {
      console.error("Error bulk updating status:", err);
      alert("Failed to bulk update status: " + err.message);
    }
  };

  // Initial load - no Supabase real-time needed
  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const total = participants.length;
    const confirmed = participants.filter(
      (p) => p.status === "confirmed",
    ).length;
    const waitlisted = participants.filter(
      (p) => p.status === "waitlisted",
    ).length;
    const pending = participants.filter(
      (p) => p.status === "pending" || !p.status,
    ).length;
    const checkedIn = participants.filter((p) => p.checked_in).length; // Use checked_in

    return { total, confirmed, waitlisted, pending, checkedIn };
  }, [participants]);

  // Filtered participants
  const filteredParticipants = useMemo(() => {
    return participants.filter((participant) => {
      const firstName = participant.f_name || ""; // Use f_name
      const lastName = participant.l_name || ""; // Use l_name
      const email = participant.email || "";

      const matchesSearch =
        firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase());

      const participantStatus = participant.status || "pending";
      const matchesStatus =
        statusFilter === "all" || participantStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [participants, searchTerm, statusFilter]);

  const handleSelectParticipant = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  const exportData = () => {
    const csvContent = [
      [
        "First Name",
        "Last Name",
        "Email",
        "Status",
        "Registration Date",
        "University",
        "Checked In",
      ],
      ...filteredParticipants.map((p) => [
        p.f_name || "",
        p.l_name || "",
        p.email || "",
        p.status || "pending",
        p.timestamp ? new Date(p.timestamp).toLocaleDateString() : "",
        p.university || "",
        p.checked_in ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participants_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "waitlisted":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleBulkConfirm = () => {
    if (selectedParticipants.length === 0) return;
    const confirmed = window.confirm(
      `Are you sure you want to confirm ${selectedParticipants.length} participants?`,
    );
    if (confirmed) {
      bulkUpdateStatus(selectedParticipants, "confirmed");
    }
  };

  const handleBulkWaitlist = () => {
    if (selectedParticipants.length === 0) return;
    const confirmed = window.confirm(
      `Are you sure you want to waitlist ${selectedParticipants.length} participants?`,
    );
    if (confirmed) {
      bulkUpdateStatus(selectedParticipants, "waitlisted");
    }
  };

  const handleBulkPending = () => {
    if (selectedParticipants.length === 0) return;
    const confirmed = window.confirm(
      `Are you sure you want to set ${selectedParticipants.length} participants to pending?`,
    );
    if (confirmed) {
      bulkUpdateStatus(selectedParticipants, "pending");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading participant data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <button
            onClick={fetchParticipants}
            className="ml-4 text-red-600 underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              MRUHacks Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage participants and track registration analytics
            </p>
          </div>
          <button
            onClick={fetchParticipants}
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-md shadow hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Registered
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-green-600 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.confirmed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Waitlisted</p>
              <p className="text-2xl font-bold text-yellow-600">
                {analytics.waitlisted}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Checked In</p>
              <p className="text-2xl font-bold text-purple-600">
                {analytics.checkedIn}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search participants..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={exportData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedParticipants(
                          filteredParticipants.map((p) => p.id),
                        );
                      } else {
                        setSelectedParticipants([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParticipants.map((participant) => (
                <tr key={participant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedParticipants.includes(participant.id)}
                      onChange={() => handleSelectParticipant(participant.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {participant.f_name || ""} {participant.l_name || ""}{" "}
                        {/* Use f_name and l_name */}
                      </div>
                      <div className="text-sm text-gray-500">
                        {participant.email || ""}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(participant.status || "pending")}`}
                    >
                      {participant.status || "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {participant.university || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleCheckIn(participant.id)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        participant.checked_in
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {participant.checked_in ? "Checked In" : "Check In"}{" "}
                      {/* Use checked_in */}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={participant.status || "pending"}
                      onChange={(e) =>
                        updateParticipantStatus(participant.id, e.target.value)
                      }
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="waitlisted">Waitlisted</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredParticipants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No participants found matching your criteria.
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedParticipants.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-4 z-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedParticipants.length} selected
            </span>
            <button
              onClick={handleBulkConfirm}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Confirm All
            </button>
            <button
              onClick={handleBulkWaitlist}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
            >
              Waitlist All
            </button>
            <button
              onClick={handleBulkPending}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              Set to Pending
            </button>
            <button
              onClick={() => setSelectedParticipants([])}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
