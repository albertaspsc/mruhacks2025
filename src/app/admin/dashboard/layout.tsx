import { Suspense } from "react";
import TabNavigation from "./TabNavigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  participants: React.ReactNode;
  admins: React.ReactNode;
  workshops: React.ReactNode;
  stats: React.ReactNode;
}

export default function DashboardLayout({
  children,
  participants,
  admins,
  workshops,
  stats,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-[70px]">
      <main className="max-w-7xl mx-auto py-3 sm:px-6 lg:px-8">
        <div className="px-4 py-3 sm:px-0">
          <div className="space-y-3">
            <Suspense fallback={<div>Loading navigation...</div>}>
              <TabNavigation />
            </Suspense>

            <Suspense fallback={<div>Loading...</div>}>
              {participants}
              {admins}
              {workshops}
              {stats}
            </Suspense>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
