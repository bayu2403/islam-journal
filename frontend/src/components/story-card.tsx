"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { api, todayStr } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { Textarea } from "@/components/ui/textarea";

// "Cerita hari ini" — autosaving daily note (debounced PUT /notes/today).
export default function StoryCard() {
  const t = useTranslations("Profile");
  const { session } = useAuth();
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!session) return;
    api<{ body: string }>(`/notes/today?date=${todayStr()}`)
      .then((n) => setBody(n.body))
      .catch(() => {});
  }, [session]);

  // Clear pending timers on unmount.
  useEffect(
    () => () => {
      clearTimeout(saveTimer.current);
      clearTimeout(savedTimer.current);
    },
    [],
  );

  function onChange(value: string) {
    setBody(value);
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await api("/notes/today", {
          method: "PUT",
          body: JSON.stringify({ date: todayStr(), body: value }),
        });
        setSaved(true);
        clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaved(false), 2000);
      } catch {
        // silent — user keeps typing, next debounce retries
      }
    }, 800);
  }

  return (
    <div className="rounded-2xl bg-accent/30 p-4 ring-1 ring-foreground/5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold">✍️ {t("storyToday")}</h2>
        <span
          aria-live="polite"
          className={`text-xs text-muted-foreground transition-opacity ${saved ? "opacity-100" : "opacity-0"}`}
        >
          {t("saved")}
        </span>
      </div>
      <Textarea
        value={body}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("storyPlaceholder")}
        className="min-h-24 border-transparent bg-background/60"
      />
    </div>
  );
}
