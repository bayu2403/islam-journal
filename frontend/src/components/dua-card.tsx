"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function DuaCard({ windows }: { windows: Windows }) {
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
    <Card className="bg-secondary text-secondary-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          {t("duaOfTheMoment")}
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
            {cat(dua.time_category === "any" ? category : dua.time_category)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p dir="rtl" lang="ar" className="text-right text-2xl leading-loose">{dua.arabic}</p>
        <p className="text-sm italic text-muted-foreground">{dua.latin}</p>
        <p className="text-sm">{dua.translations[locale] ?? dua.translations.id}</p>
      </CardContent>
    </Card>
  );
}
