"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  GraduationCap,
  MapPin,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompactStatsCard } from "@/components/dashboards/shared/ui/CompactStatsCard";
import { CompactDistributionTable } from "@/components/dashboards/shared/ui/CompactDistributionTable";
import { AdminErrorHandler } from "@/utils/admin/errorHandler";

interface ParticipantStatsData {
  totalParticipants: number;
  confirmedParticipants: number;
  pendingParticipants: number;
  waitlistedParticipants: number;
  checkedInParticipants: number;
  genderDistribution: Array<{
    gender: string;
    count: number;
    percentage: number;
  }>;
  universityDistribution: Array<{
    university: string;
    count: number;
    percentage: number;
  }>;
  majorDistribution: Array<{
    major: string;
    count: number;
    percentage: number;
  }>;
  yearOfStudyDistribution: Array<{
    year: string;
    count: number;
    percentage: number;
  }>;
  experienceDistribution: Array<{
    experience: string;
    count: number;
    percentage: number;
  }>;
  marketingDistribution: Array<{
    marketing: string;
    count: number;
    percentage: number;
  }>;
  dietaryRestrictionsDistribution: Array<{
    restriction: string;
    count: number;
    percentage: number;
  }>;
  interestsDistribution: Array<{
    interest: string;
    count: number;
    percentage: number;
  }>;
  previousAttendance: { attended: number; notAttended: number };
  registrationTrends: Array<{ date: string; count: number }>;
  averageRegistrationTime: string;
}

export function ParticipantStats() {
  const [statsData, setStatsData] = useState<ParticipantStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/participants/stats", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch participant statistics");
      }

      const data = await response.json();
      setStatsData(data);
    } catch (err) {
      const errorMessage = AdminErrorHandler.handleApiError(err);
      setError(errorMessage);
      AdminErrorHandler.showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsData();
  }, []);

  const handleExportStats = async () => {
    try {
      const response = await fetch("/api/admin/participants/stats/export", {
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `participant-stats-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        AdminErrorHandler.showSuccessToast("Statistics exported successfully");
      } else {
        AdminErrorHandler.showErrorToast("Failed to export statistics");
      }
    } catch (error) {
      AdminErrorHandler.showErrorToast("Error exporting statistics");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchStatsData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No statistics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Participant Analytics
          </h2>
          <p className="text-xs text-gray-600">
            Comprehensive insights into participant demographics and engagement
          </p>
        </div>
        <div className="flex space-x-1">
          <Button onClick={handleExportStats} variant="outline" size="sm">
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
          <Button onClick={fetchStatsData} variant="outline" size="sm">
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
        <CompactStatsCard
          title="Total"
          value={statsData.totalParticipants}
          icon={Users}
        />
        <CompactStatsCard
          title="Confirmed"
          value={statsData.confirmedParticipants}
          icon={UserCheck}
        />
        <CompactStatsCard
          title="Pending"
          value={statsData.pendingParticipants}
          icon={Calendar}
        />
        <CompactStatsCard
          title="Waitlisted"
          value={statsData.waitlistedParticipants}
          icon={Users}
        />
        <CompactStatsCard
          title="First Time"
          value={statsData.previousAttendance.notAttended}
          icon={UserCheck}
        />
        <CompactStatsCard
          title="Returning"
          value={statsData.previousAttendance.attended}
          icon={TrendingUp}
        />
      </div>

      {/* Demographics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2">
        <CompactDistributionTable
          title="Gender Distribution"
          data={statsData.genderDistribution.map((item) => ({
            label: item.gender,
            count: item.count,
            percentage: item.percentage,
          }))}
          icon={PieChart}
        />
        <CompactDistributionTable
          title="University Distribution"
          data={statsData.universityDistribution.map((item) => ({
            label: item.university,
            count: item.count,
            percentage: item.percentage,
          }))}
          maxItems={5}
          icon={MapPin}
        />
        <CompactDistributionTable
          title="Year of Study"
          data={statsData.yearOfStudyDistribution.map((item) => ({
            label: item.year,
            count: item.count,
            percentage: item.percentage,
          }))}
          icon={BarChart3}
        />
        <CompactDistributionTable
          title="Dietary Restrictions"
          data={statsData.dietaryRestrictionsDistribution.map((item) => ({
            label: item.restriction,
            count: item.count,
            percentage: item.percentage,
          }))}
          icon={PieChart}
        />
      </div>

      {/* Academic Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2">
        <CompactDistributionTable
          title="Major Distribution"
          data={statsData.majorDistribution.map((item) => ({
            label: item.major,
            count: item.count,
            percentage: item.percentage,
          }))}
          maxItems={5}
          icon={GraduationCap}
        />
        <CompactDistributionTable
          title="Experience Level"
          data={statsData.experienceDistribution.map((item) => ({
            label: item.experience,
            count: item.count,
            percentage: item.percentage,
          }))}
          icon={TrendingUp}
        />
        <CompactDistributionTable
          title="Marketing Channels"
          data={statsData.marketingDistribution.map((item) => ({
            label: item.marketing,
            count: item.count,
            percentage: item.percentage,
          }))}
          icon={BarChart3}
        />
        <CompactDistributionTable
          title="Interests"
          data={statsData.interestsDistribution.map((item) => ({
            label: item.interest,
            count: item.count,
            percentage: item.percentage,
          }))}
          maxItems={5}
          icon={PieChart}
        />
      </div>
    </div>
  );
}
