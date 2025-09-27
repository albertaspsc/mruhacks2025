"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { WorkshopForm } from "@/components/admin/forms/WorkshopForm";
import { AdminPageLayout } from "@/components/dashboards/admin/shared/AdminPageLayout";
import { useWorkshops } from "@/hooks/admin/useWorkshops";
import { AdminWorkshopFormData } from "@/types/admin";
import { AdminErrorHandler } from "@/utils/admin/errorHandler";
import { ADMIN_ROUTES } from "@/utils/admin/routes";

export default function EditWorkshopPage() {
  const router = useRouter();
  const params = useParams();
  const workshopId = params.id as string;
  const { getWorkshop, updateWorkshop } = useWorkshops();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<
    Partial<AdminWorkshopFormData>
  >({});

  const fetchWorkshop = useCallback(async () => {
    try {
      setLoadingData(true);
      setError(null);
      const workshop = await getWorkshop(workshopId);

      // Convert date format and populate form
      const date = new Date(workshop.date);
      const formattedDate = date.toISOString().split("T")[0];

      setInitialData({
        title: workshop.title || "",
        description: workshop.description || "",
        date: formattedDate,
        startTime: workshop.startTime || "",
        endTime: workshop.endTime || "",
        location: workshop.location || "",
        maxCapacity: workshop.maxCapacity || 30,
        isActive: workshop.isActive !== false,
      });
    } catch (err) {
      const errorMessage = AdminErrorHandler.handleApiError(err);
      setError(errorMessage);
      AdminErrorHandler.showErrorToast(errorMessage);
    } finally {
      setLoadingData(false);
    }
  }, [workshopId, getWorkshop]);

  // Fetch workshop data on component mount
  useEffect(() => {
    if (workshopId) {
      fetchWorkshop();
    }
  }, [workshopId, fetchWorkshop]);

  const handleSubmit = async (data: AdminWorkshopFormData) => {
    try {
      setLoading(true);
      setError(null);
      await updateWorkshop(workshopId, data);
      AdminErrorHandler.showSuccessToast("Workshop updated successfully");
      router.push(ADMIN_ROUTES.WORKSHOPS.LIST);
    } catch (err) {
      const errorMessage = AdminErrorHandler.handleApiError(err);
      setError(errorMessage);
      AdminErrorHandler.showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <AdminPageLayout
        title="Edit Workshop"
        backHref={ADMIN_ROUTES.WORKSHOPS.LIST}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading workshop data...</div>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Edit Workshop"
      backHref={ADMIN_ROUTES.WORKSHOPS.LIST}
    >
      <WorkshopForm
        initialData={initialData}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        submitLabel="Update Workshop"
      />
    </AdminPageLayout>
  );
}
