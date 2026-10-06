# Muslim Berislam — MVP Design

Date: 2026-07-04
Status: Approved (user "go")
Source spec: `prompt-ai.txt` + brainstorm decisions

## Overview

Mobile-first PWA — Islamic spiritual & productivity app. Three pages (Dashboard, Jurnal, Profil), gender-based theming (Ikhwan/Akhwat × light/dark), per-user data via Supabase Auth with guest mode, todo system built on templates + recurrence schedules, time-of-day dua cards.

Stack: Next.js 16 (App Router, next-intl, shadcn/ui, Tailwind v4, lucide) in `frontend/`; Express 5 + `@supabase/server/core` + Supabase Postgres in `server/`.

## Decisions made during brainstorm

| Decision | Choice |
|---|---|
| Backend architecture | Keep Express 5; hand-rolled middleware on `@supabase/server/core` primitives (no official Express adapter exists) |
| Auth scope | Per-user, Supabase Auth, RLS on all user tables |
| Sign-in methods | Email + password, Google OAuth, **plus anonymous sign-in for guest mode** |
| Guest mode | Supabase `signInAnonymously()` — guest gets real `auth.uid()`, full feature access; upgrade via `linkIdentity()` keeps all data. No localStorage-only path, no merge code |
| Schema scope | Todo-centric MVP (todos/templates/duas/profiles). Prayers/quran/habits tables deferred — Jurnal page designed as card list so future journal types slot in |
| Daily todos | Computed by query from schedules + completions. Not materialized. No cron |

## Guest vs. logged-in

Guest (anonymous auth) can use **everything**: todos, templates, theme, locale, prayer windows. Login exists only to persist across devices/reinstall. Profil page: guests see "Simpan akunmu" (save your account) banner + link-account buttons instead of Logout.

## Database schema (Supabase Postgres)

All user tables have RLS: `user_id = auth.uid()` (or `id = auth.uid()` for profiles). `duas` and system `templates`/`template_items` are public-read.

```sql
profiles
  id            uuid PK REFERENCES auth.users(id) ON DELETE CASCADE
  display_name  text
  photo_url     text
  gender        text CHECK (gender IN ('ikhwan','akhwat')) DEFAULT 'ikhwan'
  theme_mode    text CHECK (theme_mode IN ('light','dark','system')) DEFAULT 'system'
  locale        text CHECK (locale IN ('id','en','ms')) DEFAULT 'id'
  city          text
  prayer_windows jsonb DEFAULT '{"morning":[5,10],"afternoon":[10,15],"evening":[15,18],"night":[18,5]}'
  created_at / updated_at timestamptz

duas                                          -- seeded, public read, no user writes
  id            uuid PK DEFAULT gen_random_uuid()
  slug          text UNIQUE                   -- e.g. 'doa-bangun-tidur'
  arabic        text
  latin         text
  translations  jsonb                         -- {"id": "...", "en": "...", "ms": "..."}
  time_category text CHECK (IN ('morning','afternoon','evening','night','any'))

templates
  id            uuid PK DEFAULT gen_random_uuid()
  owner_id      uuid NULL REFERENCES auth.users(id) ON DELETE CASCADE  -- NULL = system
  kind          text CHECK (kind IN ('group','single'))
  name          text                          -- for system rows this is an i18n key
  is_system     boolean GENERATED ALWAYS AS (owner_id IS NULL) STORED
  created_at    timestamptz
  -- RLS read: is_system OR owner_id = auth.uid(); write: owner_id = auth.uid() only
  -- system templates therefore uneditable by users (spec requirement)

template_items
  id            uuid PK DEFAULT gen_random_uuid()
  template_id   uuid FK templates ON DELETE CASCADE
  title         text                          -- i18n key for system items, literal for user items
  sort_order    int DEFAULT 0

todo_schedules                                -- "what should appear on which days"
  id               uuid PK DEFAULT gen_random_uuid()
  user_id          uuid FK auth.users ON DELETE CASCADE
  template_item_id uuid NULL FK template_items ON DELETE CASCADE
  custom_title     text NULL                  -- exactly one of template_item_id / custom_title set (CHECK)
  recurrence       text CHECK (IN ('once','daily','weekly'))
  once_date        date NULL                  -- required when recurrence='once' (CHECK)
  weekly_days      int[] NULL                 -- 0=Sunday..6=Saturday; required when 'weekly' (CHECK)
  source           text CHECK (IN ('quick_add','journal')) DEFAULT 'journal'
  active           boolean DEFAULT true
  created_at       timestamptz

todo_completions
  id            uuid PK DEFAULT gen_random_uuid()
  user_id       uuid FK auth.users ON DELETE CASCADE
  schedule_id   uuid FK todo_schedules ON DELETE CASCADE
  on_date       date
  completed_at  timestamptz DEFAULT now()
  UNIQUE (schedule_id, on_date)
```

Indexes: `todo_schedules(user_id, active)`, `todo_completions(user_id, on_date)`, `todo_completions(schedule_id, on_date)` (covered by unique), `duas(time_category)`, `templates(owner_id)`, `template_items(template_id)`.

