"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

type ActivityRow = {
  completed_at: string;
  on_date: string;
  status: "done" | "skipped";
  title: string;
  is_system_title: boolean;
};

// "Riwayat ibadahku" — latest completions as a Falak timeline.
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
    <div className="fk-glass">
      <span className="fk-hud fk-muted">{t("worshipHistory")}</span>
      {rows === null ? (
        <div className="mt-3 space-y-2" aria-label={sys("Common.loading")}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="fk-skel h-4" style={{ width: `${80 - i * 15}%` }} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="fk-small fk-muted mt-3 mb-0">{t("emptyActivity")}</p>
      ) : (
        <ul className="fk-feed mt-2">
          {rows.map((row, i) => {
            const title = row.is_system_title ? sys(row.title) : row.title;
            const skipped = row.status === "skipped";
            return (
              <li key={i} className="fk-enter" style={{ "--i": Math.min(i, 8) } as React.CSSProperties}>
                <span className="t">{timeFmt.format(new Date(row.completed_at))}</span>
                <span className={cn("dot", skipped && "skip")} />
                <span className={cn("x", skipped && "fk-muted")}>
                  {t(skipped ? "activitySkipped" : "activityDone", { name, title })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
