"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check, Moon, Orbit, Sun } from "lucide-react";
import { Link, usePathname, useRouter } from "../../../../i18n/routing";
import { usePrayerTimes } from "@/lib/use-prayer-times";
import { hijriParts } from "@/lib/hijri";
import { useTheme, type Gender } from "@/components/theme-provider";
import { WELCOMED_KEY } from "@/components/welcome-gate";
import PrayerOrbit, { FALLBACK_TIMES, formatCountdown, nextPrayer, useNow } from "@/components/falak/prayer-orbit";
import TaskCard, { type TaskCardTask } from "@/components/task-card";
import WeekStrip from "@/components/week-strip";
import Khatam from "@/components/falak/khatam";
import Segmented from "@/components/falak/segmented";
import { cn } from "@/lib/utils";

const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

// Swatch colours mirror the four Falak palettes in globals.css.
const SWATCHES = [
  { g: "ikhwan", m: "dark", bg: "oklch(0.16 0.025 230)", p: "oklch(0.85 0.14 172)", a: "oklch(0.8 0.12 220)" },
  { g: "akhwat", m: "dark", bg: "oklch(0.16 0.03 330)", p: "oklch(0.83 0.12 350)", a: "oklch(0.84 0.1 55)" },
  { g: "ikhwan", m: "light", bg: "oklch(0.975 0.008 200)", p: "oklch(0.47 0.1 182)", a: "oklch(0.87 0.12 172)" },
  { g: "akhwat", m: "light", bg: "oklch(0.975 0.008 340)", p: "oklch(0.5 0.15 350)", a: "oklch(0.87 0.09 55)" },
] as const;

const enter = (i: number) => ({ "--i": i }) as React.CSSProperties;

function demoTask(id: string, title: string, summary: string | null): TaskCardTask {
  return {
    schedule_id: id,
    title,
    is_system_title: false,
    summary,
    dalil: null,
    category: "akhirat",
    time: null,
    prayer_key: null,
    source: "journal",
    recurrence: "daily",
    status: null,
  };
}