**Today's list query**: schedules where `active AND user_id = auth.uid() AND (
(recurrence='once' AND once_date = :today) OR recurrence='daily' OR (recurrence='weekly' AND :dow = ANY(weekly_days)))`,
left join completions on `(schedule_id, :today)`. Checkbox toggle = insert/delete completion row.

Quick-add from Dashboard → `todo_schedules(recurrence='once', once_date=today, source='quick_add', custom_title=…)`. Jurnal template list filters `source='journal'`, so quick-adds never become templates (spec requirement).

New-user bootstrap: `profiles` row created by Postgres trigger on `auth.users` insert (`handle_new_user()` security definer), so anonymous sign-ins get a profile too.

## Seed data (`server/db/seed.sql`)

- 8 duas with Arabic + latin + id/en/ms translations, time categories:
  bangun tidur (morning), sebelum makan (any), belajar (any), dzikir petang (evening), doa maghrib (evening), doa tidur (night), doa orang tua (any), masuk masjid (any)
- System templates: "Rutinitas Subuh" group (tahajud, subuh, dzikir pagi, baca quran), "Rutinitas Malam" group (maghrib, dzikir petang, isya, doa tidur)
- 4 system single items: Shalat Dhuha, Tilawah Quran, Shalat Tahajud, Bersedekah
- System template/item names stored as i18n keys (e.g. `systemTemplates.subuhRoutine`), resolved client-side per locale

SQL files in `server/db/`: `schema.sql` (tables + RLS + trigger + indexes), `seed.sql`. Run manually in Supabase SQL editor — no CLI/migration-tool dependency for MVP.

## Backend (`server/`)

- `.env` (gitignored): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`, `PORT`, `CLIENT_URL`
- `src/middleware/supabase.js`: Express middleware wrapping `@supabase/server/core` — `verifyCredentials` (user JWT from `Authorization: Bearer`) → attach `req.supabase` (RLS-scoped via `createContextClient`) + `req.supabaseAdmin` (`createAdminClient`). 401 JSON on invalid/missing token
- Routes (all under `/api`, all auth-required except `/health`):
  - `GET  /todos/today` — computed today list (schedule + completion state)
  - `POST /todos` — create schedule (quick-add or journal, custom or from template item)
  - `PATCH /todos/:scheduleId` — edit recurrence/title/active
  - `DELETE /todos/:scheduleId`
  - `POST /todos/:scheduleId/toggle` — body `{date}`, insert/delete completion
  - `GET  /templates` — system + own (with items)
  - `POST /templates`, `PATCH/DELETE /templates/:id` — user templates only (RLS enforces)
  - `GET  /duas/current?category=` — random dua for time window (client computes category from its local time + profile windows)
  - `GET/PATCH /profile`
- All data access through `req.supabase` (RLS) — `supabaseAdmin` reserved for future admin tasks, not used by MVP routes

## Frontend (`frontend/`)

### Shell & navigation
- App shell in `[locale]/layout.tsx`: `max-w-md mx-auto min-h-dvh` column, centered on desktop (subtle side borders on large screens)
- Sticky bottom nav, 3 tabs: Dashboard (`/`), Jurnal (`/journal`), Profil (`/profile`) — lucide icons + labels, active state per route
- Thin top bar with page title
- Routes stay under `[locale]/`; use `Link`/`useRouter` from `i18n/routing.ts`

### PWA
- `src/app/manifest.ts` (Next metadata route) — name, icons, `display: standalone`, theme color
- Minimal service worker for installability — verify current Next 16 approach against `node_modules/next/dist/docs/` before implementing

### Theming (4 palettes)
- CSS variables in `globals.css`, scoped by `<html data-gender="ikhwan|akhwat">` + existing dark-mode class/attr → 4 combinations
- Ikhwan: deep emerald/teal, gold accents. Akhwat: deep plum/rose, champagne accents. Elegant/luxury direction; exact values at implementation (frontend-design skill)
- Theme provider reads profile (or local default pre-auth), sets attrs; instant switch on Profil page

### Supabase client
- `@supabase/supabase-js` in frontend with URL + publishable key (`NEXT_PUBLIC_*` env vars) — used for auth only (sign up/in, Google OAuth, `signInAnonymously`, `linkIdentity`, session)
- Data goes through Express API with `Authorization: Bearer <access_token>`
- First app open without session → auto anonymous sign-in

### Pages
1. **Dashboard**: greeting "Selamat datang, [Nama]"; "Sudahkah berdoa hari ini?" card; dua card (time window from profile `prayer_windows` vs client local time → random dua in category, Arabic + latin + translation for locale); "+" quick-add (one-time todo); today's todo list with checkboxes; empty state "Belum ada rencana hari ini" + button to Jurnal
2. **Jurnal**: card list of journal types (only "Todo" card for MVP; layout anticipates more). Todo journal view: system templates section (read-only, activate items with recurrence picker: tomorrow / specific weekday(s) / daily), personal templates section (create/edit/delete own reusable items), recurrence picker per activation
3. **Profil**: name + photo, gender picker (switches theme live), dark-mode toggle, language picker (id/en/ms), city/prayer-window settings, logout — or guest banner + "save account" (link email/Google) for anonymous users

### i18n
- Every string via `useTranslations()`; add keys to all three of `messages/id.json`, `en.json`, `ms.json` (including system template/item name keys, dua UI labels)

### Component docs
- `frontend/component-docs.md` — every component: purpose, props, usage example, i18n keys consumed. For future developers/AI

## Error handling

- API: consistent JSON error shape `{error: {message, code}}`; 401 unauthenticated, 403 RLS-denied, 422 validation
- Frontend: toast/inline errors; optimistic checkbox toggle with rollback on failure
- Dua card: fallback to `time_category='any'` if none in window

## Testing

No test runner configured (per CLAUDE.md). MVP verified by driving the app (`/verify` flow): guest flow, todo CRUD + recurrence, completion toggle, theme × gender × dark matrix, all three locales, PWA install. Test runner setup deferred.

## Out of scope (deferred)

- Prayers/quran/habits tables + pages (Jurnal card grid reserves space)
- Photo upload (Supabase Storage) — profile photo URL field exists, upload later
- Push notifications / reminders
- Offline data sync (PWA is installable; offline-first not MVP)
- Auto prayer-time calculation from city geocoding (manual windows only)
