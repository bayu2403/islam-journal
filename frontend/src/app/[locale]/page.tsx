"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/components/auth-provider";
import { api, todayStr, todayDow } from "@/lib/api";
import { usePrayerTimes, type PrayerTimes } from "@/lib/use-prayer-times";
import { formatHijri } from "@/lib/hijri";
import DuaCard from "@/components/dua-card";
import TaskCard from "@/components/task-card";
import AllTasksList, { type AllTasksTask } from "@/components/all-tasks-list";
import DalilDialog from "@/components/dalil-dialog";

type Profile = {
  display_name: string | null;
  prayer_windows: Record<"morning" | "afternoon" | "evening" | "night", [number, number]>;
};

export type TodayTask = {
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

function effTimeOf(task: TodayTask, prayerTimes: PrayerTimes | null): string | null {
  if (task.prayer_key && prayerTimes) return prayerTimes[task.prayer_key];
  return task.time ? task.time.slice(0, 5) : null;
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const { session, loading } = useAuth();
  const prayerTimes = usePrayerTimes();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<TodayTask[] | null>(null);
  const [dialogTask, setDialogTask] = useState<TodayTask | null>(null);

  useEffect(() => {
    if (!session) return;
    api<Profile>("/profile", {}, 60_000).then(setProfile).catch(() => {});
  }, [session]);

  const loadTasks = useCallback(() => {
    api<TodayTask[]>(`/todos/today?date=${todayStr()}&dow=${todayDow()}`)
      .then(setTasks)
      .catch(() => setTasks([]));
  }, []);

  useEffect(() => {
    if (!session) return;
    loadTasks();
  }, [session, loadTasks]);

  async function setStatus(scheduleId: string, status: "done" | "skipped" | "pending") {
    setTasks(
      (prev) =>
        prev?.map((x) =>
          x.schedule_id === scheduleId ? { ...x, status: status === "pending" ? null : status } : x,
        ) ?? null,
    );
    try {
      await api(`/todos/${scheduleId}/status`, {
        method: "POST",
        body: JSON.stringify({ date: todayStr(), dow: todayDow(), status }),
      });
    } catch {
      loadTasks(); // rollback to server truth
    }
  }

  if (loading) return null;

  const name = profile?.display_name || t("guestName");
  const windows = profile?.prayer_windows ?? {
    morning: [5, 10],
    afternoon: [10, 15],
    evening: [15, 18],
    night: [18, 5],
  };

  const resolved = (tasks ?? []).map((task) => ({ ...task, effTime: effTimeOf(task, prayerTimes) }));
  const sorted = [...resolved].sort((a, b) => {
    if (a.effTime === null && b.effTime === null) return 0;
    if (a.effTime === null) return 1;
    if (b.effTime === null) return -1;
    return a.effTime.localeCompare(b.effTime);
  });

  function categoryCurrent(cat: "akhirat" | "dunia") {
    return sorted.find((x) => x.category === cat && x.status === null) ?? null;
  }
  function categoryEmptyMessage(cat: "akhirat" | "dunia") {
    return sorted.some((x) => x.category === cat) ? t("allDone") : t("noTasks");
  }

  const akhiratCurrent = categoryCurrent("akhirat");
  const duniaCurrent = categoryCurrent("dunia");

  const now = new Date();
  const dayNum = new Intl.DateTimeFormat(locale, { day: "numeric" }).format(now);
  const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(now);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(now);
  const year = new Intl.DateTimeFormat(locale, { year: "numeric" }).format(now);
  const hijri = formatHijri(now, locale);

  function handleAllTasksToggle(task: AllTasksTask) {
    setStatus(task.schedule_id, task.status === "done" ? "pending" : "done");
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pb-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold leading-snug">
          {t("assalamu", { name })} 🌼
        </h1>
        <p className="text-sm text-muted-foreground">{t("startDay")}</p>
      </div>

      <DuaCard windows={windows} />

      <div>
        <h2 className="mb-3 font-serif text-xl font-bold">{t("todayPlanTitle")}</h2>
        <div className="rounded-3xl bg-accent/40 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-5xl leading-none font-bold">{dayNum}</div>
              <div className="mt-1 text-lg font-medium">{month}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{weekday}</div>
              <div className="text-sm text-muted-foreground">{year}</div>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{hijri}</p>

          {session && (
            <>
              <div className="mt-4 space-y-3">
                <TaskCard
                  task={akhiratCurrent}
                  variant="akhirat"
                  emptyMessage={categoryEmptyMessage("akhirat")}
                  onAction={(status) => akhiratCurrent && setStatus(akhiratCurrent.schedule_id, status)}
                  onOpen={() => akhiratCurrent && setDialogTask(akhiratCurrent)}
                />
                <TaskCard
                  task={duniaCurrent}
                  variant="dunia"
                  emptyMessage={categoryEmptyMessage("dunia")}
                  onAction={(status) => duniaCurrent && setStatus(duniaCurrent.schedule_id, status)}
                  onOpen={() => duniaCurrent && setDialogTask(duniaCurrent)}
                />
              </div>

              <div className="mt-4">
                <AllTasksList tasks={sorted} onToggle={handleAllTasksToggle} onAdded={loadTasks} />
              </div>
            </>
          )}
        </div>
      </div>

      <DalilDialog
        task={dialogTask}
        open={!!dialogTask}
        onOpenChange={(o) => {
          if (!o) setDialogTask(null);
        }}
      />
    </div>
  );
}
