import { useState, useCallback } from "react";
import { AdminWorkshop } from "@/types/admin";
import { AdminWorkshopFormData } from "@/types/admin";
import {
  getAdminWorkshopsAction,
  createWorkshopAction,
  updateWorkshopAction,
  deleteWorkshopAction,
  getWorkshopAction,
} from "@/actions/adminActions";

export function useWorkshops() {
  const [workshops, setWorkshops] = useState<AdminWorkshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkshops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAdminWorkshopsAction();

      if (result.success) {
        setWorkshops(result.data!);
      } else {
        setError(result.error || "Failed to fetch workshops");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch workshops",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkshop = useCallback(async (data: AdminWorkshopFormData) => {
    try {
      const result = await createWorkshopAction(data);
      if (result.success) {
        setWorkshops((prev) => [...prev, result.data!]);
        return result.data!;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create workshop",
      );
    }
  }, []);

  const updateWorkshop = useCallback(
    async (id: string, data: AdminWorkshopFormData) => {
      try {
        const result = await updateWorkshopAction(id, data);
        if (result.success) {
          setWorkshops((prev) =>
            prev.map((w) => (w.id === id ? result.data! : w)),
          );
          return result.data!;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to update workshop",
        );
      }
    },
    [],
  );

  const deleteWorkshop = useCallback(async (id: string) => {
    try {
      const result = await deleteWorkshopAction(id);
      if (result.success) {
        setWorkshops((prev) => prev.filter((w) => w.id !== id));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete workshop",
      );
    }
  }, []);

  const getWorkshop = useCallback(async (id: string) => {
    try {
      const result = await getWorkshopAction(id);
      if (result.success) {
        return result.data!;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to fetch workshop",
      );
    }
  }, []);

  return {
    workshops,
    loading,
    error,
    fetchWorkshops,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
    getWorkshop,
  };
}
