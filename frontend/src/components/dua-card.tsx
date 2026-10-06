"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@/lib/api";

type Dua = {
  arabic: string;
  latin: string;
  translations: Record<string, string>;
  time_category: string;
};

type Windows = Record<"morning" | "afternoon" | "evening" | "night", [number, number]>;

export function categoryForHour(hour: number, w: Windows): string {
  if (hour >= w.morning[0] && hour < w.morning[1]) return "morning";
  if (hour >= w.afternoon[0] && hour < w.afternoon[1]) return "afternoon";
  if (hour >= w.evening[0] && hour < w.evening[1]) return "evening";
  return "night"; // wraps evening-end → morning-start
}

export default function DuaCard({ windows, style }: { windows: Windows; style?: React.CSSProperties }) {
  const t = useTranslations("Dashboard");
  const cat = useTranslations("Dua");
  const locale = useLocale();
  const [dua, setDua] = useState<Dua | null>(null);
  const [error, setError] = useState(false);
  const category = categoryForHour(new Date().getHours(), windows);

  useEffect(() => {
    api<Dua>(`/duas/current?category=${category}`)
      .then(setDua)
      .catch(() => setError(true));
  }, [category]);

  if (error || !dua) return null;

  return (
    <article className="fk-dua fk-glass fk-enter" style={style} aria-label={t("duaOfTheMoment")}>
      <div className="fk-sect-head">
        <span className="fk-hud fk-muted">
          {t("duaOfTheMoment")} · {cat(dua.time_category === "any" ? category : dua.time_category)}
        </span>
      </div>
      <p className="fk-arabic md" dir="rtl" lang="ar">{dua.arabic}</p>
      <p className="translit">{dua.latin}</p>
      <p className="meaning">{dua.translations[locale] ?? dua.translations.id}</p>
    </article>
  );
}