export default function WelcomePage() {
  const t = useTranslations("Welcome");
  const p = useTranslations("Prayer");
  const nav = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { gender, mode, setGender, setMode } = useTheme();
  const times = usePrayerTimes();
  const now = useNow();
  const tt = times ?? FALLBACK_TIMES;
  const next = now ? nextPrayer(tt, now) : null;
  const h = now ? hijriParts(now, locale) : null;

  // Interactive holo demo: Dikerjakan / Lewati advance a 3-card queue.
  const queue = [
    { ...demoTask("d1", t("demo1"), t("demo1Sum")), time: "asr" },
    { ...demoTask("d2", t("demo2"), null), time: "after-asr" },
    { ...demoTask("d3", t("demo3"), null), time: "maghrib" },
  ];
  const [qi, setQi] = useState(0);
  const [pillKey, setPillKey] = useState(0);
  const demoLabel = (k: string) =>
    k === "after-asr" ? t("afterAsr") : `${p(k)} · ${tt[k as (typeof PRAYERS)[number]]}`;

  // Light/dark here is explicit (not "system") so the swatches read as a choice.
  // `now` is null until mounted, so the DOM is only read client-side (no hydration mismatch).
  const shownMode: "dark" | "light" =
    mode !== "system" ? mode : now && document.documentElement.classList.contains("dark") ? "dark" : "light";
  const [heroKey, setHeroKey] = useState(0);

  function start() {
    try {
      localStorage.setItem(WELCOMED_KEY, "1");
    } catch {
      // storage blocked — gate stays open, nothing else to do
    }
    router.push("/");
  }

  const tickRow = (
    <div className="row">
      {PRAYERS.map((k, i) => (
        <span key={k}>
          {i === 0 && <em>● </em>}
          {p(k)} <b>{tt[k]}</b>
        </span>
      ))}
      {now && h && (
        <span>
          {new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(now)} <b>·</b> {h.day} {h.month} {h.year}
        </span>
      )}
      <span>
        {t("method")} <b>KEMENAG</b>
      </span>
    </div>
  );

  const cta = (
    <button type="button" className="fk-btn fk-btn-primary" onClick={start}>
      {t("ctaGuest")}
      <ArrowRight className="fk-i sm" />
    </button>
  );

  return (
    <div className="fl">
      <header className="fl-nav">
        <div className="fl-wrap">
          <div className="bar">
            <a className="fl-mark" href="#top">
              <span className="o">
                <Orbit className="fk-i sm" />
              </span>
              Muslim Berislam
            </a>
            <nav className="fl-links" aria-label={t("sections")}>
              <a href="#fitur">{t("navFeatures")}</a>
              <a href="#cara">{t("navHow")}</a>
              <a href="#tema">{t("navThemes")}</a>
              <a href="#tanya">{t("navFaq")}</a>
            </nav>
            <button type="button" className="fk-btn fk-btn-primary" onClick={start}>
              {t("navStart")}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <div className="fk-ground" style={{ marginTop: -84, paddingTop: 84 }}>
          <section className="fl-wrap fl-hero">
            <div className="fk-enter" style={enter(0)}>
              <span className="fk-hud fk-muted">
                <span className="fk-chip live" style={{ height: 22 }}>{t("live")}</span>
                {t("eyebrow")}
              </span>
              <h1 className="fl-h1">
                {t("heroA")} <span className="fk-grad">{t("heroB")}</span>
              </h1>
              <p className="fl-lead">{t("lead")}</p>
              <div className="fl-ctas">
                {cta}
                <a className="fk-btn fk-btn-glass" href="#fitur">{t("ctaFeatures")}</a>
              </div>
              <div className="fl-live">
                <div className="cell fk-glass">
                  <span className="fk-hud fk-muted">{next ? t("toward", { prayer: p(next.key) }) : " "}</span>
                  <span className="v">{next ? formatCountdown(next.seconds) : "--:--:--"}</span>
                </div>
                <div className="cell fk-glass">
                  <span className="fk-hud fk-muted">{t("gregorian")}</span>
                  <span className="v">
                    {now ? new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(now) : "—"}
                  </span>
                </div>
                <div className="cell fk-glass">
                  <span className="fk-hud fk-muted">{t("hijri")}</span>
                  <span className="v">{h ? `${h.day} ${h.month} ${h.year}` : "—"}</span>
                </div>
              </div>
            </div>
            <div className="fl-stage" aria-label={t("stageAria")}>
              <div className="fl-rings" aria-hidden="true">
                <span><i className="planet" /></span>
                <span><i className="planet" /></span>
                <span />
              </div>
              <Khatam />
              <div className="fl-phone fk-enter" style={enter(2)}>
                <PrayerOrbit times={times} />
                <TaskCard
                  key={heroKey}
                  task={queue[0]}
                  variant="akhirat"
                  timeLabel={demoLabel("asr")}
                  emptyMessage=""
                  onAction={() => setHeroKey((k) => k + 1)}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="fl-ticker" aria-hidden="true">
          <div className="track">
            {tickRow}
            {tickRow}
          </div>
        </div>

        <section className="fl-sect" id="fitur">
          <div className="fl-wrap">
            <div className="fl-head">
              <span className="fk-hud" style={{ color: "var(--primary)" }}>{t("navFeatures")}</span>
              <h2 className="fl-h2">{t("featTitle")}</h2>
              <p>{t("featLead")}</p>
            </div>
            <div className="fl-bento">
              <article className="fl-tile fk-glass w4">
                <span className="fk-hud fk-muted">01 · {nav("dashboard")}</span>
                <h3>{t("f1Title")}</h3>
                <p>{t("f1Body")}</p>
                <div className="demo">
                  <PrayerOrbit times={times} />
                </div>
              </article>
              <article className="fl-tile fk-glass">
                <span className="fk-hud fk-muted">02 · Akhirat</span>
                <h3>{t("f2Title")}</h3>
                <div className="demo">
                  {qi < queue.length ? (
                    <TaskCard
                      key={queue[qi].schedule_id}
                      task={queue[qi]}
                      variant="akhirat"
                      timeLabel={demoLabel(queue[qi].time as string)}
                      emptyMessage=""
                      onAction={() => setQi((i) => i + 1)}
                    />
                  ) : (
                    <div className="fk-empty fk-enter" style={{ padding: 16 }}>
                      <div className="khatam-wrap">
                        <Khatam className="k" />
                        <Check className="fk-i" />
                      </div>
                      <p className="fk-title">{t("demoDone")}</p>
                      <button type="button" className="fk-btn fk-btn-glass sm" onClick={() => setQi(0)}>
                        {t("demoReset")}
                      </button>
                    </div>
                  )}
                </div>
                <p>{t("f2Hint")}</p>
              </article>
              <article className="fl-tile fk-glass">
                <span className="fk-hud fk-muted">03 · {t("calendar")}</span>
                <h3>{t("f3Title")}</h3>
                <div className="demo">
                  <WeekStrip />
                </div>
              </article>
              <article className="fl-tile fk-glass w3">
                <span className="fk-hud fk-muted">04 · Dalil</span>
                <h3>{t("f4Title")}</h3>
                <div className="demo">
                  <p className="fk-arabic md" dir="rtl" lang="ar" style={{ color: "var(--foreground)" }}>
                    أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ
                  </p>
                  <p style={{ color: "var(--foreground)" }}>{t("f4Quote")}</p>
                  <span className="fk-src-ink">HR. Bukhari dan Muslim</span>
                </div>
              </article>
              <article className="fl-tile fk-glass w3">
                <span className="fk-hud fk-muted">05 · {t("f5Eyebrow")}</span>
                <h3>{t("f5Title")}</h3>
                <div className="demo">
                  <div className="fk-task-actions" style={{ margin: 0 }}>
                    <button
                      key={pillKey}
                      type="button"
                      className={cn("fk-pill fk-pill-done", pillKey > 0 && "is-done")}
                      onClick={() => setPillKey((k) => k + 1)}
                    >
                      <Check className="fk-i sm chk" />
                      {t("done")}
                    </button>
                    <button type="button" className="fk-pill fk-pill-skip">{t("skip")}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="fk-chip done">{t("chipDone")}</span>
                    <span className="fk-chip">{t("chipSkipped")}</span>
                    <span className="fk-chip">{t("chipPending")}</span>
                  </div>
                </div>
                <p>{t("f5Body")}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="fl-sect" id="cara">
          <div className="fl-wrap">
            <div className="fl-head">
              <span className="fk-hud" style={{ color: "var(--primary)" }}>{t("navHow")}</span>
              <h2 className="fl-h2">{t("howTitle")}</h2>
            </div>
            <ol className="fl-steps">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <h3>{t(`step${n}Title`)}</h3>
                  <p>{t(`step${n}Body`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="fl-sect" id="tema">
          <div className="fl-wrap">
            <div className="fl-head">
              <span className="fk-hud" style={{ color: "var(--primary)" }}>{t("navThemes")}</span>
              <h2 className="fl-h2">{t("themeTitle")}</h2>
              <p>{t("themeLead")}</p>
            </div>
            <div className="fl-sw">
              {SWATCHES.map((s) => {
                const label = `${t(s.g)} · ${t(s.m)}`;
                return (
                  <button
                    key={`${s.g}-${s.m}`}
                    type="button"
                    aria-pressed={gender === s.g && shownMode === s.m}
                    aria-label={t("useTheme", { name: label })}
                    onClick={() => {
                      setGender(s.g as Gender);
                      setMode(s.m);
                    }}
                  >
                    <span className="sky" style={{ background: s.bg }}>
                      <i style={{ background: s.p }} />
                      <b style={{ background: s.a }} />
                    </span>
                    <span className="lbl">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="fl-sect" id="tanya">
          <div className="fl-wrap">
            <div className="fl-head">
              <span className="fk-hud" style={{ color: "var(--primary)" }}>{t("navFaq")}</span>
              <h2 className="fl-h2">{t("faqTitle")}</h2>
            </div>
            <div className="fl-faq">
              {[1, 2, 3, 4, 5].map((n) => (
                <details key={n} className="fk-glass" open={n === 1}>
                  <summary>{t(`q${n}`)}</summary>
                  <p>{t(`a${n}`)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="fl-wrap" id="mulai">
          <div className="fl-cta fk-task fk-holo">
            <Khatam />
            <div>
              <span className="fk-hud">{t("ctaEyebrow")}</span>
              <h2 className="fl-h2" style={{ marginTop: 16 }}>{t("ctaTitle")}</h2>
              <p>{t("ctaBody")}</p>
              <button
                type="button"
                className="fk-btn fk-btn-primary"
                style={{ height: 52, padding: "0 24px", borderRadius: "var(--radius-full)" }}
                onClick={start}
              >
                {t("ctaGuest")}
                <ArrowRight className="fk-i sm" />
              </button>
            </div>
            <div>
              <p className="fk-arabic" dir="rtl" lang="ar">فَإِنَّ مَعَ الْعُسْرِ يُسْرًا</p>
              <p className="cite">{t("ctaQuote")}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="fl-foot">
        <div className="fl-wrap">
          <span className="fk-data fk-muted">MUSLIM BERISLAM · FALAK</span>
          <div className="ctrl">
            <Segmented<Gender>
              label={t("genderLabel")}
              value={gender}
              onChange={setGender}
              options={[
                { value: "ikhwan", label: t("ikhwan") },
                { value: "akhwat", label: t("akhwat") },
              ]}
            />
            <Segmented<"dark" | "light">
              label={t("modeLabel")}
              value={shownMode}
              onChange={setMode}
              options={[
                { value: "dark", label: <><Moon className="fk-i sm" />{t("dark")}</> },
                { value: "light", label: <><Sun className="fk-i sm" />{t("light")}</> },
              ]}
            />
            <div className="fk-seg" role="group" aria-label={nav("languageLabel")}>
              {(["id", "en", "ms"] as const).map((l) => (
                <Link
                  key={l}
                  href={pathname}
                  locale={l}
                  aria-current={locale === l ? "page" : undefined}
                  className="inline-flex h-[34px] items-center rounded-[9px] px-3 text-[13px] font-semibold text-muted-foreground no-underline aria-[current=page]:bg-card aria-[current=page]:text-foreground"
                >
                  {l.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
