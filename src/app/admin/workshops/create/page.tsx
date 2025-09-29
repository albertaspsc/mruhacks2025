"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WorkshopForm } from "@/components/dashboards/admin/WorkshopForm";
import { AdminPageLayout } from "@/components/dashboards/admin/shared/AdminPageLayout";
import { useWorkshops } from "@/hooks/admin/useWorkshops";
import { AdminWorkshopFormData } from "@/types/admin";
import { AdminErrorHandler } from "@/utils/admin/errorHandler";
import { ADMIN_ROUTES } from "@/utils/admin/routes";

export default function CreateWorkshopPage() {
  const router = useRouter();
  const { createWorkshop } = useWorkshops();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: AdminWorkshopFormData) => {
    try {
      setLoading(true);
      setError(null);
      await createWorkshop(data);
      AdminErrorHandler.showSuccessToast("Workshop created successfully");
      router.push(ADMIN_ROUTES.WORKSHOPS.LIST);
    } catch (err) {
      const errorMessage = AdminErrorHandler.handleApiError(err);
      setError(errorMessage);
      AdminErrorHandler.showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageLayout
      title="Create Workshop"
      backHref={ADMIN_ROUTES.WORKSHOPS.LIST}
    >
      <WorkshopForm
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Create Workshop"
        error={error}
      />
    </AdminPageLayout>
  );
}
