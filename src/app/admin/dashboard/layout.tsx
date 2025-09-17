import { Suspense } from "react";
import TabNavigation from "./TabNavigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  participants: React.ReactNode;
  workshops: React.ReactNode;
}

export default function DashboardLayout({
  children,
  participants,
  workshops,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-[70px]">
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

          <div className="space-y-6">
            <TabNavigation />

            <Suspense fallback={<div>Loading...</div>}>
              {participants}
              {workshops}
            </Suspense>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
