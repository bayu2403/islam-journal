"use client";

import { useEffect, useState } from "react";
import { api, todayStr } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

export type PrayerTimes = {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  source: "aladhan" | "fallback";
};

// Today's prayer times for the signed-in user's city. Server caches Aladhan
// per (city, date) for 24h; the 1h client TTL just avoids refetch-per-mount.
export function usePrayerTimes(): PrayerTimes | null {
  const { session } = useAuth();
  const [times, setTimes] = useState<PrayerTimes | null>(null);

  useEffect(() => {
    if (!session) return;
    api<PrayerTimes>(`/prayer-times?date=${todayStr()}`, {}, 60 * 60 * 1000)
      .then(setTimes)
      .catch(() => setTimes(null));
  }, [session]);

  return times;
}
