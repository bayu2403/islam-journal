# Revision 1 — UI-Ref Redesign (Beranda/Jurnal/Profil, Akhirat/Dunia todos, dual calendar)

Date: 2026-07-05
Source: `prompt/5-7-2026-20-52-prompt.txt` + `ui_ref/1a.jpeg, 1b.jpeg, 2.jpeg, 3.jpeg` + user decisions
Base: MVP per `2026-07-04-muslim-berislam-mvp-design.md` (built & verified)

## User decisions (asked 2026-07-05)
1. **Prayer times**: Aladhan API by city (`api.aladhan.com`), server-side fetch + TTL cache, fallback to fixed defaults on failure.
2. **Lewati**: records `skipped` for that day; task leaves the one-at-a-time card. A "semua task hari ini" list shows ALL akhirat+dunia tasks of the day with status — skipped/missed ones can still be checked off there.
3. **Theme**: total restyle following ref 1b concept (warm light bg, dark contrast akhirat card, premium type). Gender theme (ikhwan/akhwat) + dark mode kept as palette variants on the new basis.

## Concept changes vs MVP

### Todo model
- Every template & schedule has **category**: `akhirat` | `dunia`.
- **Akhirat**: template-only (no custom creation). Seeded: Solat Fardhu 5 Waktu (group, 5 items with prayer keys) + sunnah prayers (singles), each with `summary` (benefit one-liner + source) and `dalil` (full hadith text + rewards, sahih citations).
- **Dunia**: user-custom todos as before, now with a **jam tampil** (`scheduled_time`).
- Beranda shows **one task at a time per category**, ordered by effective time (prayer items use Aladhan times for the day; others use `scheduled_time`, null-times last). Actions: **dikerjakan** (done) / **lewati** (skipped) → next task appears.
- Card click → dialog with full `dalil` (hadith + pahala).
- "Semua task hari ini": collapsible list of the whole day (both categories), shows time + status (pending/done/skipped/missed-by-time), any item checkable there regardless of skip/time.
- Completions get `status`: `done` | `skipped` (row exists = actioned; absence = pending).
- Fardhu special-case: Jurnal shows ONE card "Solat Fardhu 5 Waktu"; activating it schedules its 5 items (daily); Beranda shows them as 5 separate time-ordered tasks with Aladhan times.

### Dual calendar
- Masehi + Hijriah everywhere dates show. Hijri computed client-side via `Intl.DateTimeFormat("id-u-ca-islamic-umalqura")` — no dependency, no API.
- Beranda date card: big masehi day+month, weekday+year right, hijri date line below (e.g. "11 Muharram 1448 H").
- Jurnal week strip: current week, 7 day-circles (masehi number big, hijri number small), today highlighted.

### Prayer times (Aladhan)
- Server route `GET /api/prayer-times?date=YYYY-MM-DD` — uses caller profile's `city` + `country` (default Jakarta/Indonesia), calls `https://api.aladhan.com/v1/timingsByCity?date=&city=&country=&method=20` (method 20 = KEMENAG; verify against Aladhan docs at implementation), returns `{fajr,dhuhr,asr,maghrib,isha}` (HH:MM). Cached in-process 24h per (city,country,date). On API failure → fixed defaults (04:30/12:00/15:15/18:00/19:15) + `"source":"fallback"`.
- `prayer_windows` (dua time categories) stays as-is — separate concern.

### Pages (per refs)
**Beranda (1a)**: serif greeting "Assalamu 'alaikum {name} 🌼" + "Ayo mulai hari dengan berdoa," → doa card (soft gradient, keeps existing dua fetch) → "Rencana hari ini" panel (accent bg): date block (masehi big + weekday/year + hijri) → AKHIRAT card (dark: category label + bold title + summary w/ highlighted reward + source, dikerjakan/lewati pills) → DUNIA card (light, same structure) → "Semua task hari ini" list.

