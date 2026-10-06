"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/components/auth-provider";
import { api, todayStr, todayDow } from "@/lib/api";
import { usePrayerTimes, type PrayerTimes } from "@/lib/use-prayer-times";
import DuaCard from "@/components/dua-card";
import TaskCard from "@/components/task-card";
import AllTasksList, { type AllTasksTask } from "@/components/all-tasks-list";
import DalilDialog from "@/components/dalil-dialog";
import QuickAdd from "@/components/quick-add";
import PrayerOrbit, { useNow } from "@/components/falak/prayer-orbit";

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

const enter = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const prayer = useTranslations("Prayer");
  const locale = useLocale();
  const { session, loading } = useAuth();
  const prayerTimes = usePrayerTimes();
  const now = useNow();
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
  function timeLabel(task: (typeof sorted)[number] | null) {
    if (!task?.effTime) return null;
    return task.prayer_key ? `${prayer(task.prayer_key)} · ${task.effTime}` : task.effTime;
  }

  const akhiratCurrent = categoryCurrent("akhirat");
  const duniaCurrent = categoryCurrent("dunia");

  const clock = now
    ? `${new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(now)} · ${new Intl.DateTimeFormat(locale, { weekday: "long" }).format(now)}`
    : " ";

  function handleAllTasksToggle(task: AllTasksTask) {
    setStatus(task.schedule_id, task.status === "done" ? "pending" : "done");
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 pt-9 pb-4">
      <header className="fk-enter flex flex-col gap-2" style={enter(0)}>
        <span className="fk-hud fk-muted">{clock}</span>
        <h1 className="fk-display">
          {t("greeting")} <span className="fk-grad">{name}</span>
        </h1>
        <p className="fk-small fk-muted m-0">{t("startDay")}</p>
      </header>

      <PrayerOrbit times={prayerTimes} className="fk-enter" style={enter(1)} />

      {session && (
        <>
          <section className="fk-sect fk-enter" style={enter(2)}>
            <div className="fk-sect-head">
              <h2 className="fk-h2">{t("next")}</h2>
            </div>
            <TaskCard
              key={akhiratCurrent?.schedule_id ?? "akhirat-empty"}
              task={akhiratCurrent}
              variant="akhirat"
              timeLabel={timeLabel(akhiratCurrent)}
              emptyMessage={categoryEmptyMessage("akhirat")}
              onAction={(status) => akhiratCurrent && setStatus(akhiratCurrent.schedule_id, status)}
              onOpen={akhiratCurrent?.dalil ? () => setDialogTask(akhiratCurrent) : undefined}
            />
            <TaskCard
              key={duniaCurrent?.schedule_id ?? "dunia-empty"}
              task={duniaCurrent}
              variant="dunia"
              timeLabel={timeLabel(duniaCurrent)}
              emptyMessage={categoryEmptyMessage("dunia")}
              onAction={(status) => duniaCurrent && setStatus(duniaCurrent.schedule_id, status)}
              onOpen={duniaCurrent?.dalil ? () => setDialogTask(duniaCurrent) : undefined}
            />
          </section>

          <div className="fk-enter" style={enter(3)}>
            <AllTasksList tasks={sorted} onToggle={handleAllTasksToggle} />
          </div>
        </>
      )}

      <DuaCard windows={windows} style={enter(4)} />

      {session && (
        <div className="pointer-events-none sticky bottom-[96px] z-30 -mt-2 flex justify-end pr-1">
          <QuickAdd onAdded={loadTasks} />
        </div>
      )}

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
