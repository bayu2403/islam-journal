"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { hijriParts } from "@/lib/hijri";
import type { PrayerTimes } from "@/lib/use-prayer-times";
import { cn } from "@/lib/utils";

const KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
type Key = (typeof KEYS)[number];

// Offline fallback (Jakarta-ish) so the orbit never renders empty.
export const FALLBACK_TIMES: Record<Key, string> = {
  fajr: "04:42",
  dhuhr: "12:00",
  asr: "15:21",
  maghrib: "17:55",
  isha: "19:08",
};

// Arc geometry (viewBox 340×206): centre (170,176), radius 150, Subuh on the
// left horizon, Isya on the right; f ∈ [0,1] is the fraction of fajr→isha.
const CX = 170;
const CY = 176;
const R = 150;
const pt = (f: number, r = R) => [CX - r * Math.cos(Math.PI * f), CY - r * Math.sin(Math.PI * f)] as const;
const mins = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const pad = (n: number) => String(n).padStart(2, "0");

// Ticks once a second after mount; null during SSR so server and client HTML match.
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return now;
}

// Next prayer after `now` and seconds until it (after Isya → tomorrow's Subuh).
export function nextPrayer(times: Record<Key, string>, now: Date) {
  const sec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  for (const k of KEYS) {
    const at = mins(times[k]) * 60;
    if (at > sec) return { key: k, time: times[k], seconds: at - sec };
  }
  return { key: "fajr" as Key, time: times.fajr, seconds: 86400 - sec + mins(times.fajr) * 60 };
}

export function formatCountdown(s: number) {
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export default function PrayerOrbit({
  times,
  className,
  style,
}: {
  times: PrayerTimes | null;
  className?: string;
  style?: React.CSSProperties;
}) {
  const t = useTranslations("Orbit");
  const p = useTranslations("Prayer");
  const locale = useLocale();
  const now = useNow();
  const tt: Record<Key, string> = times ?? FALLBACK_TIMES;

  const start = mins(tt.fajr);
  const span = Math.max(1, mins(tt.isha) - start);
  const frac = (m: number) => Math.min(1, Math.max(0, (m - start) / span));
  const nowMin = now ? now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60 : null;
  const sunF = nowMin === null ? null : frac(nowMin);
  const next = now ? nextPrayer(tt, now) : null;

  const greg = now
    ? new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(now)
    : "—";
  const h = now ? hijriParts(now, locale) : null;

  const [sx, sy] = sunF === null ? [0, 0] : pt(sunF);
  const aria = now && next ? t("aria", { time: `${pad(now.getHours())}:${pad(now.getMinutes())}`, prayer: p(next.key) }) : t("title");

  return (
    <section
      className={cn("fk-orbit fk-glass", className)}
      style={{ borderRadius: "var(--radius-xl)", padding: 18, ...style }}
      aria-label={t("title")}
    >
      <div className="fk-orbit-dates">
        <div>
          <span className="fk-hud fk-muted">{t("gregorian")}</span>
          <span className="v">{greg}</span>
        </div>
        <div>
          <span className="fk-hud fk-muted">{t("hijri")}</span>
          <span className="v">{h ? `${h.day} ${h.month} ${h.year}` : "—"}</span>
        </div>
      </div>
      <div className="relative">
        <svg className="arc" viewBox="0 0 340 206" role="img" aria-label={aria}>
          <line className="horizon" x1="0" y1={CY} x2="340" y2={CY} />
          <path className="track" d={`M20 ${CY} A${R} ${R} 0 0 1 320 ${CY}`} />
          {sunF !== null && sunF > 0 && (
            <path
              className="prog"
              pathLength={100}
              strokeDasharray={100}
              d={`M20 ${CY} A${R} ${R} 0 0 1 ${sx.toFixed(1)} ${sy.toFixed(1)}`}
            />
          )}
          {KEYS.map((k) => {
            const f = frac(mins(tt[k]));
            const [x, y] = pt(f);
            const edge = f <= 0.02 || f >= 0.98;
            const [lx, ly] = edge ? [x, CY + 20] : pt(f, R + 16);
            const past = nowMin !== null && mins(tt[k]) <= nowMin;
            const isNext = next?.key === k;
            return (
              <g key={k}>
                <circle className={cn("node", past && "past", isNext && "next")} cx={x} cy={y} r={isNext ? 6 : 5} />
                <text
                  className={cn("lbl", isNext && "next")}
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {p(k)}
                </text>
              </g>
            );
          })}
          {sunF !== null && (
            <>
              <circle className="bloom" cx={sx} cy={sy} r={12} />
              <circle className="sun" cx={sx} cy={sy} r={7} />
            </>
          )}
        </svg>
        <div className="fk-count">
          <span className="fk-hud fk-muted">
            {next ? t("toward", { prayer: p(next.key), time: next.time }) : " "}
          </span>
          <span className="t" aria-live="off">
            {next ? formatCountdown(next.seconds) : "--:--:--"}
          </span>
        </div>
      </div>
    </section>
  );
}
