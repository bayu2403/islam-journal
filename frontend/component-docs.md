# Component & Lib Docs — Muslim Berislam (frontend)

Practical reference for every custom component and lib under `src/components/` and
`src/lib/`. Written from the code as it exists on disk — if something looks off,
re-check the file before trusting this doc; it will drift as the code evolves.

All client components use `"use client"` and Base UI-flavored shadcn primitives
(`@/components/ui/*`). Locale-aware navigation (`Link`, `usePathname`, `useRouter`)
always comes from `i18n/routing.ts`, never `next/link` / `next/navigation`, for
anything rendered under `src/app/[locale]/`.

---

## Components

### `auth-provider.tsx` — `AuthProvider`, `useAuth`

**Purpose**: Guarantees every visitor has a Supabase session — signed-in or
anonymous guest — before the rest of the app trusts `session` to exist. Wraps the
whole locale layout (see `[locale]/layout.tsx`).

**Exports**

| Name | Type | Description |
|---|---|---|
| `AuthProvider` | `({ children: React.ReactNode }) => JSX.Element` | Context provider. Mount once, at the root of `[locale]/layout.tsx`, above `ThemeProvider`. |
| `useAuth` | `() => { session: Session \| null; isGuest: boolean; loading: boolean }` | Reads the current auth state. |

**Behavior / gotchas**

- On mount, calls `supabase.auth.getSession()`. If there's no session, it calls
  `supabase.auth.signInAnonymously()` — this is how every first-time visitor gets a
  working, RLS-scoped `user_id` without ever seeing a login screen.
- `isGuest` is derived from `session.user.is_anonymous` (defaults to `true` while
  loading or if sign-in fails).
- Also subscribes to `supabase.auth.onAuthStateChange`, so linking an email/password
  or Google identity later (see `profile/page.tsx`) updates `session`/`isGuest` in
  place without a reload.
- **`loading` starts `true` and only flips once genuinely resolved.** Consumers
  (e.g. the dashboard) should render nothing (or a skeleton) while `loading` is
  true rather than assume `session` is set.
- **Session is not synchronous with mount.** On the very first visit, the anonymous
  sign-in is in flight for one tick. Any child component that fetches data on mount
  using the access token will 401 if it doesn't gate on `session` first — see
  `TodayTodos` gotcha below and the comment in `[locale]/page.tsx`.

**Usage**

```tsx
const { session, isGuest, loading } = useAuth();
if (loading) return null;
if (session) fetchSomethingThatNeedsAuth();
```

---

### `theme-provider.tsx` — `ThemeProvider`, `useTheme`, `Gender`, `ThemeMode`

**Purpose**: Client-side gender re-tint (Ikhwan/Akhwat palettes) and dark-mode
control, persisted to `localStorage` and mirrored onto `<html>` so CSS can react
via `[data-gender]` / `.dark` selectors.

**Exports**

| Name | Type | Description |
|---|---|---|
| `Gender` | `"ikhwan" \| "akhwat"` | Visual theme variant. |
| `ThemeMode` | `"light" \| "dark" \| "system"` | Dark-mode preference. |
| `ThemeProvider` | `({ children }) => JSX.Element` | Context provider. Mount inside `AuthProvider` in `[locale]/layout.tsx`. |
| `useTheme` | `() => { gender: Gender; mode: ThemeMode; setGender(g): void; setMode(m): void }` | Throws if called outside `ThemeProvider`. |

**Storage contract**

- `localStorage["mb.gender"]` — `"ikhwan"` (default) or `"akhwat"`.
- `localStorage["mb.mode"]` — `"light"`, `"dark"`, or `"system"` (default).
- Applying a theme sets `document.documentElement.dataset.gender = gender` and
  toggles the `dark` class on `<html>` (true when `mode === "dark"`, or when
  `mode === "system"` and `matchMedia("(prefers-color-scheme: dark)")` matches).

