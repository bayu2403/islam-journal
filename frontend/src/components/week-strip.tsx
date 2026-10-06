"use client";

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

export default function WeekStrip() {
  const locale = useLocale();
  const today = new Date();
  const monday = startOfWeekMonday(today);
  const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: "short" });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => {
        const isToday = d.toDateString() === today.toDateString();
        return (
          <div key={d.toISOString()} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase text-muted-foreground">
              {weekdayFmt.format(d)}
            </span>
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-full",
                isToday
                  ? "h-11 w-11 bg-accent text-accent-foreground shadow-sm"
                  : "h-9 w-9 bg-muted/60 text-foreground",
              )}
            >
              <span className={cn("leading-none font-bold", isToday ? "text-base" : "text-sm")}>
                {d.getDate()}
              </span>
              <span className="text-[9px] leading-none opacity-70">{hijriDay(d, locale)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
