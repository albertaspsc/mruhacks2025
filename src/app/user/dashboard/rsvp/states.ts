"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { RegistrationStatus } from "@/components/dashboards/shared/ui/StatusBanner";

// ---------------- Types ----------------
export type ConfirmedCount =
  | { loading: false; count: number }
  | { loading: true };

export type LiveRegistrationStatus =
  | { loading: false; status: RegistrationStatus }
  | { loading: true };

// ---------------- Shared Singleton Logic ----------------
type Listener<T> = (value: T) => void;

function makeSingleton<T>(
  key: string,
  table: string,
  column: string,
  mapPayload: (payload: any) => T,
) {
  let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null =
    null;
  let listeners: Listener<T>[] = [];
  let currentValue: T | null = null;
  let initialized = false;
  let client = createClient();

  function init() {
    if (initialized) return;
    initialized = true;

    // initial fetch
    client
      .from(table)
      .select(column)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          currentValue = data[column as keyof typeof data] as T;
          listeners.forEach((cb) => cb(currentValue!));
        }
      });

    // realtime subscription
    channel = client
      .channel(`${key}_subscription`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table },
        (payload) => {
          const newValue = mapPayload(payload);
          currentValue = newValue;
          listeners.forEach((cb) => cb(newValue));
        },
      )
      .subscribe();
  }

  function subscribe(cb: Listener<T>) {
    init();
    listeners.push(cb);

    if (currentValue != null) cb(currentValue);

    return () => {
      listeners = listeners.filter((x) => x !== cb);
      if (listeners.length === 0 && channel) {
        client.removeChannel(channel);
        channel = null;
        initialized = false;
        currentValue = null;
      }
    };
  }

  return { subscribe };
}

// ---------------- Singletons ----------------
const confirmedCountSingleton = makeSingleton<number>(
  "confirmed_count",
  "confirmed_count",
  "count",
  (payload) => payload.new.count,
);

const registrationStatusSingleton = makeSingleton<RegistrationStatus>(
  "users",
  "users",
  "status",
  (payload) => payload.new.status,
);

// ---------------- Hooks ----------------
export function useConfirmedCount(): ConfirmedCount {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = confirmedCountSingleton.subscribe((newCount) => {
      setCount(newCount);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return count == null ? { loading: true } : { loading, count };
}

export function useRegistrationStatus(): LiveRegistrationStatus {
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = registrationStatusSingleton.subscribe((newStatus) => {
      setStatus(newStatus);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return status == null ? { loading: true } : { loading, status };
}