**FOUC script contract** — `[locale]/layout.tsx` inlines a synchronous
`<script>` in `<head>` that duplicates this exact logic (read the two
`localStorage` keys, set `dataset.gender`, toggle `.dark`) **before** React
hydrates, so there's no flash of the wrong theme. **If you change the storage
keys or the light/dark decision rule in `applyTheme()`, update that inline
script too** — they must stay byte-for-byte equivalent in intent, or the SSR
paint and the first client paint will disagree.

**Gotchas**

- `useTheme()` throws outside a provider — always call it from a component
  rendered under `[locale]/layout.tsx`.
- `setGender`/`setMode` update state, persist to `localStorage`, and repaint
  `<html>` synchronously (no round-trip to the server) — server persistence is a
  separate `PATCH /api/profile` call the caller must make itself (see
  `profile/page.tsx`'s `pickGender`/`pickMode`).

**Usage**

```tsx
const { gender, mode, setGender, setMode } = useTheme();
<Button onClick={() => setGender("akhwat")}>Akhwat</Button>
```

---

### `bottom-nav.tsx` — `BottomNav` (default export)

**Purpose**: Sticky 3-tab bottom navigation (Beranda/Jurnal/Profil), rendered once
in `[locale]/layout.tsx` below `{children}`.

**Props**: none.

**i18n**: `Nav` namespace — keys `dashboard`, `journal`, `profile` (tab labels).

**Behavior**: Tabs are a fixed array of `{ href: "/" | "/journal" | "/profile",
key, icon }`. Active tab is determined by exact match against `usePathname()`
(locale-stripped, from `i18n/routing`), styled via `text-primary font-medium`
vs. muted. Icons from `lucide-react` (`Home`, `NotebookPen`, `User`).

**Gotcha**: `href="/"` only matches the dashboard `pathname === "/"` exactly —
there's no prefix matching, so nested routes under `/` would show no active tab.

---

### `top-bar.tsx` — `TopBar` (default export)

**Purpose**: Minimal sticky page header, one line, used at the top of all three
pages.

**Props**

| Name | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | yes | Page title, already-translated (caller passes `t("...")`). |

**Usage**: `<TopBar title={t("welcome", { name })} />`

---

### `dua-card.tsx` — `DuaCard` (default export), `categoryForHour`

**Purpose**: Fetches and renders a single contextual dua (Arabic + Latin
transliteration + localized translation) based on time of day, using the user's
own prayer-window boundaries.

**Exports**

| Name | Type | Description |
|---|---|---|
| `DuaCard` | `({ windows: Windows }) => JSX.Element \| null` | default export. |
| `categoryForHour` | `(hour: number, w: Windows) => string` | Pure function mapping an hour-of-day to `"morning" \| "afternoon" \| "evening" \| "night"`. Exported so it's unit-testable independent of the fetch/render cycle. |

**Types**

```ts
type Windows = Record<"morning" | "afternoon" | "evening" | "night", [number, number]>;
```
`windows` comes from the caller (dashboard reads it off the user's `profile.prayer_windows`,
falling back to a hardcoded default if the profile hasn't loaded yet — see
`[locale]/page.tsx`).

**Behavior**

- On mount / whenever the computed `category` changes, calls
  `api<Dua>('/duas/current?category=' + category)`. No polling — category is
  computed once per render from `new Date().getHours()`, not re-evaluated on a
  timer, so it won't auto-flip if the tab is left open across a boundary.
- `categoryForHour` treats "night" as the fallback/else branch — it doesn't
  explicitly check the night window bounds, it's just whatever isn't morning,
  afternoon, or evening (this is how it "wraps" evening-end back to morning-start
  across midnight).
- Renders `null` on fetch error or while `dua` is still `null` — no loading
  skeleton, no retry.
- The badge in the header shows the dua's *own* `time_category` translated via
  the `Dua` namespace, unless the dua's category is `"any"`, in which case it
  falls back to showing the *computed* `category` instead.

**i18n**: `Dashboard` namespace (`duaOfTheMoment`), `Dua` namespace
(`morning`/`afternoon`/`evening`/`night` — used both for the badge and as a
fallback label).

**Gotcha**: `dua.translations[locale] ?? dua.translations.id` — if a translation
is missing for the current locale, it silently falls back to Indonesian, not
English.

**Usage**: `<DuaCard windows={windows} />`

---

### `today-todos.tsx` — `TodayTodos` (default export), `TodayTodo`

**Purpose**: Lists today's scheduled todo items (from recurring or one-time
schedules) with optimistic toggle-to-complete.

