import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboards/shared/ui/StatsCard";

interface AdminPageLayoutProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  stats?: Array<{
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  className?: string;
}

export function AdminPageLayout({
  title,
  backHref,
  backLabel = "Back",
  children,
  stats = [],
  className = "",
}: AdminPageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 pt-[70px] ${className}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {backHref && (
                <Link href={backHref}>
                  <Button>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* Stats Cards */}
          {stats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <StatsCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                />
              ))}
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
