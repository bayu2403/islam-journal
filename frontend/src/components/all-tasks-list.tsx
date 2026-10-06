"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import QuickAdd from "@/components/quick-add";
import { Badge } from "@/components/ui/badge";

export type AllTasksTask = {
  schedule_id: string;
  title: string;
  is_system_title: boolean;
  category: "akhirat" | "dunia";
  status: "done" | "skipped" | null;
  effTime: string | null;
};

export default function AllTasksList({
  tasks,
  onToggle,
  onAdded,
}: {
  tasks: AllTasksTask[];
  onToggle: (task: AllTasksTask) => void;
  onAdded: () => void;
}) {
  const t = useTranslations("Dashboard");
  const sys = useTranslations();
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 text-sm font-medium text-foreground"
          aria-expanded={open}
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {t("allTasks")}
        </button>
        <QuickAdd onAdded={onAdded} />
      </div>

      {open &&
        (tasks.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t("noTasks")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {tasks.map((task) => {
              const title = task.is_system_title ? sys(task.title) : task.title;
              const statusLabel =
                task.status === "done"
                  ? t("statusDone")
                  : task.status === "skipped"
                    ? t("statusSkipped")
                    : t("statusPending");
              return (
                <li
                  key={task.schedule_id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  <input
                    type="checkbox"
                    checked={task.status === "done"}
                    onChange={() => onToggle(task)}
                    className="h-5 w-5 accent-[var(--primary)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{task.effTime ?? "—"}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {t(task.category)}
                      </Badge>
                    </div>
                  </div>
                  <Badge
                    variant={
                      task.status === "done"
                        ? "default"
                        : task.status === "skipped"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {statusLabel}
                  </Badge>
                </li>
              );
            })}
          </ul>
        ))}
    </div>
  );
}