**Exports**

```ts
export type TodayTodo = {
  schedule_id: string;
  title: string;
  is_system_title: boolean;
  completed: boolean;
};
```

**Props**

| Name | Type | Required | Description |
|---|---|---|---|
| `refreshKey` | `number` | yes | Bump this (e.g. `k => k + 1`) to force a refetch — there is no other way to trigger a reload from outside. Used by `QuickAdd`'s `onAdded` callback on the dashboard. |

**Behavior / contract**

- Fetches `GET /todos/today?date=<todayStr()>&dow=<todayDow()>` on mount and
  whenever `refreshKey` changes.
- **`is_system_title` / i18n key resolution**: the server returns `title` as
  either a literal custom string (`is_system_title: false`, from `custom_title`)
  or a **dotted i18n key** like `"SystemTemplates.subuhRoutine"`
  (`is_system_title: true`, sourced from `template_items.title`). The component
  calls `useTranslations()` with **no namespace** (`const sys = useTranslations()`)
  specifically so it can resolve those fully-qualified dotted keys directly:
  `sys(todo.title)`. Custom titles are rendered as-is.
- **Optimistic toggle with rollback**: `toggle(id)` flips `completed` in local
  state immediately, then fires `POST /todos/:id/toggle`. If that request
  throws, it calls `load()` to refetch from the server and discard the optimistic
  change — there's no per-item error toast, just a silent re-sync.
- Three render states: `null` todos → loading text (`Common.loading`); empty
  array → dashed empty-state card with a `Button` (Base UI `render` prop, see
  gotcha) linking to `/journal`; otherwise the checkbox list.

**i18n**: `Dashboard` namespace (`emptyTodos`, `goToJournal`), root namespace via
`useTranslations()` for resolving `SystemTemplates.*` keys, plus `Common.loading`.

**Gotchas**

- **Must be mounted only when a session exists.** `[locale]/page.tsx` guards it
  with `{session && <TodayTodos ... />}` — mounting it before the anonymous
  sign-in resolves means the first fetch goes out without a bearer token, 401s,
  and the component gets stuck showing the empty state until a manual reload
  (the component itself has no re-fetch-on-session-arrival logic).
- Uses the Base UI **`render` prop**, not `asChild`:
  `<Button render={<Link href="/journal" />} nativeButton={false} variant="outline" size="sm">`.
  This is the shadcn `base-nova` style's polymorphism convention — do not port
  Radix's `asChild` pattern here.

**Usage**: `{session && <TodayTodos refreshKey={refreshKey} />}`

---

### `quick-add.tsx` — `QuickAdd` (default export)

**Purpose**: Small "+" FAB that opens a dialog to add a single ad-hoc todo for
*today only* — the escape hatch for things that don't deserve a full journal
template.

**Props**

| Name | Type | Required | Description |
|---|---|---|---|
| `onAdded` | `() => void` | yes | Called after a successful add (dialog already closed). Dashboard uses it to bump `refreshKey` on `TodayTodos`. |

**Behavior**

- Posts `POST /todos` with `{ custom_title, recurrence: "once", once_date: todayStr(), source: "quick_add" }`.
- **One-time semantics are hardcoded**: `recurrence` is always `"once"` and
  `once_date` is always today — a quick-add item can never become a recurring
  template. If you need recurrence, use the Journal flow (`RecurrencePicker`)
  instead.
