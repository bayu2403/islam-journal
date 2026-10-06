"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { hijriDay } from "@/lib/hijri";
import { cn } from "@/lib/utils";

// Monday-first start of the ISO week containing `d`.
function startOfWeekMonday(d: Date): Date {
  const day = d.getDay(); // 0 = Sun ... 6 = Sat
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Falak week orbs: gregorian day in the orb, hijri day beneath.
export default function WeekStrip() {
  const locale = useLocale();
  const today = new Date();
  const monday = startOfWeekMonday(today);
  const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const [selected, setSelected] = useState(today.toDateString());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <div className="fk-week" role="tablist">
      {days.map((d) => {
        const isToday = d.toDateString() === today.toDateString();
        return (
          <button
            key={d.toISOString()}
            type="button"
            role="tab"
            aria-selected={selected === d.toDateString()}
            onClick={() => setSelected(d.toDateString())}
            className={cn("fk-orb", isToday && "today")}
          >
            <span className="dn">{weekdayFmt.format(d)}</span>
            <span className="c">{d.getDate()}</span>
            <span className="h">{hijriDay(d, locale)}</span>
          </button>
        );
      })}
    </div>
  );
}
