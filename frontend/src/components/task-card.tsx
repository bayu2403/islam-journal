"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Landmark, Sparkles } from "lucide-react";
import Khatam from "@/components/falak/khatam";
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

const reduced = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// Falak task card. Akhirat = holo card (rotating beam + khatam), Dunia = glass.
// Dikerjakan / Lewati play the same-weight exit (up vs. side) before onAction,
// so the parent should key this by schedule_id to replay the entrance.
export default function TaskCard({
  task,
  variant,
  emptyMessage,
  timeLabel,
  onAction,
  onOpen,
}: {
  task: TaskCardTask | null;
  variant: "akhirat" | "dunia";
  emptyMessage: string;
  timeLabel?: string | null;
  onAction: (status: "done" | "skipped") => void;
  onOpen?: () => void;
}) {
  const t = useTranslations("Dashboard");
  const sys = useTranslations();
  const isAkhirat = variant === "akhirat";
  const Icon = isAkhirat ? Landmark : Sparkles;
  const [doneFx, setDoneFx] = useState(false);
  const [leaving, setLeaving] = useState<"up" | "side" | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const cardClass = cn("fk-task", isAkhirat ? "fk-holo" : "fk-dunia");

  if (!task) {
    return (
      <div className={cn(cardClass, "fk-enter cursor-default")}>
        {isAkhirat && <Khatam />}
        <div className="fk-empty" style={{ padding: "12px 8px" }}>
          <div className="khatam-wrap">
            <Khatam className="k" />
            <Check className="fk-i" />
          </div>
          <span className="fk-hud">{t(variant)}</span>
          <p className="fk-small">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const title = task.is_system_title ? sys(task.title) : task.title;
  const { benefit, source } = task.summary ? splitSummary(task.summary) : { benefit: "", source: null };

  function act(status: "done" | "skipped") {
    if (leaving) return;
    if (reduced()) {
      onAction(status);
      return;
    }
    if (status === "done") setDoneFx(true);
    timers.current.push(
      setTimeout(
        () => {
          setLeaving(status === "done" ? "up" : "side");
          timers.current.push(setTimeout(() => onAction(status), 420));
        },
        status === "done" ? 520 : 60,
      ),
    );
  }

  return (
    <article
      tabIndex={onOpen ? 0 : undefined}
      aria-label={`${t(variant)}: ${title}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (onOpen && e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        cardClass,
        leaving === "up" ? "fk-leave-up" : leaving === "side" ? "fk-leave-side" : "fk-enter",
        !onOpen && "cursor-default",
      )}
    >
      {isAkhirat && <Khatam />}
      <div className="fk-task-top">
        <span className="fk-hud">
          <span className="fk-tag">
            <Icon className="fk-i sm" />
          </span>
          {t(variant)}
        </span>
        {timeLabel && <span className="fk-hud">{timeLabel}</span>}
      </div>
      <h3 className="fk-h3 line-clamp-2">{title}</h3>
      {benefit && (
        <p className="fk-task-sum line-clamp-3">
          {benefit} {source && <span className="fk-src">{source}</span>}
        </p>
      )}
      <div className="fk-task-actions">
        <button
          type="button"
          className={cn("fk-pill fk-pill-done", doneFx && "is-done")}
          onClick={(e) => {
            e.stopPropagation();
            act("done");
          }}
        >
          <Check className="fk-i sm chk" />
          {t("dikerjakan")}
        </button>
        <button
          type="button"
          className="fk-pill fk-pill-skip"
          onClick={(e) => {
            e.stopPropagation();
            act("skipped");
          }}
        >
          {t("lewati")}
        </button>
        {isAkhirat && task.dalil && onOpen && (
          <button
            type="button"
            className="fk-link"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            {t("dalil")}
            <ArrowRight className="fk-i sm" />
          </button>
        )}
      </div>
    </article>
  );
}
