"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Workshops</CardTitle>
      </CardHeader>
      <CardContent>
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
        <div className="space-y-4">
          {workshops.map((w) => {
            const capacityLabel =
              w.maxCapacity && w.maxCapacity > 0
                ? `${w.currentRegistrations}/${w.maxCapacity}`
                : `${w.currentRegistrations}`;
            return (
              <div
                key={w.id}
                className="border rounded-md p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{w.title}</span>
                    <Badge variant={w.isFull ? "destructive" : "secondary"}>
                      {capacityLabel}
                    </Badge>
                    {w.isRegistered && <Badge>Registered</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(w.date)} • {w.startTime}–{w.endTime}
                    {w.location ? ` • ${w.location}` : ""}
                  </div>
                  {w.description && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {w.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {w.isRegistered ? (
                    <Button
                      variant="outline"
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
