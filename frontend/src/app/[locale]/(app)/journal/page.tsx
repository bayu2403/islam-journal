"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, BookOpen, CalendarPlus, Check, HandHeart, HeartPulse, Landmark, Sparkles, Trash2 } from "lucide-react";
import { api, invalidate } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import TopBar from "@/components/top-bar";
import WeekStrip from "@/components/week-strip";
import RecurrencePicker, { type Recurrence } from "@/components/recurrence-picker";
import Khatam from "@/components/falak/khatam";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  title: string;
  sort_order: number;
  summary: string | null;
  dalil: string | null;
  default_time: string | null;
  prayer_key: string | null;
};
type Template = {
  id: string;
  kind: "group" | "single";
  name: string;
  is_system: boolean;
  category: "akhirat" | "dunia";
  summary: string | null;
  dalil: string | null;
  template_items: Item[];
};
type TemplatesResponse = { system: Template[]; mine: Template[] };

type PickerState = { items: Item[]; category: "akhirat" | "dunia"; time: string | null };

const enter = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default function JournalPage() {
  const t = useTranslations("Journal");
  const dash = useTranslations("Dashboard");
  const common = useTranslations("Common");
  const sys = useTranslations();
  const locale = useLocale();
  const { session } = useAuth();
  const [view, setView] = useState<"main" | "akhirat" | "dunia">("main");
  const [data, setData] = useState<TemplatesResponse | null>(null);
  const [pickerFor, setPickerFor] = useState<PickerState | null>(null);
  const [scheduledIds, setScheduledIds] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState("");
  const [newItems, setNewItems] = useState("");
  const [times, setTimes] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    api<TemplatesResponse>("/templates", {}, 30_000).then(setData).catch(() => {});
  }, []);
  useEffect(() => {
    if (view !== "main" && session) load();
  }, [view, session, load]);

  async function schedule(items: Item[], r: Recurrence, category: "akhirat" | "dunia", scheduledTime: string | null) {
    await Promise.all(
      items.map((item) =>
        api("/todos", {
          method: "POST",
          body: JSON.stringify({
            template_item_id: item.id,
            source: "journal",
            category,
            scheduled_time: scheduledTime,
            ...r,
          }),
        }),
      ),
    );
    setScheduledIds((prev) => new Set([...prev, ...items.map((i) => i.id)]));
  }

  async function createTemplate() {
    const items = newItems.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!newName.trim() || items.length === 0) return;
    await api("/templates", {
      method: "POST",
      body: JSON.stringify({ name: newName.trim(), kind: items.length > 1 ? "group" : "single", items }),
    });
    setNewName(""); setNewItems("");
    invalidate("GET:/templates"); load();
  }

  async function removeTemplate(id: string) {
    await api(`/templates/${id}`, { method: "DELETE" });
    invalidate("GET:/templates"); load();
  }

  const month = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date());

  if (view === "main") {
    const journals = [
      { label: t("catatanIlmu"), icon: BookOpen },
      { label: t("journalKesehatan"), icon: HeartPulse },
      { label: t("journalPenghargaan"), icon: HandHeart },
    ];
    return (
      <div className="flex flex-1 flex-col gap-6 px-4 pt-9 pb-6">
        <header className="fk-enter flex flex-col gap-2" style={enter(0)}>
          <span className="fk-hud fk-muted">{month}</span>
          <h1 className="fk-display">{t("title")}</h1>
          <p className="fk-small fk-muted m-0">{t("subtitle")}</p>
        </header>

        <div className="fk-glass fk-enter" style={{ ...enter(1), padding: "14px 10px" }}>
          <WeekStrip />
        </div>

        <section className="fk-sect fk-enter" style={enter(2)}>
          <div className="fk-sect-head">
            <h2 className="fk-h2">{t("planTomorrow")}</h2>
          </div>
          <div className="fk-plan">
            <button
              type="button"
              onClick={() => setView("akhirat")}
              className="fk-task fk-holo text-left"
              style={{ minHeight: 152, padding: 16 }}
            >
              <Khatam />
              <span className="fk-tag">
                <Landmark className="fk-i sm" />
              </span>
              <span className="fk-title">{dash("akhirat")}</span>
              <span className="fk-task-sum">{t("akhiratDesc")}</span>
              <span className="fk-link mt-auto">
                {t("activate")}
                <ArrowRight className="fk-i sm" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => setView("dunia")}
              className="fk-task fk-dunia text-left"
              style={{ minHeight: 152, padding: 16 }}
            >
              <span className="fk-tag">
                <Sparkles className="fk-i sm" />
              </span>
              <span className="fk-title">{dash("dunia")}</span>
              <span className="fk-task-sum">{t("duniaDesc")}</span>
              <span className="fk-link mt-auto">
                {t("activate")}
                <ArrowRight className="fk-i sm" />
              </span>
            </button>
          </div>
        </section>

        <section className="fk-sect fk-enter" style={enter(3)}>
          <div className="fk-sect-head">
            <h2 className="fk-h2">{t("dailyJournal")}</h2>
          </div>
          <div className="fk-tpl-row -mx-4 px-4">
            {journals.map(({ label, icon: Icon }) => (
              <div key={label} className="fk-tpl fk-glass" aria-disabled="true">
                <span className="fk-badge n">{t("comingSoon")}</span>
                <span className="ic">
                  <Icon className="fk-i" />
                </span>
                <p className="fk-title">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (view === "akhirat") {
    const templates = (data?.system ?? []).filter((tpl) => tpl.category === "akhirat");
    return (
      <>
        <TopBar title={dash("akhirat")} onBack={() => setView("main")} backLabel={common("back")} />
        <div className="flex flex-1 flex-col gap-3 p-4 pb-6">
          {data === null &&
            [0, 1, 2].map((i) => <div key={i} className="fk-skel h-28" style={{ borderRadius: "var(--radius-lg)" }} />)}
          {templates.map((tpl, i) => {
            const allScheduled = tpl.template_items.every((it) => scheduledIds.has(it.id));
            const hasPrayerLink = tpl.template_items.some((it) => it.prayer_key);
            return (
              <article key={tpl.id} className="fk-glass fk-enter flex flex-col gap-3" style={enter(i)}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="fk-title">{sys(tpl.name)}</h3>
                  <button
                    type="button"
                    className={cn("fk-btn sm", allScheduled ? "fk-btn-outline" : "fk-btn-primary")}
                    onClick={() => setPickerFor({ items: tpl.template_items, category: "akhirat", time: null })}
                  >
                    {allScheduled ? <Check className="fk-i sm" /> : <CalendarPlus className="fk-i sm" />}
                    {allScheduled ? t("scheduled") : t("activate")}
                  </button>
                </div>
                {tpl.summary && <p className="fk-small fk-muted m-0">{tpl.summary}</p>}
                {tpl.kind === "group" && (
                  <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                    {tpl.template_items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-primary" />
                          {sys(item.title)}
                        </span>
                        {item.default_time && <span className="fk-data fk-muted">{item.default_time.slice(0, 5)}</span>}
                      </li>
                    ))}
                  </ul>
                )}
                {hasPrayerLink && <span className="fk-hud fk-muted">{t("autoTime")}</span>}
              </article>
            );
          })}
        </div>

        <RecurrencePicker
          open={pickerFor !== null}
          onClose={() => setPickerFor(null)}
          onPick={(r) => pickerFor && schedule(pickerFor.items, r, pickerFor.category, pickerFor.time)}
        />
      </>
    );
  }

  // view === "dunia"
  return (
    <>
      <TopBar title={dash("dunia")} onBack={() => setView("main")} backLabel={common("back")} />
      <div className="flex flex-1 flex-col gap-6 p-4 pb-6">
        <section className="fk-sect">
          <span className="fk-hud fk-muted">{t("myTemplates")}</span>
          {(data?.mine ?? []).map((tpl, i) => {
            const allScheduled = tpl.template_items.every((it) => scheduledIds.has(it.id));
            return (
              <article key={tpl.id} className="fk-glass fk-enter flex flex-col gap-3" style={enter(i)}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="fk-title">{tpl.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      aria-label={t("timeLabel")}
                      value={times[tpl.id] ?? ""}
                      onChange={(e) => setTimes((prev) => ({ ...prev, [tpl.id]: e.target.value }))}
                      className="fk-input"
                      style={{ height: 32, width: "6.75rem", padding: "0 8px", fontSize: 13 }}
                    />
                    <button
                      type="button"
                      className={cn("fk-btn sm icon", allScheduled ? "fk-btn-outline" : "fk-btn-primary")}
                      style={{ width: 32 }}
                      aria-label={allScheduled ? t("scheduled") : t("activate")}
                      onClick={() =>
                        setPickerFor({ items: tpl.template_items, category: "dunia", time: times[tpl.id] || null })
                      }
                    >
                      {allScheduled ? <Check className="fk-i sm" /> : <CalendarPlus className="fk-i sm" />}
                    </button>
                    <button
                      type="button"
                      className="fk-btn fk-btn-outline sm icon"
                      style={{ width: 32 }}
                      aria-label={t("delete")}
                      onClick={() => removeTemplate(tpl.id)}
                    >
                      <Trash2 className="fk-i sm" />
                    </button>
                  </div>
                </div>
                {tpl.kind === "group" && (
                  <ul className="m-0 flex list-none flex-col gap-1 p-0">
                    {tpl.template_items.map((item) => (
                      <li key={item.id} className="fk-small fk-muted flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-primary" />
                        {item.title}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}

          <article className="fk-glass flex flex-col gap-3">
            <h3 className="fk-title">{t("newTemplate")}</h3>
            <label className="fk-field">
              <span className="fk-label">{t("templateName")}</span>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </label>
            <label className="fk-field">
              <span className="fk-label">{t("templateItems")}</span>
              <Textarea value={newItems} onChange={(e) => setNewItems(e.target.value)} rows={3} />
            </label>
            <button
              type="button"
              className="fk-btn fk-btn-primary self-start"
              onClick={createTemplate}
              disabled={!newName.trim() || !newItems.trim()}
            >
              {t("save")}
            </button>
          </article>
        </section>
      </div>

      <RecurrencePicker
        open={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onPick={(r) => pickerFor && schedule(pickerFor.items, r, pickerFor.category, pickerFor.time)}
      />
    </>
  );
}
