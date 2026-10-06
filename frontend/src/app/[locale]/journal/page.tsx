"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarPlus, Trash2 } from "lucide-react";
import { api, invalidate } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import TopBar from "@/components/top-bar";
import WeekStrip from "@/components/week-strip";
import RecurrencePicker, { type Recurrence } from "@/components/recurrence-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

  const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date());

  if (view === "main") {
    return (
      <>
        <TopBar title={t("title")} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-6">
          <div>
            <h1 className="font-serif text-2xl font-semibold leading-snug">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div>
            <h2 className="mb-3 font-serif text-xl font-bold">{month}</h2>
            <WeekStrip />
          </div>

          <div>
            <h2 className="mb-3 font-serif text-lg font-bold">{t("planTomorrow")}</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setView("akhirat")}
                className="rounded-2xl bg-card-inverse p-4 text-left text-card-inverse-foreground shadow-lg transition-transform active:scale-[0.99]"
              >
                <span className="block text-base font-bold">{dash("akhirat")}</span>
                <span className="mt-1 block text-xs opacity-80">{t("akhiratDesc")}</span>
              </button>
              <button
                onClick={() => setView("dunia")}
                className="rounded-2xl border bg-card p-4 text-left shadow-sm transition-transform active:scale-[0.99]"
              >
                <span className="block text-base font-bold">{dash("dunia")}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{t("duniaDesc")}</span>
              </button>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-serif text-lg font-bold">{t("dailyJournal")}</h2>
            <div className="grid grid-cols-3 gap-2">
              {[t("catatanIlmu"), t("journalKesehatan"), t("journalPenghargaan")].map((label) => (
                <div
                  key={label}
                  className="relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border bg-card p-3 text-center opacity-60"
                >
                  <span className="text-xs font-medium">{label}</span>
                  <Badge variant="secondary" className="text-[9px]">
                    {t("comingSoon")}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (view === "akhirat") {
    const templates = (data?.system ?? []).filter((tpl) => tpl.category === "akhirat");
    return (
      <>
        <TopBar title={dash("akhirat")} onBack={() => setView("main")} backLabel={common("back")} />
        <div className="flex flex-1 flex-col gap-3 p-4 pb-6">
          {templates.map((tpl) => {
            const allScheduled = tpl.template_items.every((i) => scheduledIds.has(i.id));
            const hasPrayerLink = tpl.template_items.some((i) => i.prayer_key);
            return (
              <Card key={tpl.id}>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <CardTitle className="text-sm">{sys(tpl.name)}</CardTitle>
                  <Button
                    size="sm"
                    variant={allScheduled ? "secondary" : "default"}
                    onClick={() => setPickerFor({ items: tpl.template_items, category: "akhirat", time: null })}
                  >
                    <CalendarPlus className="mr-1 h-4 w-4" />
                    {allScheduled ? t("scheduled") : t("activate")}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 pb-3 pt-0">
                  {tpl.summary && <p className="text-xs text-muted-foreground">{tpl.summary}</p>}
                  {tpl.kind === "group" && (
                    <div className="space-y-1.5">
                      {tpl.template_items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-muted-foreground">• {sys(item.title)}</span>
                          {item.default_time && (
                            <Badge variant="outline" className="shrink-0 text-[10px]">
                              {item.default_time.slice(0, 5)}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {hasPrayerLink && <p className="text-[11px] italic text-muted-foreground">{t("autoTime")}</p>}
                </CardContent>
              </Card>
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
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">{t("myTemplates")}</h2>
          {(data?.mine ?? []).map((tpl) => {
            const allScheduled = tpl.template_items.every((i) => scheduledIds.has(i.id));
            return (
              <Card key={tpl.id}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 py-3">
                  <CardTitle className="text-sm">{tpl.name}</CardTitle>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="time"
                      aria-label={t("timeLabel")}
                      value={times[tpl.id] ?? ""}
                      onChange={(e) => setTimes((prev) => ({ ...prev, [tpl.id]: e.target.value }))}
                      className="h-7 w-[6.5rem] px-1.5 text-xs"
                    />
                    <Button
                      size="sm"
                      variant={allScheduled ? "secondary" : "default"}
                      onClick={() =>
                        setPickerFor({ items: tpl.template_items, category: "dunia", time: times[tpl.id] || null })
                      }
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => removeTemplate(tpl.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {tpl.kind === "group" && (
                  <CardContent className="space-y-1 pb-3 pt-0">
                    {tpl.template_items.map((item) => (
                      <p key={item.id} className="text-sm text-muted-foreground">• {item.title}</p>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">{t("newTemplate")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4 pt-0">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t("templateName")} />
              <Textarea
                value={newItems}
                onChange={(e) => setNewItems(e.target.value)}
                placeholder={t("templateItems")}
                rows={3}
              />
              <Button size="sm" onClick={createTemplate} disabled={!newName.trim() || !newItems.trim()}>
                {t("save")}
              </Button>
            </CardContent>
          </Card>
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