- Submits on Enter key (`onKeyDown` checks `e.key === "Enter"`) or the Add
  button; both are disabled while `busy` or when the title is empty/whitespace.
- Uses Base UI's `render` prop on `DialogTrigger`:
  `<DialogTrigger render={<Button size="icon" ... />}>`.

**i18n**: `Dashboard` namespace — `quickAddTitle`, `quickAddPlaceholder`,
`quickAddHint`, `add`, `cancel`.

**Usage**: `<QuickAdd onAdded={() => setRefreshKey((k) => k + 1)} />`

---

### `recurrence-picker.tsx` — `RecurrencePicker` (default export), `Recurrence`

**Purpose**: Modal for choosing when a journal template (or template item)
should recur, then hands the caller a ready-to-POST recurrence payload.

**Exports**

```ts
export type Recurrence =
  | { recurrence: "once"; once_date: string }
  | { recurrence: "daily" }
  | { recurrence: "weekly"; weekly_days: number[] };
```

**Props**

| Name | Type | Required | Description |
|---|---|---|---|
| `open` | `boolean` | yes | Dialog visibility. |
| `onClose` | `() => void` | yes | Called when the dialog is dismissed (backdrop, or after `onPick`). |
| `onPick` | `(r: Recurrence) => void` | yes | Called with the chosen recurrence when the user confirms. |

**Four modes** (internal `mode` state, not exposed as a prop):

1. `"tomorrow"` (default) → `{ recurrence: "once", once_date: <tomorrow> }`
2. `"daily"` → `{ recurrence: "daily" }`
3. `"weekly"` → `{ recurrence: "weekly", weekly_days: number[] }` — requires at
   least one day selected (`0`–`6`, Sun–Sat); the confirm button is disabled
   otherwise.
4. `"date"` → `{ recurrence: "once", once_date: <picked date> }` via an
   `<Input type="date">`.

**i18n**: `Journal` namespace — `recurrenceTitle`, `tomorrow`, `daily`, `weekly`,
`pickDate`, `days.0`..`days.6`, `activate`.

**Gotcha**: internal state (`mode`, `days`, `date`) is **not reset** when the
dialog is reopened for a different template — if the user picked "weekly, Mon"
last time, opening it again for a different item still shows "weekly, Mon"
pre-selected.

**Usage**

```tsx
<RecurrencePicker
  open={pickerFor !== null}
  onClose={() => setPickerFor(null)}
  onPick={(r) => pickerFor && schedule(pickerFor, r)}
/>
```

---

### `language-switcher.tsx` — `LanguageSwitcher` (default export)

*Pre-existing component, documented for completeness — not part of this task's
new work.*

**Purpose**: Hover dropdown to switch locale (`id`/`en`/`ms`) while staying on
the same page/route, via `router.replace(pathname, { locale })` from
`i18n/routing`.

**Props**: none.

**Behavior**: CSS-only hover dropdown (`group` / `group-hover:visible`), no
click-to-open state — this is a pointer-driven UI, not keyboard/touch friendly
by default. Wraps the locale switch in `useTransition` so `isPending` disables
the trigger button during navigation. Flag emoji + label per locale
(`🇮🇩 Indonesia`, `🇬🇧 English`, `🇲🇾 Melayu`).

**i18n**: `Nav` namespace — `t(locale)` for the trigger label (i.e. `dashboard`
key names double as flag button text... actually uses `Nav.id`/`Nav.en`/`Nav.ms`
directly, not `dashboard`/`journal`/`profile`).

**Gotcha**: this component navigates via `router.replace(pathname, { locale })`,
which correctly swaps only the locale segment (fixed bug: previously this could
produce a doubled locale segment like `/id/en/profile`). `profile/page.tsx`
implements the same locale-switch pattern inline (`pickLocale`) rather than
reusing this component, so if you fix a locale-switching bug in one place, check
the other.

