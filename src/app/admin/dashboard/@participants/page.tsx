import { ParticipantManagement } from "@/components/dashboards/admin/ParticipantManagement";
import { use } from "react";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default function ParticipantsSlot({ searchParams }: PageProps) {
  const resolvedSearchParams = use(searchParams);
  const isActive = resolvedSearchParams.tab === "participants";

  if (!isActive) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Participant Management
        </h3>
        <p className="text-gray-600">
          Manage registrations, view participant details, change status, and
          handle check-ins
        </p>
      </div>
      <ParticipantManagement userRole="admin" readOnly={false} className="" />
    </div>
  );
}
