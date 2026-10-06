"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

type ActivityRow = {
  completed_at: string;
  on_date: string;
  status: "done" | "skipped";
  title: string;
  is_system_title: boolean;
};

// "Riwayat ibadahku" — latest completions feed.
export default function ActivityFeed({ name }: { name: string }) {
  const t = useTranslations("Profile");
  const sys = useTranslations();
  const locale = useLocale();
  const { session } = useAuth();
  const [rows, setRows] = useState<ActivityRow[] | null>(null);

  useEffect(() => {
    if (!session) return;
    api<ActivityRow[]>("/activity?limit=20").then(setRows).catch(() => setRows([]));
  }, [session]);

  const timeFmt = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-2xl border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">{t("worshipHistory")}</h3>
      {rows === null ? (
        <p className="text-sm text-muted-foreground">{sys("Common.loading")}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("emptyActivity")}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, i) => {
            const title = row.is_system_title ? sys(row.title) : row.title;
            const skipped = row.status === "skipped";
            return (
              <li key={i} className={skipped ? "opacity-60" : ""}>
                <p className="text-xs text-muted-foreground">
                  {t("atTime", { time: timeFmt.format(new Date(row.completed_at)) })}
                </p>
                <p className={`text-sm ${skipped ? "line-through" : ""}`}>
                  {t(skipped ? "activitySkipped" : "activityDone", { name, title })}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