---

## Revision 1 components (UI-ref redesign, 2026-07-05)

### `task-card.tsx` — `TaskCard`
The akhirat/dunia one-at-a-time task card (ref 1b). Props: `task: TodayTask | null`,
`variant: "akhirat" | "dunia"`, `emptyMessage: string`, `onAction(status)`, `onOpen()`.
Akhirat renders dark (`bg-card-inverse`), dunia light. Splits `summary` on its last
`(` so the hadith source renders in `text-reward`. Pills `dikerjakan`/`lewati` call
`onAction("done"|"skipped")` with stopPropagation; card click = `onOpen` (dalil dialog).
Never rewrite/truncate the religious `summary`/`dalil` strings (line-clamp on card ok).

### `dalil-dialog.tsx` — `DalilDialog`
Controlled dialog showing resolved task title + full `dalil` verbatim.
Props: `task`, `open`, `onOpenChange`.

### `all-tasks-list.tsx` — `AllTasksList`
Collapsible "Semua task hari ini": every task of the day (both categories) sorted by
effective time, with status chips and a checkbox that toggles done↔pending — this is
where skipped/missed tasks get checked late. Hosts `QuickAdd` in its header row.
Props: `tasks` (with `effTime`), `onToggle(task)`, `onAdded()`.

### `week-strip.tsx` — `WeekStrip`
Journal's Monday-first current-week strip: weekday short labels via `Intl`, masehi day
big + hijri day tiny (`hijriDay`), today = filled accent circle. No props.

### `story-card.tsx` — `StoryCard`
"Cerita hari ini" daily note. Loads `GET /notes/today?date=`, debounced (800ms)
autosave `PUT /notes/today`, transient "Tersimpan" indicator. Session-gated internally.

### `activity-feed.tsx` — `ActivityFeed`
"Riwayat ibadahku" feed from `GET /activity?limit=20`. Prop: `name` (display name for
"{name} sudah {title}" lines). Skipped rows muted + strikethrough. Session-gated.

### Revision libs
- `src/lib/hijri.ts` — `hijriParts/formatHijri/hijriDay` via
  `Intl.DateTimeFormat("<locale>-u-ca-islamic-umalqura")`, no dependency.
- `src/lib/use-prayer-times.ts` — `usePrayerTimes()` hook → today's
  `{fajr,dhuhr,asr,maghrib,isha,source}` from `/prayer-times` (server caches Aladhan
  24h per city+date; client TTL 1h). Tasks with `prayer_key` resolve their display
  time from this, NOT from `default_time` (which is only the offline fallback).

### Removed in Revision 1
`today-todos.tsx` (superseded by `TaskCard` + `AllTasksList`). `POST /todos/:id/toggle`
replaced by `POST /todos/:id/status` (`done|skipped|pending`).

## Libs

### `supabase.ts` — `supabase`

