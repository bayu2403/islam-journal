# Revision 1 Implementation Plan — UI-Ref Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. Checkbox (`- [ ]`) tracking. Controller may implement logic-heavy tasks inline (R1, R2, R4) and delegate UI tasks (R3, R5-R7).

**Goal:** Redesign per `ui_ref/*` — akhirat/dunia one-at-a-time task cards with hadith, dual masehi/hijri calendar, Aladhan prayer times, new Beranda/Jurnal/Profil, full restyle.

**Spec:** `docs/superpowers/specs/2026-07-05-revision-1-ui-ref-design.md` (all decisions + schema there)

**Conventions:** No git. No test runner — verify by curl + browser. Base UI (`render` prop, no `asChild`). i18n keys ×3 locales always. Next 16 — check vendored docs when unsure. Hadith texts in this plan are FINAL — subagents must not invent or alter religious content.

---

## Task R1: Migration SQL (`server/db/migration-002.sql`) — inline by controller

ALTERs per spec + seed updates. Existing system rows get `category='akhirat'`, summaries/dalil; new rows: Solat Fardhu group (id `…0003`, 5 items `…0021`-`…0025` with prayer_key fajr/dhuhr/asr/maghrib/isha, default times 04:30/12:00/15:15/18:00/19:15) + singles Rawatib (`…0015`), Qabliyah Subuh (`…0016`, 04:15), Witir (`…0017`, 20:30), Tahiyatul Masjid (`…0018`), Jamaah 40 Hari (`…0019`). All hadith summaries/dalil verbatim from controller (Muslim 233/656/657/720/725/728/1163, Bukhari 444/553/998/1145, Tirmidzi 241/413/2910). `daily_notes` table + RLS. `profiles.country` default 'Indonesia'. User runs in SQL editor.

## Task R2: Server routes — inline by controller

- `routes/prayer-times.js`: `GET /api/prayer-times?date=` (requireUser) → profile city/country → Aladhan `timingsByCity` (verify method id for KEMENAG via live probe) → cache 24h key `prayer:{city}:{country}:{date}` → `{fajr,dhuhr,asr,maghrib,isha,source:"aladhan"|"fallback"}`; fallback defaults 04:30/12:00/15:15/18:00/19:15.
- `routes/todos.js`: `/today` select adds `category, scheduled_time, template_items(title, summary, dalil, default_time, prayer_key)`, completions select `schedule_id,status`; response adds `category,time,summary,dalil,prayer_key,status`. New `POST /:scheduleId/status` `{date,dow,status:'done'|'skipped'}` → upsert `onConflict:'schedule_id,on_date'`. Remove `/toggle`. `POST /` accepts `category`,`scheduled_time`.
- `routes/templates.js`: select adds new columns; response unchanged shape otherwise.
- `routes/notes.js`: `GET /api/notes/today?date=`, `PUT /api/notes/today` `{date,body}` upsert.
- `routes/activity.js`: `GET /api/activity?limit=` → completions desc join schedules→template_items titles → `[{completed_at,status,title,is_system_title}]`.
- Wire in `routes/index.js`. Curl-verify all with real JWT.

## Task R3: Theme restyle + fonts + i18n — subagent

- `globals.css`: replace 4 gender palette blocks with warm-cream basis (spec palette direction); add custom vars `--card-inverse`, `--card-inverse-foreground`, `--reward` (highlight color) per gender×mode; map into `@theme inline` so `bg-card-inverse`, `text-reward` utilities exist.
- `[locale]/layout.tsx`: add Lora via `next/font/google` → `--font-serif`; `@theme inline` `--font-heading: var(--font-serif)`.
- Messages ×3: new namespaces/keys (Beranda greeting "Assalamu 'alaikum, {name}", startDay, todayPlan, allTasks, dikerjakan, lewati, rewardLabel, dalilTitle; Journal: planTomorrow, akhirat, dunia, dailyJournal, placeholders, timeLabel; Profile: storyToday, myActivity, worshipHistory, activityDone/Skipped; SystemTemplates: solatFardhu, dzuhur, ashar, rawatib, qabliyahSubuh, shalatWitir, tahiyatulMasjid, jamaah40Hari).

## Task R4: Client libs — inline by controller

- `src/lib/hijri.ts`: `hijriParts(date)` + `formatHijri(date, locale)` via `Intl.DateTimeFormat(locale+"-u-ca-islamic-umalqura")`.
- `src/lib/use-prayer-times.ts`: hook fetching `/prayer-times?date=todayStr()` with 1h client cache, returns map or null.

## Task R5: Beranda rebuild — subagent (with frontend-design care, match 1a/1b)

Serif greeting + subtitle; dua card gradient; "Rencana hari ini" accent panel: date block (big masehi day + month, weekday+year right, hijri line); AKHIRAT card (dark `bg-card-inverse`, uppercase label w/ icon, bold title, summary with `text-reward` highlight + source, `dikerjakan`/`lewati` pill buttons) = next pending akhirat task by resolved time (prayer_key→usePrayerTimes, else scheduled_time/default_time, null last); DUNIA card light equivalent; card click → Dialog with full `dalil` + title; "Semua task hari ini" collapsible list (time + title + status chip; checkbox works for any item incl. skipped → POST status done). Empty category → friendly empty card linking Journal. All strings i18n.

## Task R6: Jurnal rebuild — subagent (match 2)

Serif "Journal" + hadith subtitle; month name + week strip (7 circles Mon-Sun of current week, masehi big + hijri small, today = filled accent circle); "Rencana esok hari": two cards Akhirat|Dunia → Akhirat view: system akhirat template cards (name + summary + optional time badge) activate → RecurrencePicker (keep) + note prayer items use auto times; Dunia view: personal templates + create form gains `<Input type="time">` jam tampil (sent as `scheduled_time`, category 'dunia'); "Journal harian": 3 disabled placeholder cards + "Segera hadir". Todo journal navigation can stay in-page views like current implementation.

## Task R7: Profil rebuild — subagent (match 3)

Serif "Profil"; avatar circle (initial) + camera badge (non-functional) + name; "Cerita hari ini" card → textarea autosaving (debounced PUT /notes/today); "Aktivitasku" → "Riwayat ibadahku" card → feed list from GET /activity ("Pukul {HH:mm} — {name} {title}" done vs skipped styling); settings section (existing gender/dark/language/city + NEW country input/logout/guest-link) restyled below. Keep all existing behavior.

## Task R8: Docs + final verify — controller

Update `component-docs.md` + root CLAUDE.md deltas; full browser pass per spec verification list; lint + tsc.
