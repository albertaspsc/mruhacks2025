"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/hooks/use-toast";
import useCarousel from "embla-carousel-react";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { usePrevNextButtons } from "@/components/Carousel/CarouselArrowButtons";
import {
  WorkshopPrevButton as PrevButton,
  WorkshopNextButton as NextButton,
} from "./WorkshopButtons";
import carouselStyles from "@/components/Carousel/carousel.module.css";
import styles from "@/components/dashboards/workshopsCarousel.module.css";

type Workshop = {
  id: string;
  title: string;
  description?: string | null;
  date: string | Date;
  startTime: string;
  endTime: string;
  location?: string | null;
  maxCapacity: number | null;
  currentRegistrations: number;
  isRegistered: boolean;
  isFull: boolean;
  imageUrl?: string | null;
};

function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "";
  const match = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return time;
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = ((hour + 11) % 12) + 1; // 0 or 12 -> 12, 13 -> 1, etc.
  return `${hour}:${minute} ${suffix}`;
}

export default function WorkshopsCarousel() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [slideWidth, setSlideWidth] = useState(300); // Default width
  const containerRef = useRef<HTMLDivElement>(null);

  const [carouselRef, carouselApi] = useCarousel({
    loop: false,
    align: "start",
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(carouselApi, () => {});

  // Calculate slide width based on container width to show only full cards
  useEffect(() => {
    const calculateSlideWidth = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      // Fixed card width with extra padding to prevent cut-offs
      const minCardWidth = 300;
      const cardGap = 24; // Increased gap between cards
      const visibleCardsCount = Math.max(
        1,
        Math.floor((containerWidth - 40) / (minCardWidth + cardGap)),
      );

      // Ensure we have enough space to display the cards without cutting them off
      // Subtracting extra margin to ensure complete cards
      const newSlideWidth = Math.floor(
        (containerWidth - 40 - (visibleCardsCount - 1) * cardGap) /
          visibleCardsCount,
      );

      setSlideWidth(newSlideWidth);

      // Re-initialize carousel after calculation
      if (carouselApi) {
        setTimeout(() => carouselApi.reInit(), 0);
      }
    };

    calculateSlideWidth();
    window.addEventListener("resize", calculateSlideWidth);

    return () => window.removeEventListener("resize", calculateSlideWidth);
  }, [carouselApi]);

  const fetchWorkshops = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/workshops", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load workshops");
      const data = await res.json();
      setWorkshops(data);
    } catch (e) {
      toast({ title: "Failed to load workshops", variant: "destructive" });
    } finally {
      setLoading(false);
      // ensure carousel recalculates sizes
      if (carouselApi) {
        setTimeout(() => carouselApi.reInit(), 0);
      }
    }
  }, [toast, carouselApi]);

  React.useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  const handleRegister = async (id: string) => {
    try {
      const res = await fetch(`/api/workshops/${id}/register`, {
        method: "POST",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Registration failed");
      toast({ title: "Registered for workshop" });
      await fetchWorkshops();
    } catch (e: any) {
      toast({
        title: e.message || "Registration failed",
        variant: "destructive",
      });
    }
  };

  const handleUnregister = async (id: string) => {
    try {
      const res = await fetch(`/api/workshops/${id}/register`, {
        method: "DELETE",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Unregister failed");
      toast({ title: "Unregistered from workshop" });
      await fetchWorkshops();
    } catch (e: any) {
      toast({
        title: e.message || "Unregister failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-auto">
      <div ref={containerRef} className="overflow-hidden">
        {loading && (
          <div className="text-sm text-muted-foreground p-4">
            Loading workshops…
          </div>
        )}
        {!loading && workshops.length === 0 && (
          <div className="text-sm text-muted-foreground p-4">
            No workshops available right now.
          </div>
        )}

        {workshops.length > 0 && (
          <div
            className={`${carouselStyles.carousel__wrapper}`}
            style={{ height: "auto" }}
          >
            <div
              className={`${carouselStyles.carousel__button_left} ${styles.buttonLeft}`}
            >
              <PrevButton
                onClick={onPrevButtonClick}
                disabled={prevBtnDisabled}
              />
            </div>

            <div
              className={`${carouselStyles.carousel__viewport} ${carouselStyles.fullWidthViewport}`}
              ref={carouselRef}
              style={{
                overflow: "hidden",
                position: "relative",
                height: "auto",
              }}
            >
              <div className={`${carouselStyles.carousel__container} flex`}>
                {workshops.map((w) => {
                  const capacityLabel =
                    w.maxCapacity && w.maxCapacity > 0
                      ? `${w.currentRegistrations}/${w.maxCapacity}`
                      : `${w.currentRegistrations}`;
                  return (
                    <div
                      className={`${carouselStyles.carousel__slide} ${styles.slide}`}
                      key={w.id}
                      style={{ width: `${slideWidth}px` }}
                    >
                      <div className={`${styles.card} h-full`}>
                        {/* Image Container */}
                        {w.imageUrl ? (
                          <div className={styles.imageContainer}>
                            <Image
                              src={w.imageUrl}
                              alt={`${w.title} workshop`}
                              className={styles.workshopImage}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        ) : (
                          <div className={styles.imageContainer}>
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <span className="text-xs">Image coming soon</span>
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground overflow-hidden text-ellipsis">
                            {formatDate(w.date)} {formatTime(w.startTime)}–
                            {formatTime(w.endTime)}
                          </div>
                          <div>
                            <span className="font-medium text-base">
                              {w.title}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span>{capacityLabel} participants</span>
                            {w.isFull && (
                              <span className="text-red-500 ml-1">(Full)</span>
                            )}
                          </div>
                          {w.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{w.location}</span>
                            </div>
                          )}
                          {w.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {w.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          {w.isRegistered ? (
                            <Button
                              variant="secondary"
                              className="rounded-xl"
                              onClick={() => handleUnregister(w.id)}
                            >
                              Unregister
                            </Button>
                          ) : (
                            <Button
                              className="rounded-xl"
                              onClick={() => handleRegister(w.id)}
                              disabled={w.isFull}
                            >
                              {w.isFull ? "Full" : "Register"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className={`${carouselStyles.carousel__button_right} ${styles.buttonRight}`}
            >
              <NextButton
                onClick={onNextButtonClick}
                disabled={nextBtnDisabled}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