**Purpose**: Single shared browser Supabase client, used for **auth only** (no
direct table queries from the client — all data access goes through the Express
API in `server/`, which uses the user's JWT to enforce RLS).

**Export**: `supabase: SupabaseClient` — configured from
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` env vars
(both required — non-null-asserted, will throw at import time if unset).

**Gotcha**: this is the *publishable* (anon-equivalent) key, appropriate for a
browser bundle. Never import the service-role key here.

**Usage**: `await supabase.auth.getSession()`, `supabase.auth.signInAnonymously()`,
`supabase.auth.signOut()`, `supabase.auth.updateUser(...)`,
`supabase.auth.linkIdentity({ provider: "google" })`.

---

### `api.ts` — `api<T>()`, `invalidate()`, `todayStr()`, `todayDow()`

**Purpose**: Thin authenticated fetch wrapper against the Express API, plus a
tiny client-side TTL cache and local-date helpers ("today" is a client concept —
the server is timezone-agnostic).

**Exports**

| Name | Signature | Description |
|---|---|---|
| `api<T>` | `(path: string, init?: RequestInit, cacheTtlMs?: number) => Promise<T>` | Fetches `${NEXT_PUBLIC_API_URL}/api${path}`. Attaches `Authorization: Bearer <access_token>` automatically when a session exists. Throws `Error(message)` on non-OK responses (message from `body.error.message`, else a generic `Request failed (<status>)`). Returns `undefined as T` on `204`. |
| `invalidate` | `(prefix: string) => void` | Deletes every cache entry whose key starts with `prefix` (keys are `"<METHOD>:<path>"`, e.g. `"GET:/templates"`). Call after any mutation that should bust a cached GET. |
| `todayStr` | `() => string` | Local date as `YYYY-MM-DD`, from `new Date()` in the browser's timezone (not UTC, not server time). |
| `todayDow` | `() => number` | `0`–`6` (Sun–Sat) via `Date.getDay()`, same local-clock basis as `todayStr`. |

**Caching semantics**

- `cacheTtlMs` defaults to `0` (no caching). When `> 0`, a hit within TTL short-circuits
  the network call entirely (`clientCache` is a module-level `Map`, so it persists
  across component remounts but not page reloads).
- Cache key is `"<METHOD>:<path>"` — note this **does not include the request
  body**, so e.g. two different POST bodies to the same path would collide if
  someone mistakenly passed a `cacheTtlMs > 0` on a POST. In practice only GETs
  use caching (dashboard's `/profile` at 60s, journal's `/templates` at 30s).
  Mutations must call `invalidate("GET:/profile")` / `invalidate("GET:/templates")`
  themselves — there's no automatic invalidation on POST/PATCH/DELETE.
- `Content-Type: application/json` is always sent; the caller must pass
  `body: JSON.stringify(...)` explicitly — this wrapper does not stringify for
  you.

**Usage**

```ts
// cached GET, 60s TTL
const profile = await api<Profile>("/profile", {}, 60_000);

// mutation + cache bust
await api("/profile", { method: "PATCH", body: JSON.stringify({ display_name }) });
invalidate("GET:/profile");

// date-scoped fetch
await api<TodayTodo[]>(`/todos/today?date=${todayStr()}&dow=${todayDow()}`);
```

---

## Page structure

- **`[locale]/page.tsx` (dashboard)** — composes `TopBar` (greeting with
  display name or guest fallback), a static "prayed today" card, `DuaCard`
  (fed `profile.prayer_windows` or a hardcoded fallback), a `TodayTodos` +
  `QuickAdd` pair wired together via `refreshKey`, gated on `session` from
  `useAuth()`.
- **`[locale]/journal/page.tsx`** — two-view page: a card-picker view (`"cards"`)
  linking into a Todo view (`"todo"`), which lists system + personal templates,
  a `RecurrencePicker` for scheduling a template's items, and an inline
  create-template form (name + newline-separated items).
- **`[locale]/profile/page.tsx`** — composes `TopBar`, a guest-linking card
  (email/password + optional Google, shown only when `isGuest`), display-name
  and city fields, and the `useTheme()`-backed gender/dark-mode/language
  controls (each pairs an instant local theme change with a `PATCH /profile`
  persist call), plus logout for non-guest sessions.

**Layout contract** (`[locale]/layout.tsx`): owns `<html>`/`<body>`, the FOUC theme
script, fonts, `generateMetadata`, and the provider stack
`NextIntlClientProvider(locale, messages)` → `AuthProvider` → `ThemeProvider` →
phone-width column + `BottomNav`. Two lines in it are **load-bearing for i18n**:
the `setRequestLocale(locale)` call and the explicit `locale={locale}` prop on
`NextIntlClientProvider`. Removing either regresses every non-default locale to
the Indonesian bundle and breaks locale-prefix stripping in `usePathname()`
(symptom: `/en` pages render Indonesian; switching language from `/en/profile`
back to Indonesia lands on `/id/en/profile` → 404).
