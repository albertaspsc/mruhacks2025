"use client";

import React, { use } from "react";
import { ParticipantStats } from "@/components/dashboards/admin/ParticipantStats";
import { RegistrationTrendsChart } from "@/components/dashboards/admin/RegistrationTrendsChart";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default function StatsSlot({ searchParams }: PageProps) {
  const resolvedSearchParams = use(searchParams);
  const isActive = resolvedSearchParams.tab === "stats";

  if (!isActive) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Registration Trends
        </h1>
        <p className="text-sm text-gray-600">
          Track registration patterns and analyze participant engagement over
          time
        </p>
      </div>

      {/* Registration Trends Chart - Main Focus */}
      <div className="mb-4">
        <RegistrationTrendsChart />
      </div>

      {/* Additional Statistics - Secondary */}
      <ParticipantStats />
    </div>
  );
}
