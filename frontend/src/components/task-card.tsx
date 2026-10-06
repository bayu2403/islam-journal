"use client";

import { useTranslations } from "next-intl";
import { Landmark, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskCardTask = {
  schedule_id: string;
  title: string;
  is_system_title: boolean;
  summary: string | null;
  dalil: string | null;
  category: "akhirat" | "dunia";
  time: string | null;
  prayer_key: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | null;
  source: "quick_add" | "journal";
  recurrence: string;
  status: "done" | "skipped" | null;
};

// summary format: "…benefit text… (HR. Xxx no. N)" — split on the last "("
// so the hadith source can be rendered visually distinct.
function splitSummary(summary: string): { benefit: string; source: string | null } {
  const idx = summary.lastIndexOf("(");
  if (idx <= 0) return { benefit: summary, source: null };
  return { benefit: summary.slice(0, idx).trim(), source: summary.slice(idx).trim() };
}

export default function TaskCard({
  task,
  variant,
  emptyMessage,
  onAction,
  onOpen,
}: {
  task: TaskCardTask | null;
  variant: "akhirat" | "dunia";
  emptyMessage: string;
  onAction: (status: "done" | "skipped") => void;
  onOpen: () => void;
}) {
  const t = useTranslations("Dashboard");
  const sys = useTranslations();
  const isAkhirat = variant === "akhirat";
  const Icon = isAkhirat ? Landmark : Sparkles;
  const accentClass = isAkhirat ? "text-reward" : "text-primary";

  const wrapperClass = cn(
    "rounded-2xl p-5 ring-1 ring-foreground/10",
    isAkhirat
      ? "bg-card-inverse text-card-inverse-foreground"
      : "bg-card text-card-foreground",
  );

  if (!task) {
    return (
      <div className={cn(wrapperClass, "flex min-h-[8rem] flex-col items-center justify-center gap-2 text-center")}>
        <Icon className={cn("h-5 w-5", accentClass)} />
        <span className={cn("text-[11px] font-semibold uppercase tracking-wide", accentClass)}>
          {t(variant)}
        </span>
        <p className="text-sm opacity-70">{emptyMessage}</p>
      </div>
    );
  }

  const title = task.is_system_title ? sys(task.title) : task.title;
  const { benefit, source } = task.summary ? splitSummary(task.summary) : { benefit: "", source: null };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(wrapperClass, "cursor-pointer transition-transform active:scale-[0.99]")}
    >
      <div className="flex items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5", accentClass)} />
        <span className={cn("text-[11px] font-semibold uppercase tracking-wide", accentClass)}>
          {t(variant)}
        </span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug">{title}</h3>
      {benefit && (
        <p className="mt-1 line-clamp-2 text-sm opacity-90">
          {benefit}
          {source && <span className={cn("italic opacity-80", accentClass)}> {source}</span>}
        </p>
      )}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction("done");
          }}
          className="h-8 rounded-full bg-accent px-4 text-xs font-medium text-accent-foreground"
        >
          {t("dikerjakan")}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction("skipped");
          }}
          className="h-8 rounded-full border border-current/30 px-4 text-xs opacity-80"
        >
          {t("lewati")}
        </button>
      </div>
    </div>
  );
}