**Jurnal (2)**: title "Journal" + hadith subtitle ("Mengingat-ingat anugerah Allah membuahkan kecintaan kepada Allah") → month name + week strip (today highlighted, dual calendar) → "Rencana esok hari": two cards Akhirat | Dunia → tap opens the respective picker: Akhirat = system amalan cards (summary shown, activate w/ RecurrencePicker + info time comes from prayer or default_time); Dunia = personal templates + create form (now includes time input `jam tampil`) → "Journal harian": 3 placeholder cards (Catatan ilmu, Journal kesehatan, Journal penghargaan diri) marked "Segera hadir".

**Profil (3)**: big title → avatar circle (initial letter; camera icon placeholder, upload out of scope) + name → "Cerita hari ini" card (daily free-text note, autosaved per date) → "Aktivitasku" → "Riwayat ibadahku" feed ("Pukul 14:00 — {name} sudah Shalat Dzuhur", from completions, latest ~20) → existing settings (gender/dark/language/city+country/logout/guest-link) restyled below.

### Theme restyle
- New palettes (still 4 = gender × light/dark), new tokens on same CSS-variable system:
  - Ikhwan light: warm cream bg `oklch(0.98 0.008 90)`, ink foreground, **dark forest-teal** card for akhirat blocks, **lime** accent (ref 1a), gold highlight for rewards text (ref 1b orange).
  - Akhwat light: warm cream, deep plum dark-card, rose accent, champagne highlight.
  - Dark modes: deep neutral bg, cards elevate, accents brighten.
- Fonts: add serif display font (`Lora` via next/font) for greeting/page titles; body stays Geist.
- Dua card: soft blue/green gradient per 1a.

### Content language
Hadith `summary`/`dalil` stored as literal Indonesian text in DB (not i18n keys) — hadith translation to en/ms out of scope; all locales show the Indonesian dalil for now. Template *names* stay i18n keys.

## Schema migration (`server/db/migration-002.sql`)
```sql
alter table public.templates    add column category text not null default 'dunia' check (category in ('akhirat','dunia'));
alter table public.templates    add column summary text;
alter table public.templates    add column dalil text;
alter table public.template_items add column summary text;
alter table public.template_items add column dalil text;
alter table public.template_items add column default_time time;
alter table public.template_items add column prayer_key text check (prayer_key in ('fajr','dhuhr','asr','maghrib','isha'));
alter table public.todo_schedules add column category text not null default 'dunia' check (category in ('akhirat','dunia'));
alter table public.todo_schedules add column scheduled_time time;
alter table public.todo_completions add column status text not null default 'done' check (status in ('done','skipped'));
alter table public.profiles add column country text not null default 'Indonesia';

create table public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  on_date date not null,
  body text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, on_date)
);
alter table public.daily_notes enable row level security;
create policy "notes all own" on public.daily_notes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
```
Plus UPDATE of existing seed rows (categories) + INSERT of new akhirat seed content (full SQL in migration file; hadith texts fixed in the plan, sahih citations: Bukhari/Muslim/Tirmidzi with numbers).

## API changes (server)
- `GET /api/prayer-times?date=` (requireUser; city/country from profile) — Aladhan + cache + fallback.
- `GET /api/todos/today` — adds `category`, `time` (resolved: prayer_key→Aladhan handled client-side; server returns `scheduled_time` + `prayer_key` + `default_time`), `summary`, `dalil`, `status` (`done`/`skipped`/null).
- `POST /api/todos/:id/status` body `{date, dow, status: 'done'|'skipped'}` — upsert completion with status (replaces toggle; toggle route removed, frontend updated).
- `POST /api/todos` accepts `scheduled_time` (dunia custom).
- `GET /api/templates` includes new columns; grouped by category.
- `GET /api/notes/today?date=` / `PUT /api/notes/today` `{date, body}` — daily note.
- `GET /api/activity?limit=20` — completion feed (time, title, status).

## Out of scope (unchanged/deferred)
- Photo upload (camera icon is placeholder), journal harian types (placeholders), hadith i18n, push notifications, offline.

## Verification
Browser-driven against live stack (both servers + real Supabase), per page: beranda flow (dikerjakan/lewati/next/full-list checkbox), fardhu expands to 5 with Aladhan times, dual-calendar correctness (spot-check hijri vs known date), jurnal week strip + esok-hari add flows (akhirat template w/ time, dunia custom w/ time), profil note autosave + activity feed, all 3 locales, both genders × dark/light.
