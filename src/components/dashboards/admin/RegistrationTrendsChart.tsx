"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Filter, BarChart3 } from "lucide-react";

interface TrendData {
  date: string;
  count: number;
  formattedDate: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface TrendsResponse {
  trends: TrendData[];
  totalRegistrations: number;
  filterOptions: {
    marketing: FilterOption[];
    experience: FilterOption[];
    major: FilterOption[];
    gender: FilterOption[];
    university: FilterOption[];
  };
  appliedFilters: {
    marketing?: string;
    experience?: string;
    major?: string;
    gender?: string;
    university?: string;
    days: number;
  };
}

interface RegistrationTrendsChartProps {
  className?: string;
}

const CHART_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
];

export function RegistrationTrendsChart({
  className,
}: RegistrationTrendsChartProps) {
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    marketing: "all",
    experience: "all",
    major: "all",
    gender: "all",
    university: "all",
    days: 30,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.marketing && filters.marketing !== "all")
        params.append("marketing", filters.marketing);
      if (filters.experience && filters.experience !== "all")
        params.append("experience", filters.experience);
      if (filters.major && filters.major !== "all")
        params.append("major", filters.major);
      if (filters.gender && filters.gender !== "all")
        params.append("gender", filters.gender);
      if (filters.university && filters.university !== "all")
        params.append("university", filters.university);
      params.append("days", filters.days.toString());

      const response = await fetch(`/api/admin/participants/trends?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch trends data");
      }

      const trendsData = await response.json();
      setData(trendsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      marketing: "all",
      experience: "all",
      major: "all",
      gender: "all",
      university: "all",
      days: 30,
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      (value) => value !== "all" && value !== 30,
    ).length;
  };

  const exportData = () => {
    if (!data) return;

    const csvContent = [
      ["Date", "Registrations"],
      ...data.trends.map((trend) => [trend.date, trend.count]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registration-trends-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Registration Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Registration Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <p>Error loading trends data</p>
            <Button onClick={fetchData} className="mt-2" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Registration Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Registration Trends
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()} filter
                {getActiveFiltersCount() !== 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant={chartType === "line" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("line")}
              >
                Line
              </Button>
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("bar")}
              >
                Bar
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Marketing Channel
                </label>
                <Select
                  value={filters.marketing}
                  onValueChange={(value) =>
                    handleFilterChange("marketing", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All channels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All channels</SelectItem>
                    {data.filterOptions.marketing.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Experience Level
                </label>
                <Select
                  value={filters.experience}
                  onValueChange={(value) =>
                    handleFilterChange("experience", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    {data.filterOptions.experience.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Major
                </label>
                <Select
                  value={filters.major}
                  onValueChange={(value) => handleFilterChange("major", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All majors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All majors</SelectItem>
                    {data.filterOptions.major.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Gender
                </label>
                <Select
                  value={filters.gender}
                  onValueChange={(value) => handleFilterChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All genders</SelectItem>
                    {data.filterOptions.gender.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  University
                </label>
                <Select
                  value={filters.university}
                  onValueChange={(value) =>
                    handleFilterChange("university", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All universities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All universities</SelectItem>
                    {data.filterOptions.university.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Time Period
                </label>
                <Select
                  value={filters.days.toString()}
                  onValueChange={(value) => handleFilterChange("days", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="60">Last 60 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-3">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xl font-bold text-blue-600">
              {data.totalRegistrations}
            </div>
            <div className="text-xs text-blue-700">Total Registrations</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {data.trends.length > 0
                ? Math.max(...data.trends.map((t) => t.count))
                : 0}
            </div>
            <div className="text-xs text-green-700">Peak Daily</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-xl font-bold text-purple-600">
              {data.trends.length > 0
                ? Math.round(data.totalRegistrations / data.trends.length)
                : 0}
            </div>
            <div className="text-xs text-purple-700">Avg Daily</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value, payload) => {
                    const data = payload?.[0]?.payload;
                    return data ? data.date : value;
                  }}
                  formatter={(value: number) => [value, "Registrations"]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS[0], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: CHART_COLORS[0], strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value, payload) => {
                    const data = payload?.[0]?.payload;
                    return data ? data.date : value;
                  }}
                  formatter={(value: number) => [value, "Registrations"]}
                />
                <Bar
                  dataKey="count"
                  fill={CHART_COLORS[0]}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Applied Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-gray-600 mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-1">
              {filters.marketing && filters.marketing !== "all" && (
                <Badge variant="secondary">
                  Marketing: {filters.marketing}
                </Badge>
              )}
              {filters.experience && filters.experience !== "all" && (
                <Badge variant="secondary">
                  Experience: {filters.experience}
                </Badge>
              )}
              {filters.major && filters.major !== "all" && (
                <Badge variant="secondary">Major: {filters.major}</Badge>
              )}
              {filters.gender && filters.gender !== "all" && (
                <Badge variant="secondary">Gender: {filters.gender}</Badge>
              )}
              {filters.university && filters.university !== "all" && (
                <Badge variant="secondary">
                  University: {filters.university}
                </Badge>
              )}
              {filters.days !== 30 && (
                <Badge variant="secondary">Period: {filters.days} days</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
