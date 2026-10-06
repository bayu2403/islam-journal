"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { PenLine } from "lucide-react";
import { api, todayStr } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

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
    <section className="fk-story fk-glass">
      <div className="fk-sect-head">
        <h2 className="fk-h2 flex items-center gap-2">
          <PenLine className="fk-i" style={{ color: "var(--primary)" }} />
          {t("storyToday")}
        </h2>
      </div>
      <textarea
        value={body}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("storyPlaceholder")}
        aria-label={t("storyToday")}
      />
      <div className="foot">
        <span className="fk-data fk-muted">{body.length}</span>
        <span
          aria-live="polite"
          className={cn("fk-saved fk-hud fk-muted transition-opacity", saved ? "opacity-100" : "opacity-0")}
        >
          {t("saved")}
        </span>
      </div>
    </section>
  );
}
