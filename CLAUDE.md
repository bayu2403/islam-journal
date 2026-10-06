# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Muslim Berislam" — spiritual companion app (checklist harian, jurnal, shalat tracker, baca Quran, habit tracking). Two apps: `frontend/` (Next.js) and `server/` (Express API).

## Commands

Frontend (run from `frontend/`):
```bash
npm run dev     # next dev, http://localhost:3000
npm run build   # next build
npm run start   # next start
npm run lint    # eslint
```

Server (run from `server/`):
```bash
npm run dev     # node --watch src/index.js, http://localhost:4000
npm start       # node src/index.js
```

No test runner configured in either app yet.

## IMPORTANT: Next.js version mismatch with training data

`frontend/CLAUDE.md` → `frontend/AGENTS.md` states this project runs **Next.js 16.2.10 / React 19.2.4**, which is newer than typical training data. Before using any Next.js API you're not 100% sure of, check `frontend/node_modules/next/dist/docs/` (mirrors nextjs.org/docs) rather than relying on memory. Heed deprecation notices found there.

## Architecture

- **App Router with i18n via next-intl.** All real routes live under `src/app/[locale]/`. `src/app/layout.tsx` is a bare passthrough (no `<html>`/`<body>`) — those tags live in `src/app/[locale]/layout.tsx`, which validates the locale param (`notFound()` if invalid) and wraps children in `NextIntlClientProvider`.
- `src/app/page.tsx` (non-locale root) is a leftover static duplicate of the homepage from before i18n was added — `middleware.ts` matches all non-`/api`, non-`/_next` paths and next-intl rewrites `/` into a locale-prefixed route, so this file is normally unreachable. Treat `src/app/[locale]/page.tsx` as the real homepage.
- **i18n config**: `i18n/routing.ts` defines locales (`id` default, `en`, `ms`) with `localePrefix: "always"`, and re-exports locale-aware `Link`/`redirect`/`useRouter`/`usePathname` from `next-intl/navigation` — use these instead of `next/link` / `next/navigation` anywhere under `[locale]/`. `i18n/request.ts` loads `messages/{locale}.json`. Translation strings live in `messages/id.json`, `messages/en.json`, `messages/ms.json` — keep all three in sync when adding UI text.
- **UI components**: shadcn/ui, configured via `components.json` (style `base-nova`, base color `neutral`, icon library `lucide`). Path aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks` all resolve under `src/`. Existing primitives are in `src/components/ui/` (button, card, dialog, dropdown-menu, input, label, separator, tabs, textarea, badge).
- Styling is Tailwind v4 (`@tailwindcss/postcss`, no `tailwind.config.*` — config lives in `src/app/globals.css` via `cssVariables: true`).

## Server architecture (`server/`)

- Plain Express 5 API, CommonJS (`require`/`module.exports`, not ESM). Entry point `src/index.js`: `helmet`, `cors` (origin from `CLIENT_URL`), `express.json()`, `GET /api/health`, mounts `src/routes/index.js` at `/api`, then a central error handler producing `{error:{message,code}}` JSON.
- **Auth middleware** `src/middleware/supabase.js` built on `@supabase/server/core`: `requireUser` verifies the `Authorization: Bearer <jwt>` via `verifyCredentials`, sets `req.userId`, `req.supabase` (RLS-scoped client), `req.supabaseAdmin` (bypasses RLS); 401 bad token, 500 server misconfig. `withAdmin` only attaches the admin client — NO auth check, public endpoints only. Both clients pass `supabaseOptions: { realtime: { transport: require("ws") } }` — required on Node 20 (no native WebSocket; supabase-js always constructs a Realtime client).
- **Routes** (`src/routes/`): `duas.js` (`GET /api/duas/current?category=` — public, random dua per time category), `profile.js` (`GET/PATCH /api/profile`, field whitelist), `templates.js` (`GET/POST/DELETE /api/templates` — system templates cached), `todos.js` (`GET /api/todos/today?date&dow`, `POST /api/todos`, `POST /api/todos/:id/toggle`, `DELETE /api/todos/:id` = deactivate). Client sends its local `date`/`dow` — server never uses its own clock for "today".
- **Caching**: `src/lib/cache.js` — in-process TTL `Map` (no Redis by design). Duas + system templates cached 1h with in-flight dedup.
- **DB**: schema + seed live in `server/db/schema.sql` + `seed.sql`, run manually in the Supabase SQL editor (no migration tool). RLS on all user tables; `profiles` row auto-created by `on_auth_user_created` trigger (works for anonymous users too). System templates/items store i18n keys (e.g. `SystemTemplates.tahajud`) resolved client-side.
- `server/.env` exists (gitignored): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`, `PORT`, `CLIENT_URL`. `src/config/database.js` is a legacy stub (exports `null`) — real access goes through the middleware clients.

