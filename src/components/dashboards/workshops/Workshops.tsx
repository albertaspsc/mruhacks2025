"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useToast } from "@/components/hooks/use-toast";

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
  hour = ((hour + 11) % 12) + 1; // convert 0/12->12, 13->1, etc.
  return `${hour}:${minute} ${suffix}`;
}

export default function Workshops() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [workshops, setWorkshops] = React.useState<Workshop[]>([]);

  const fetchWorkshops = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/workshops", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load workshops");
      const data = await res.json();
      console.log("Workshops fetched:", data);
      setWorkshops(data);
    } catch (e) {
      toast({ title: "Failed to load workshops", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
    <Card className="mb-8 rounded-xl overflow-hidden">
      <CardHeader className="px-3 py-2 flex-shrink-0">
        <CardTitle className="text-lg">Workshops</CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-3">
        {loading && (
          <div className="text-sm text-muted-foreground">
            Loading workshops…
          </div>
        )}
        {!loading && workshops.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No workshops available right now.
          </div>
        )}
        <div className="space-y-8">
          {workshops.map((w) => {
            const capacityLabel =
              w.maxCapacity && w.maxCapacity > 0
                ? `${w.currentRegistrations}/${w.maxCapacity}`
                : `${w.currentRegistrations}`;
            return (
              <div
                key={w.id}
                className="border rounded-xl px-8 py-6 md:px-10 md:py-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full"
              >
                <div className="space-y-2 min-w-[280px] flex-1">
                  <div className="text-sm text-muted-foreground overflow-hidden text-ellipsis">
                    {formatDate(w.date)} {formatTime(w.startTime)}–
                    {formatTime(w.endTime)}
                  </div>
                  <div>
                    <span className="font-medium text-base">{w.title}</span>
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
                <div className="flex items-center gap-2">
                  {w.isRegistered ? (
                    <Button
                      variant="secondary"
                      onClick={() => handleUnregister(w.id)}
                    >
                      Unregister
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleRegister(w.id)}
                      disabled={w.isFull}
                    >
                      {w.isFull ? "Full" : "Register"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
