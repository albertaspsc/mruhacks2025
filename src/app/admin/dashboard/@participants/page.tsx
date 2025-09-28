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
      <ParticipantManagement userRole="admin" readOnly={false} className="" />
    </div>
  );
}
