"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useToast } from "@/components/hooks/use-toast";
import { Workshop } from "@/types/workshop";
import {
  getWorkshopsAction,
  registerForWorkshopAction,
  unregisterFromWorkshopAction,
} from "@/actions/workshopActions";
import WorkshopCard from "./WorkshopCard";

export default function WorkshopsCarousel() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);

  const fetchWorkshops = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getWorkshopsAction();
      if (!result.success) {
        throw new Error(result.error || "Failed to load workshops");
      }
      setWorkshops(result.data || []);
    } catch (e: any) {
      toast({
        title: e.message || "Failed to load workshops",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleRegister = useCallback(
    async (id: string) => {
      try {
        const result = await registerForWorkshopAction(id);
        if (!result.success) {
          throw new Error(result.error || "Registration failed");
        }
        toast({ title: "Registered for workshop" });
        await fetchWorkshops();
      } catch (e: any) {
        toast({
          title: e.message || "Registration failed",
          variant: "destructive",
        });
      }
    },
    [toast, fetchWorkshops],
  );

  const handleUnregister = useCallback(
    async (id: string) => {
      try {
        const result = await unregisterFromWorkshopAction(id);
        if (!result.success) {
          throw new Error(result.error || "Unregister failed");
        }
        toast({ title: "Unregistered from workshop" });
        await fetchWorkshops();
      } catch (e: any) {
        toast({
          title: e.message || "Unregister failed",
          variant: "destructive",
        });
      }
    },
    [toast, fetchWorkshops],
  );

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        Loading workshops...
      </div>
    );
  }

  if (workshops.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        No workshops available right now.
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
      }}
      className="w-full"
    >
      <CarouselContent className="m-2 md:m-4 ">
        {workshops.map((workshop: Workshop) => (
          <CarouselItem key={workshop.id} className="basis-1/2 ">
            <WorkshopCard
              workshop={workshop}
              onRegister={handleRegister}
              onUnregister={handleUnregister}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 text-black bg-white border border-gray-200 " />
      <CarouselNext className="right-2 text-black bg-white border border-gray-200 " />
    </Carousel>
  );
}