## Frontend app architecture

- **Mobile-first shell**: `[locale]/layout.tsx` renders `<html>` (FOUC theme script in `<head>`, `suppressHydrationWarning`), wraps children in `NextIntlClientProvider` → `AuthProvider` → `ThemeProvider` → phone-width column (`max-w-md mx-auto border-x`) + sticky `BottomNav` (Beranda/Jurnal/Profil). **`setRequestLocale(locale)` call in this layout is load-bearing** — without it next-intl serves the default (id) bundle for every locale.
- **Guest mode**: `AuthProvider` auto-runs `signInAnonymously()` when no session — every visitor has a real `auth.uid()`. `useAuth()` → `{session, isGuest, loading}`. Account upgrade via `supabase.auth.updateUser({email,password})` on the Profil page (guest keeps all data).
- **Data access**: `src/lib/api.ts` `api<T>(path, init?, cacheTtlMs?)` — prefixes `/api`, attaches Bearer token, opt-in client TTL cache + `invalidate(prefix)`. Frontend talks to Express, never queries Supabase tables directly (supabase-js used for auth only).
- **Theming**: 4 palettes (ikhwan/akhwat × light/dark) as CSS variable blocks in `globals.css` keyed off `html[data-gender]` + `.dark`. `useTheme()` → `{gender, mode, setGender, setMode}`; persisted in localStorage (`mb.gender`/`mb.mode`) + profile.
- **Gotcha — Base UI, not Radix**: shadcn primitives here compose via `render={<El/>}`, NOT `asChild`. See `quick-add.tsx` for the working `DialogTrigger render={...}` pattern.
- **Gotcha — mount-after-session**: components that fetch authed data on mount (e.g. `TodayTodos`) must be gated `{session && ...}` — on first-ever visit the anonymous sign-in is still in flight and a tokenless fetch 401s silently.
- PWA: `src/app/manifest.ts` → `/manifest.webmanifest` + `public/icon-{192,512}.png`. No service worker (offline out of scope).
- Full component reference: `frontend/component-docs.md`.

## Revision 1 (2026-07-05, ui_ref redesign) — key model changes

- **Akhirat/Dunia todo split**: `templates`/`todo_schedules` have `category` (`akhirat`|`dunia`). Akhirat = system-template-only (users cannot create custom akhirat todos), each with `summary` (benefit one-liner + hadith source) and `dalil` (full hadith, sahih citations) — stored as literal Indonesian text in DB (NOT i18n keys; template *names* remain i18n keys). Dunia = user-custom, with optional `scheduled_time`.
- **One-at-a-time cards**: Beranda shows the next pending task per category ordered by effective time; `dikerjakan`/`lewati` → `POST /api/todos/:id/status` (`done`|`skipped`|`pending` — pending clears/unchecks). `todo_completions.status` records which. "Semua task hari ini" list allows late-checking skipped/missed items.
- **Prayer times**: `GET /api/prayer-times?date=` → Aladhan `timingsByCity` (method 20 KEMENAG) by profile `city`+`country`, in-process cached 24h per (city,country,date), fixed fallback times on API failure. Template items with `prayer_key` (fajr…isha) resolve display time from this at render; their `default_time` is only the offline fallback. "Solat Fardhu 5 Waktu" is ONE template (5 prayer-linked items) → scheduling it creates 5 daily schedules → 5 time-ordered tasks on Beranda.
- **Dual calendar**: hijri via `Intl` `islamic-umalqura` (`src/lib/hijri.ts`), no dependency. Beranda date panel + Jurnal week strip show both.
- **New tables/routes**: `daily_notes` (Cerita hari ini, upsert per user+date via `/api/notes/today`), `/api/activity` (completion feed for Profil). Migration: `server/db/migration-002.sql` (run in SQL editor, after schema+seed).
- **Design tokens**: `--card-inverse`/`--card-inverse-foreground` (dark akhirat card) + `--reward` (hadith-source highlight) per gender×mode in `globals.css`; serif font Lora via `--font-lora` → `font-serif` (greetings/headings). Hadith `summary`/`dalil` strings are religious content — render verbatim, never rewrite or truncate in full view.
