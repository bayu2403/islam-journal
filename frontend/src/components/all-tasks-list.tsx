"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AllTasksTask = {
  schedule_id: string;
  title: string;
  is_system_title: boolean;
  category: "akhirat" | "dunia";
  status: "done" | "skipped" | null;
  effTime: string | null;
};

// "Semua task hari ini" — late-check anything skipped or missed.
export default function AllTasksList({
  tasks,
  onToggle,
}: {
  tasks: AllTasksTask[];
  onToggle: (task: AllTasksTask) => void;
}) {
  const t = useTranslations("Dashboard");
  const sys = useTranslations();
  const [open, setOpen] = useState(true);

  return (
    <section className="fk-sect">
      <div className="fk-sect-head">
        <h2 className="fk-h2">{t("allTasks")}</h2>
        <button type="button" onClick={() => setOpen((o) => !o)} className="fk-link" aria-expanded={open}>
          {tasks.filter((x) => x.status === "done").length}/{tasks.length}
          <ChevronDown
            className="fk-i sm"
            style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform var(--duration-fast) var(--ease-spring)" }}
          />
        </button>
      </div>

      {open &&
        (tasks.length === 0 ? (
          <p className="fk-small fk-muted m-0">{t("noTasks")}</p>
        ) : (
          <ul className="fk-list fk-glass" style={{ padding: 4 }}>
            {tasks.map((task) => {
              const title = task.is_system_title ? sys(task.title) : task.title;
              const done = task.status === "done";
              const statusLabel =
                done ? t("statusDone") : task.status === "skipped" ? t("statusSkipped") : t("statusPending");
              return (
                <li key={task.schedule_id} className="fk-row">
                  <span className="t">{task.effTime ?? "—"}</span>
                  <span className="min-w-0">
                    <span className={cn("name truncate", done && "fk-muted")}>{title}</span>
                    <span className="sub">{t(task.category)}</span>
                  </span>
                  <span className="end">
                    <span className={cn("fk-chip", done && "done")}>{statusLabel}</span>
                    <button
                      type="button"
                      className={cn("fk-check", done && "on")}
                      aria-pressed={done}
                      aria-label={title}
                      onClick={() => onToggle(task)}
                    >
                      {done && <Check className="fk-i sm" />}
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        ))}
    </section>
  );
}
