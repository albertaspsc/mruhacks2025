"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  RefreshCw,
  UserCheck,
  Users,
  Lock,
  Eye,
} from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );

  // Role-based permissions
  const isVolunteer = userRole === "volunteer";
  const isAdmin = userRole === "admin";
  const isSuperAdmin = userRole === "super_admin";

  // Define what each role can do
  const permissions = {
    canEdit: !readOnly && !isVolunteer, // Admins and super admins can edit
    canBulkEdit: (isAdmin || isSuperAdmin) && !readOnly, // Only admins+ can bulk edit
    canExport: !isVolunteer || isSuperAdmin, // Volunteers cannot export, unless super admin
    canCheckIn: true, // All roles can check people in
    canChangeStatus: !readOnly && !isVolunteer, // Only admins+ can change status
  };

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

  // Update participant status (admin+ only)
  const updateStatus = async (id: string, newStatus: string) => {
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
        prev.map((p) => (p.id === id ? { ...p, status: newStatus as any } : p)),
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update participant status");
    }
  };

  // Toggle check-in (all roles can do this)
  const toggleCheckIn = async (id: string) => {
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
        prev.map((p) => (p.id === id ? { ...p, checked_in: newCheckedIn } : p)),
      );
    } catch (error) {
      console.error("Error updating check-in:", error);
      alert("Failed to update check-in status");
    }
  };

  // Bulk update status (admin+ only)
  const bulkUpdateStatus = async (newStatus: string) => {
    if (!permissions.canBulkEdit) {
      alert("You don't have permission to bulk update participants");
      return;
    }

    if (selectedParticipants.length === 0) return;

    try {
      const response = await fetch("/api/participants/bulk-update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantIds: selectedParticipants,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setParticipants((prev) =>
        prev.map((p) =>
          selectedParticipants.includes(p.id)
            ? { ...p, status: newStatus as any }
            : p,
        ),
      );
      setSelectedParticipants([]);
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

    const csvContent = [
      [
        "Name",
        "Email",
        "University",
        "Gender",
        "Status",
        "Checked In",
        "Registration Date",
      ],
      ...filteredParticipants.map((p) => [
        `${p.f_name || ""} ${p.l_name || ""}`.trim(),
        p.email || "",
        p.university || "N/A",
        p.gender || "Not specified",
        p.status || "pending",
        p.checked_in ? "Yes" : "No",
        p.timestamp ? new Date(p.timestamp).toLocaleDateString() : "N/A",
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

  // Filter participants - ensure participants is always an array
  const filteredParticipants = useMemo(() => {
    if (!Array.isArray(participants)) {
      console.warn("participants is not an array:", participants);
      return [];
    }

    return participants.filter((participant) => {
      const matchesSearch =
        participant.f_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.l_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || participant.status === statusFilter;

      const matchesGender =
        genderFilter === "all" || participant.gender === genderFilter;

      return matchesSearch && matchesStatus && matchesGender;
    });
  }, [participants, searchTerm, statusFilter, genderFilter]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "waitlisted":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-green-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-xl font-bold text-green-600">
                {stats.confirmed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-orange-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Waitlisted</p>
              <p className="text-xl font-bold text-orange-600">
                {stats.waitlisted}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Checked In</p>
              <p className="text-xl font-bold text-purple-600">
                {stats.checkedIn}
              </p>
            </div>
          </div>
        </div>
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

      {/* Controls */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
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

              {/* Status Filter */}
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="waitlisted">Waitlisted</option>
              </select>

              {/* Gender Filter */}
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="all">All Genders</option>
                {availableGenders.map((gender) => (
                  <option key={gender} value={gender} className="capitalize">
                    {gender}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              {permissions.canExport && (
                <button
                  onClick={exportData}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
              )}

              <button
                onClick={fetchParticipants}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {permissions.canBulkEdit && (
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
                      checked={
                        selectedParticipants.length ===
                          filteredParticipants.length &&
                        filteredParticipants.length > 0
                      }
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
                {permissions.canChangeStatus && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParticipants.map((participant) => (
                <tr key={participant.id} className="hover:bg-gray-50">
                  {permissions.canBulkEdit && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedParticipants.includes(participant.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedParticipants((prev) => [
                              ...prev,
                              participant.id,
                            ]);
                          } else {
                            setSelectedParticipants((prev) =>
                              prev.filter((id) => id !== participant.id),
                            );
                          }
                        }}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {participant.f_name} {participant.l_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {participant.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {participant.university || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {participant.gender || "Not specified"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        participant.status || "pending",
                      )}`}
                    >
                      {participant.status || "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleCheckIn(participant.id)}
                      disabled={!permissions.canCheckIn}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        !permissions.canCheckIn
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : participant.checked_in
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {participant.checked_in ? "Checked In" : "Check In"}
                    </button>
                  </td>
                  {permissions.canChangeStatus && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={participant.status || "pending"}
                        onChange={(e) =>
                          updateStatus(participant.id, e.target.value)
                        }
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                        disabled={!permissions.canChangeStatus}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="waitlisted">Waitlisted</option>
                        <option value="declined">Declined</option>
                        <option value="denied">Denied</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredParticipants.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No participants found matching your criteria.
          </div>
        )}
      </div>

      {/* Bulk Actions - only show for admin+ */}
      {permissions.canBulkEdit && selectedParticipants.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-4 z-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedParticipants.length} selected
            </span>
            <button
              onClick={() => bulkUpdateStatus("pending")}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
            >
              Make Pending
            </button>
            <button
              onClick={() => bulkUpdateStatus("confirmed")}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Confirm All
            </button>
            <button
              onClick={() => bulkUpdateStatus("waitlisted")}
              className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
            >
              Waitlist All
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
