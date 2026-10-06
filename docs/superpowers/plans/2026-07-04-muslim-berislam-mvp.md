# Muslim Berislam MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mobile-first PWA — dashboard with time-based dua cards + daily todos, template-based todo journal, profile with gender theming (Ikhwan/Akhwat × light/dark), guest mode via Supabase anonymous auth.

**Architecture:** Next.js 16 frontend (App Router, next-intl, shadcn/ui, Tailwind v4) talks to Express 5 API via `Authorization: Bearer <supabase-jwt>`. Express verifies JWTs with `@supabase/server/core` and queries Postgres through RLS-scoped clients. Static reference data (duas, system templates) cached in-process with a TTL Map (Redis alternative). Daily todo lists are computed from recurrence schedules + completions — never materialized.

**Tech Stack:** Next.js 16.2.10, React 19, next-intl, shadcn/ui, Tailwind v4, lucide-react, Express 5 (CommonJS), `@supabase/server`, `@supabase/supabase-js`, Supabase Postgres + Auth.

**Spec:** `docs/superpowers/specs/2026-07-04-muslim-berislam-mvp-design.md`

**Conventions for this plan:**
- NO git commits (workspace is intentionally not a git repo). Each task ends with a verification step instead.
- No test runner configured; verification is curl + browser. Do not add a test framework.
- Frontend rule: before using any Next.js API you are unsure of, check `frontend/node_modules/next/dist/docs/` (project CLAUDE.md requirement).
- Every user-visible string goes through `useTranslations()` and must be added to ALL THREE of `messages/id.json`, `messages/en.json`, `messages/ms.json`.
- Server is CommonJS. `@supabase/server` may be ESM-only — the middleware task uses dynamic `import()` which works from CJS.

---

## Task 0: Supabase dashboard prerequisites (manual, user does this)

No files. Tell the user to do these in the Supabase dashboard (project `your-project-ref`) and wait for confirmation:

- [ ] **Step 1:** Authentication → Sign In / Up → enable **Anonymous sign-ins** (required for guest mode)
- [ ] **Step 2:** Authentication → Sign In / Up → Email: keep enabled (email + password)
- [ ] **Step 3:** Authentication → Sign In / Up → Google: enable, paste OAuth Client ID/Secret from Google Cloud Console (callback URL shown in dashboard). May be deferred — email + guest work without it; if deferred, hide the Google button (Task 16 has a flag).
- [ ] **Step 4:** Remind user: the secret key was pasted into this chat. It only goes in `server/.env` (gitignored, but there is no repo anyway). If this project ever becomes shared, rotate the key in dashboard → Settings → API keys.

---

## Task 1: Server env + dependencies

**Files:**
- Create: `server/.env`
- Create: `server/.gitignore`
- Modify: `server/package.json` (via npm install)

- [ ] **Step 1: Write `server/.env`** (real values — user already provided them):

```dotenv
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
SUPABASE_JWKS_URL=https://your-project-ref.supabase.co/auth/v1/.well-known/jwks.json
PORT=4000
CLIENT_URL=http://localhost:3000
```

- [ ] **Step 2: Write `server/.gitignore`**:

```
node_modules/
.env
```

- [ ] **Step 3: Install packages** (from `server/`):

```powershell
npm install @supabase/server @supabase/supabase-js
```

Expected: both added to `dependencies` in `server/package.json`, no errors.

- [ ] **Step 4: Read the installed docs.** Read `server/node_modules/@supabase/server/docs/core-primitives.md` and `docs/api-reference.md`. The middleware in Task 4 was written from the skill summary — **exact function signatures must be corrected against these docs before implementing Task 4.**

- [ ] **Step 5: Verify server still boots:** `npm run dev` from `server/`, expect `Server running on http://localhost:4000`, then stop it.

---

## Task 2: Database schema

**Files:**
- Create: `server/db/schema.sql`

- [ ] **Step 1: Write `server/db/schema.sql`** — complete content:

```sql
-- Muslim Berislam MVP schema. Run in Supabase SQL editor.
-- Idempotent-ish: drop-free; safe on a fresh project.

-- ── profiles ──────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  photo_url text,
  gender text not null default 'ikhwan' check (gender in ('ikhwan','akhwat')),
  theme_mode text not null default 'system' check (theme_mode in ('light','dark','system')),
  locale text not null default 'id' check (locale in ('id','en','ms')),
  city text,
  prayer_windows jsonb not null default '{"morning":[5,10],"afternoon":[10,15],"evening":[15,18],"night":[18,5]}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "own profile read"  on public.profiles for select using (id = auth.uid());
create policy "own profile update" on public.profiles for update using (id = auth.uid());

-- Auto-create profile for every new auth user (incl. anonymous)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── duas (public read, seeded) ────────────────────────────
create table if not exists public.duas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  arabic text not null,
  latin text not null,
  translations jsonb not null, -- {"id":"...","en":"...","ms":"..."}
  time_category text not null check (time_category in ('morning','afternoon','evening','night','any'))
);

alter table public.duas enable row level security;
create policy "duas public read" on public.duas for select using (true);

create index if not exists duas_time_category_idx on public.duas (time_category);

-- ── templates + items ─────────────────────────────────────
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade, -- NULL = system
  kind text not null check (kind in ('group','single')),
  name text not null, -- i18n key for system rows, literal text for user rows
  is_system boolean generated always as (owner_id is null) stored,
  created_at timestamptz not null default now()
);

alter table public.templates enable row level security;
create policy "templates read"   on public.templates for select using (owner_id is null or owner_id = auth.uid());
create policy "templates insert" on public.templates for insert with check (owner_id = auth.uid());
create policy "templates update" on public.templates for update using (owner_id = auth.uid());
create policy "templates delete" on public.templates for delete using (owner_id = auth.uid());

create index if not exists templates_owner_idx on public.templates (owner_id);

create table if not exists public.template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  title text not null, -- i18n key for system items, literal for user items
  sort_order int not null default 0
);

alter table public.template_items enable row level security;
create policy "items read" on public.template_items for select
  using (exists (select 1 from public.templates t where t.id = template_id and (t.owner_id is null or t.owner_id = auth.uid())));
create policy "items insert" on public.template_items for insert
  with check (exists (select 1 from public.templates t where t.id = template_id and t.owner_id = auth.uid()));
create policy "items update" on public.template_items for update
  using (exists (select 1 from public.templates t where t.id = template_id and t.owner_id = auth.uid()));
create policy "items delete" on public.template_items for delete
  using (exists (select 1 from public.templates t where t.id = template_id and t.owner_id = auth.uid()));

create index if not exists template_items_template_idx on public.template_items (template_id);

-- ── todo_schedules ────────────────────────────────────────
create table if not exists public.todo_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_item_id uuid references public.template_items(id) on delete cascade,
  custom_title text,
  recurrence text not null check (recurrence in ('once','daily','weekly')),
  once_date date,
  weekly_days int[] , -- 0=Sunday..6=Saturday
  source text not null default 'journal' check (source in ('quick_add','journal')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint title_xor check (
    (template_item_id is not null and custom_title is null)
    or (template_item_id is null and custom_title is not null)
  ),
  constraint once_needs_date   check (recurrence <> 'once'   or once_date is not null),
  constraint weekly_needs_days check (recurrence <> 'weekly' or (weekly_days is not null and array_length(weekly_days,1) > 0))
);

alter table public.todo_schedules enable row level security;
create policy "schedules all own" on public.todo_schedules for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists todo_schedules_user_active_idx on public.todo_schedules (user_id, active);

-- ── todo_completions ──────────────────────────────────────
create table if not exists public.todo_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  schedule_id uuid not null references public.todo_schedules(id) on delete cascade,
  on_date date not null,
  completed_at timestamptz not null default now(),
  unique (schedule_id, on_date)
);

alter table public.todo_completions enable row level security;
create policy "completions all own" on public.todo_completions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists todo_completions_user_date_idx on public.todo_completions (user_id, on_date);
```

- [ ] **Step 2: Run it.** User pastes `server/db/schema.sql` into Supabase SQL editor and runs. Expected: "Success. No rows returned".

- [ ] **Step 3: Verify:** In SQL editor: `select tablename from pg_tables where schemaname='public';` — expect `profiles, duas, templates, template_items, todo_schedules, todo_completions`.

---

## Task 3: Seed data

**Files:**
- Create: `server/db/seed.sql`

- [ ] **Step 1: Write `server/db/seed.sql`** — complete content:

```sql
-- Seed: 8 duas + system templates. Run AFTER schema.sql. Idempotent via on conflict.

insert into public.duas (slug, arabic, latin, translations, time_category) values
('doa-bangun-tidur',
 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
 'Alhamdulillahilladzi ahyana ba''da ma amatana wa ilaihin nusyur',
 '{"id":"Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dibangkitkan.","en":"All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.","ms":"Segala puji bagi Allah yang menghidupkan kami selepas mematikan kami, dan kepada-Nya kami dibangkitkan."}',
 'morning'),
('doa-sebelum-makan',
 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
 'Allahumma barik lana fima razaqtana wa qina ''adzaban-nar',
 '{"id":"Ya Allah, berkahilah kami pada apa yang Engkau rezekikan kepada kami dan peliharalah kami dari siksa neraka.","en":"O Allah, bless us in what You have provided us and protect us from the punishment of the Fire.","ms":"Ya Allah, berkatilah kami pada rezeki yang Engkau kurniakan dan peliharalah kami daripada azab neraka."}',
 'any'),
('doa-belajar',
 'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا',
 'Rabbi zidni ''ilman warzuqni fahman',
 '{"id":"Ya Tuhanku, tambahkanlah ilmuku dan berilah aku pemahaman.","en":"My Lord, increase me in knowledge and grant me understanding.","ms":"Wahai Tuhanku, tambahkanlah ilmuku dan kurniakanlah aku kefahaman."}',
 'any'),
('dzikir-petang',
 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
 'Amsaina wa amsal mulku lillah walhamdulillah, la ilaha illallah wahdahu la syarika lah',
 '{"id":"Kami memasuki waktu petang dan kerajaan hanya milik Allah, segala puji bagi Allah. Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya.","en":"We have entered the evening and the dominion belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah alone, without partner.","ms":"Kami memasuki waktu petang dan kerajaan adalah milik Allah, segala puji bagi Allah. Tiada tuhan melainkan Allah yang Esa, tiada sekutu bagi-Nya."}',
 'evening'),
('doa-maghrib',
 'اللَّهُمَّ هَذَا إِقْبَالُ لَيْلِكَ وَإِدْبَارُ نَهَارِكَ وَأَصْوَاتُ دُعَاتِكَ فَاغْفِرْ لِي',
 'Allahumma hadza iqbalu lailika wa idbaru naharika wa ashwatu du''atika faghfir li',
 '{"id":"Ya Allah, inilah saat datangnya malam-Mu dan perginya siang-Mu serta suara para penyeru-Mu, maka ampunilah aku.","en":"O Allah, this is the approach of Your night and the retreat of Your day and the voices of Your callers, so forgive me.","ms":"Ya Allah, inilah kedatangan malam-Mu dan pemergian siang-Mu serta suara para penyeru-Mu, maka ampunilah aku."}',
 'evening'),
('doa-tidur',
 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
 'Bismika Allahumma amutu wa ahya',
 '{"id":"Dengan nama-Mu ya Allah aku mati dan aku hidup.","en":"In Your name, O Allah, I die and I live.","ms":"Dengan nama-Mu ya Allah aku mati dan aku hidup."}',
 'night'),
('doa-orang-tua',
 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
 'Rabbighfir li wa liwalidayya warhamhuma kama rabbayani shaghira',
 '{"id":"Ya Tuhanku, ampunilah aku dan kedua orang tuaku, dan sayangilah keduanya sebagaimana mereka mendidikku waktu kecil.","en":"My Lord, forgive me and my parents, and have mercy upon them as they brought me up when I was small.","ms":"Wahai Tuhanku, ampunilah aku dan kedua ibu bapaku, dan rahmatilah mereka sebagaimana mereka memeliharaku sewaktu kecil."}',
 'any'),
('doa-masuk-masjid',
 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
 'Allahummaftah li abwaba rahmatik',
 '{"id":"Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.","en":"O Allah, open for me the doors of Your mercy.","ms":"Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu."}',
 'any')
on conflict (slug) do nothing;

-- System templates. name/title columns hold i18n keys (resolved client-side).
-- Fixed UUIDs so reseeding stays idempotent.
insert into public.templates (id, owner_id, kind, name) values
('00000000-0000-0000-0000-000000000001', null, 'group',  'SystemTemplates.subuhRoutine'),
('00000000-0000-0000-0000-000000000002', null, 'group',  'SystemTemplates.malamRoutine'),
('00000000-0000-0000-0000-000000000011', null, 'single', 'SystemTemplates.shalatDhuha'),
('00000000-0000-0000-0000-000000000012', null, 'single', 'SystemTemplates.tilawahQuran'),
('00000000-0000-0000-0000-000000000013', null, 'single', 'SystemTemplates.shalatTahajud'),
('00000000-0000-0000-0000-000000000014', null, 'single', 'SystemTemplates.bersedekah')
on conflict (id) do nothing;

insert into public.template_items (id, template_id, title, sort_order) values
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'SystemTemplates.tahajud',      0),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'SystemTemplates.subuh',        1),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'SystemTemplates.dzikirPagi',   2),
('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'SystemTemplates.bacaQuran',    3),
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000002', 'SystemTemplates.maghrib',      0),
('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000002', 'SystemTemplates.dzikirPetang', 1),
('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000002', 'SystemTemplates.isya',         2),
('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000002', 'SystemTemplates.doaTidur',     3),
('00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0000-000000000011', 'SystemTemplates.shalatDhuha',  0),
('00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0000-000000000012', 'SystemTemplates.tilawahQuran', 0),
('00000000-0000-0000-0001-000000000013', '00000000-0000-0000-0000-000000000013', 'SystemTemplates.shalatTahajud',0),
('00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0000-000000000014', 'SystemTemplates.bersedekah',   0)
on conflict (id) do nothing;
```

- [ ] **Step 2: Run in Supabase SQL editor.** Expected: success.
- [ ] **Step 3: Verify:** `select count(*) from duas;` → 8. `select count(*) from templates where owner_id is null;` → 6.

---

## Task 4: TTL cache + Supabase auth middleware

**Files:**
- Create: `server/src/lib/cache.js`
- Create: `server/src/middleware/supabase.js`

- [ ] **Step 1: Write `server/src/lib/cache.js`** (the Redis alternative — in-process TTL cache):

```js
// In-process TTL cache. Single Node process, tiny hot data (duas, system
// templates) — a Map beats external infra here. Not for per-user data.
class TTLCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlMs) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key) {
    this.store.delete(key);
  }

  // get-or-load helper; concurrent callers share one in-flight promise
  async wrap(key, ttlMs, loader) {
    const hit = this.get(key);
    if (hit !== undefined) return hit;
    const inflightKey = `__inflight:${key}`;
    let promise = this.store.get(inflightKey)?.value;
    if (!promise) {
      promise = loader().finally(() => this.store.delete(inflightKey));
      this.store.set(inflightKey, { value: promise, expiresAt: Date.now() + 30000 });
    }
    const value = await promise;
    this.set(key, value, ttlMs);
    return value;
  }
}

module.exports = { cache: new TTLCache() };
```

- [ ] **Step 2: Write `server/src/middleware/supabase.js`.**

**IMPORTANT:** This reference implementation was written from the `@supabase/server` skill summary. Before writing this file, read `server/node_modules/@supabase/server/docs/core-primitives.md` and `docs/api-reference.md` (Task 1 Step 4) and correct the function names/signatures below to match the installed package. The intended behavior is fixed: verify the Bearer JWT, attach an RLS-scoped client as `req.supabase`, an admin client as `req.supabaseAdmin`, and the user id as `req.userId`; respond 401 JSON on failure.

```js
// Express adapter over @supabase/server/core (no official Express adapter yet).
// Package may be ESM-only; dynamic import() works from CommonJS.
let corePromise;
const loadCore = () => (corePromise ??= import("@supabase/server/core"));

let adminClient;

async function requireUser(req, res, next) {
  try {
    const core = await loadCore();
    // Verify credentials from the incoming request (expects
    // Authorization: Bearer <jwt>). Adjust call shape per docs/api-reference.md.
    const result = await core.verifyCredentials(req.headers.authorization, {
      mode: "user",
    });
    if (result.error || !result.data) {
      return res.status(401).json({ error: { message: "Invalid or missing token", code: "unauthorized" } });
    }
    req.userId = result.data.sub ?? result.data.userId;
    // RLS-scoped client bound to this user's JWT:
    req.supabase = core.createContextClient(result.data);
    // Admin client (bypasses RLS) — created once, reused:
    adminClient ??= core.createAdminClient();
    req.supabaseAdmin = adminClient;
    next();
  } catch (err) {
    return res.status(401).json({ error: { message: "Authentication failed", code: "unauthorized" } });
  }
}

// For public endpoints that still want the admin client (e.g. cached duas).
async function withAdmin(req, res, next) {
  try {
    const core = await loadCore();
    adminClient ??= core.createAdminClient();
    req.supabaseAdmin = adminClient;
    next();
  } catch (err) {
    return res.status(500).json({ error: { message: "Server auth setup failed", code: "internal" } });
  }
}

module.exports = { requireUser, withAdmin };
```

- [ ] **Step 3: Verify:** `node -e "require('./src/lib/cache.js'); require('./src/middleware/supabase.js'); console.log('ok')"` from `server/` → prints `ok`.

---

## Task 5: API routes — duas + profile

**Files:**
- Create: `server/src/routes/duas.js`
- Create: `server/src/routes/profile.js`

- [ ] **Step 1: Write `server/src/routes/duas.js`** (cached; random pick per request):

```js
const express = require("express");
const { cache } = require("../lib/cache");
const { withAdmin } = require("../middleware/supabase");

const router = express.Router();
const DUAS_TTL_MS = 60 * 60 * 1000; // 1h; seed data changes ~never

const CATEGORIES = ["morning", "afternoon", "evening", "night", "any"];

// GET /api/duas/current?category=morning
// Returns one random dua for the category (falls back to 'any').
router.get("/current", withAdmin, async (req, res, next) => {
  try {
    const category = CATEGORIES.includes(req.query.category) ? req.query.category : "any";
    const all = await cache.wrap("duas:all", DUAS_TTL_MS, async () => {
      const { data, error } = await req.supabaseAdmin.from("duas").select("*");
      if (error) throw error;
      return data;
    });
    let pool = all.filter((d) => d.time_category === category);
    if (pool.length === 0) pool = all.filter((d) => d.time_category === "any");
    if (pool.length === 0) pool = all;
    const dua = pool[Math.floor(Math.random() * pool.length)];
    res.set("Cache-Control", "no-store"); // random per request
    res.json(dua);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 2: Write `server/src/routes/profile.js`**:

```js
const express = require("express");
const { requireUser } = require("../middleware/supabase");

const router = express.Router();

router.get("/", requireUser, async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from("profiles").select("*").eq("id", req.userId).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

const EDITABLE = ["display_name", "photo_url", "gender", "theme_mode", "locale", "city", "prayer_windows"];

router.patch("/", requireUser, async (req, res, next) => {
  try {
    const patch = {};
    for (const key of EDITABLE) if (key in req.body) patch[key] = req.body[key];
    if (Object.keys(patch).length === 0) {
      return res.status(422).json({ error: { message: "No editable fields in body", code: "validation" } });
    }
    patch.updated_at = new Date().toISOString();
    const { data, error } = await req.supabase
      .from("profiles").update(patch).eq("id", req.userId).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 3: Verify syntax:** `node -e "require('./src/routes/duas.js'); require('./src/routes/profile.js'); console.log('ok')"` → `ok`. (Live curl happens in Task 8.)

---

## Task 6: API routes — templates

**Files:**
- Create: `server/src/routes/templates.js`

- [ ] **Step 1: Write `server/src/routes/templates.js`** (system templates cached 1h; user templates always fresh):

```js
const express = require("express");
const { cache } = require("../lib/cache");
const { requireUser } = require("../middleware/supabase");

const router = express.Router();
const SYSTEM_TTL_MS = 60 * 60 * 1000;

// GET /api/templates → { system: [...], mine: [...] } each with nested items
router.get("/", requireUser, async (req, res, next) => {
  try {
    const system = await cache.wrap("templates:system", SYSTEM_TTL_MS, async () => {
      const { data, error } = await req.supabaseAdmin
        .from("templates")
        .select("id, kind, name, is_system, template_items(id, title, sort_order)")
        .is("owner_id", null)
        .order("sort_order", { referencedTable: "template_items" });
      if (error) throw error;
      return data;
    });
    const { data: mine, error } = await req.supabase
      .from("templates")
      .select("id, kind, name, is_system, template_items(id, title, sort_order)")
      .eq("owner_id", req.userId)
      .order("created_at");
    if (error) throw error;
    res.json({ system, mine });
  } catch (err) {
    next(err);
  }
});

// POST /api/templates  body: { name, kind: 'group'|'single', items: ["title", ...] }
router.post("/", requireUser, async (req, res, next) => {
  try {
    const { name, kind, items } = req.body;
    if (!name || !["group", "single"].includes(kind) || !Array.isArray(items) || items.length === 0) {
      return res.status(422).json({ error: { message: "name, kind, non-empty items required", code: "validation" } });
    }
    const { data: template, error } = await req.supabase
      .from("templates").insert({ owner_id: req.userId, name, kind }).select().single();
    if (error) throw error;
    const rows = items.map((title, i) => ({ template_id: template.id, title, sort_order: i }));
    const { data: createdItems, error: itemsError } = await req.supabase
      .from("template_items").insert(rows).select();
    if (itemsError) throw itemsError;
    res.status(201).json({ ...template, template_items: createdItems });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/templates/:id — RLS blocks system/foreign templates
router.delete("/:id", requireUser, async (req, res, next) => {
  try {
    const { error, count } = await req.supabase
      .from("templates").delete({ count: "exact" }).eq("id", req.params.id);
    if (error) throw error;
    if (count === 0) return res.status(404).json({ error: { message: "Not found or not yours", code: "not_found" } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 2: Verify syntax:** `node -e "require('./src/routes/templates.js'); console.log('ok')"` → `ok`.

---

## Task 7: API routes — todos

**Files:**
- Create: `server/src/routes/todos.js`

- [ ] **Step 1: Write `server/src/routes/todos.js`.** Client sends its local `date` (YYYY-MM-DD) and `dow` (0-6) so server timezone never matters:

```js
const express = require("express");
const { requireUser } = require("../middleware/supabase");

const router = express.Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDay(req, res) {
  const { date, dow } = { ...req.query, ...req.body };
  const dowNum = Number(dow);
  if (!DATE_RE.test(date ?? "") || !(dowNum >= 0 && dowNum <= 6)) {
    res.status(422).json({ error: { message: "date (YYYY-MM-DD) and dow (0-6) required", code: "validation" } });
    return null;
  }
  return { date, dow: dowNum };
}

// GET /api/todos/today?date=2026-07-04&dow=6
router.get("/today", requireUser, async (req, res, next) => {
  try {
    const day = parseDay(req, res);
    if (!day) return;
    const { data: schedules, error } = await req.supabase
      .from("todo_schedules")
      .select("id, custom_title, recurrence, once_date, weekly_days, source, template_items(title)")
      .eq("active", true)
      .or(
        `and(recurrence.eq.once,once_date.eq.${day.date}),` +
        `recurrence.eq.daily,` +
        `and(recurrence.eq.weekly,weekly_days.cs.{${day.dow}})`
      );
    if (error) throw error;

    const ids = schedules.map((s) => s.id);
    let completedSet = new Set();
    if (ids.length > 0) {
      const { data: completions, error: cErr } = await req.supabase
        .from("todo_completions").select("schedule_id").eq("on_date", day.date).in("schedule_id", ids);
      if (cErr) throw cErr;
      completedSet = new Set(completions.map((c) => c.schedule_id));
    }

    res.json(
      schedules.map((s) => ({
        schedule_id: s.id,
        title: s.custom_title ?? s.template_items?.title ?? "",
        is_system_title: s.custom_title == null, // i18n key → resolve client-side
        source: s.source,
        recurrence: s.recurrence,
        completed: completedSet.has(s.id),
      }))
    );
  } catch (err) {
    next(err);
  }
});

// POST /api/todos
// body: { custom_title? , template_item_id?, recurrence, once_date?, weekly_days?, source }
router.post("/", requireUser, async (req, res, next) => {
  try {
    const { custom_title, template_item_id, recurrence, once_date, weekly_days, source } = req.body;
    if (!["once", "daily", "weekly"].includes(recurrence))
      return res.status(422).json({ error: { message: "recurrence must be once|daily|weekly", code: "validation" } });
    if (!custom_title === !template_item_id)
      return res.status(422).json({ error: { message: "exactly one of custom_title / template_item_id", code: "validation" } });
    if (recurrence === "once" && !DATE_RE.test(once_date ?? ""))
      return res.status(422).json({ error: { message: "once_date required for recurrence=once", code: "validation" } });
    if (recurrence === "weekly" && (!Array.isArray(weekly_days) || weekly_days.length === 0))
      return res.status(422).json({ error: { message: "weekly_days required for recurrence=weekly", code: "validation" } });

    const { data, error } = await req.supabase
      .from("todo_schedules")
      .insert({
        user_id: req.userId,
        custom_title: custom_title ?? null,
        template_item_id: template_item_id ?? null,
        recurrence,
        once_date: recurrence === "once" ? once_date : null,
        weekly_days: recurrence === "weekly" ? weekly_days : null,
        source: source === "quick_add" ? "quick_add" : "journal",
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/todos/:scheduleId/toggle  body: { date, dow }
router.post("/:scheduleId/toggle", requireUser, async (req, res, next) => {
  try {
    const day = parseDay(req, res);
    if (!day) return;
    const scheduleId = req.params.scheduleId;
    const { data: existing, error } = await req.supabase
      .from("todo_completions").select("id").eq("schedule_id", scheduleId).eq("on_date", day.date).maybeSingle();
    if (error) throw error;
    if (existing) {
      const { error: dErr } = await req.supabase.from("todo_completions").delete().eq("id", existing.id);
      if (dErr) throw dErr;
      return res.json({ completed: false });
    }
    const { error: iErr } = await req.supabase
      .from("todo_completions").insert({ user_id: req.userId, schedule_id: scheduleId, on_date: day.date });
    if (iErr) throw iErr;
    res.json({ completed: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/todos/:scheduleId (deactivate — history stays)
router.delete("/:scheduleId", requireUser, async (req, res, next) => {
  try {
    const { error, count } = await req.supabase
      .from("todo_schedules").update({ active: false }, { count: "exact" }).eq("id", req.params.scheduleId);
    if (error) throw error;
    if (count === 0) return res.status(404).json({ error: { message: "Not found", code: "not_found" } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 2: Verify syntax:** `node -e "require('./src/routes/todos.js'); console.log('ok')"` → `ok`.

---

## Task 8: Wire routes + error handler into Express

**Files:**
- Modify: `server/src/index.js`
- Modify: `server/src/routes/index.js`

- [ ] **Step 1: Rewrite `server/src/routes/index.js`**:

```js
const express = require("express");
const router = express.Router();

router.use("/duas", require("./duas"));
router.use("/profile", require("./profile"));
router.use("/templates", require("./templates"));
router.use("/todos", require("./todos"));

module.exports = router;
```

- [ ] **Step 2: Add error handler in `server/src/index.js`** — after `app.use("/api", indexRouter);`, before `app.listen`:

```js
// Central error handler — consistent {error:{message,code}} shape
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || (err.code === "PGRST116" ? 404 : 500);
  res.status(status).json({
    error: { message: err.message || "Internal server error", code: err.code || "internal" },
  });
});
```

- [ ] **Step 3: Live verification.** Start `npm run dev`. Then:
  - `curl http://localhost:4000/api/health` → `{"status":"ok",...}`
  - `curl "http://localhost:4000/api/duas/current?category=morning"` → the bangun-tidur dua JSON (random from morning pool)
  - `curl http://localhost:4000/api/profile` → 401 `{"error":{...}}`
  - Second `curl` to duas: server log should show no second DB query pattern (cache hit) — or add a temporary `console.log` in the loader to confirm, then remove it.

- [ ] **Step 4 (auth smoke test):** Get a real JWT: in Supabase dashboard → SQL editor won't give one; instead run this once in browser console on any page after Task 10 frontend exists, or use curl:

```powershell
curl -X POST "https://your-project-ref.supabase.co/auth/v1/signup" -H "apikey: your_supabase_publishable_key" -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"test1234!\"}"
```

Take `access_token` from response, then `curl http://localhost:4000/api/profile -H "Authorization: Bearer <token>"` → profile row JSON (auto-created by trigger). If this fails, fix Task 4 middleware against package docs before proceeding.

---

## Task 9: Frontend deps + env + Supabase client

**Files:**
- Create: `frontend/.env.local`
- Create: `frontend/src/lib/supabase.ts`
- Modify: `frontend/package.json` (via npm install)

- [ ] **Step 1: Install** (from `frontend/`): `npm install @supabase/supabase-js`

- [ ] **Step 2: Write `frontend/.env.local`**:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=false
```

(`NEXT_PUBLIC_ENABLE_GOOGLE_AUTH` → `true` once Task 0 Step 3 done.)

- [ ] **Step 3: Write `frontend/src/lib/supabase.ts`**:

```ts
"use client";

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
```

- [ ] **Step 4: Verify:** `npm run dev` from `frontend/`, no build errors, stop.

---

## Task 10: Auth provider (guest auto sign-in) + API helper with client cache

**Files:**
- Create: `frontend/src/components/auth-provider.tsx`
- Create: `frontend/src/lib/api.ts`

- [ ] **Step 1: Write `frontend/src/components/auth-provider.tsx`** — ensures a session always exists (anonymous if needed):

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthState = {
  session: Session | null;
  isGuest: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, isGuest: true, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, isGuest: true, loading: true });

  useEffect(() => {
    let cancelled = false;

    async function ensureSession() {
      const { data } = await supabase.auth.getSession();
      let session = data.session;
      if (!session) {
        const { data: anon, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Anonymous sign-in failed:", error.message);
          if (!cancelled) setState({ session: null, isGuest: true, loading: false });
          return;
        }
        session = anon.session;
      }
      if (!cancelled) {
        setState({ session, isGuest: session?.user.is_anonymous ?? true, loading: false });
      }
    }

    ensureSession();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, isGuest: session?.user.is_anonymous ?? true, loading: false });
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 2: Write `frontend/src/lib/api.ts`** — fetch wrapper + module-level TTL cache for GETs that rarely change:

```ts
"use client";

import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Client-side TTL cache (Redis alternative, browser edition).
// Only for near-static GETs; mutations call invalidate().
const clientCache = new Map<string, { value: unknown; expiresAt: number }>();

export function invalidate(prefix: string) {
  for (const key of clientCache.keys()) if (key.startsWith(prefix)) clientCache.delete(key);
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
  cacheTtlMs = 0,
): Promise<T> {
  const cacheKey = `${init.method ?? "GET"}:${path}`;
  if (cacheTtlMs > 0) {
    const hit = clientCache.get(cacheKey);
    if (hit && Date.now() < hit.expiresAt) return hit.value as T;
  }

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 204) return undefined as T;
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? `Request failed (${res.status})`);

  if (cacheTtlMs > 0) clientCache.set(cacheKey, { value: body, expiresAt: Date.now() + cacheTtlMs });
  return body as T;
}

// Local-date helpers (server is timezone-agnostic; client owns "today")
export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const todayDow = () => new Date().getDay();
```

- [ ] **Step 3: Verify:** `npx tsc --noEmit` from `frontend/` → no errors in these two files (pre-existing errors elsewhere out of scope).

---

## Task 11: Theme system — 4 palettes + provider

**Files:**
- Modify: `frontend/src/app/globals.css` (append theme blocks)
- Create: `frontend/src/components/theme-provider.tsx`

- [ ] **Step 1: Append to `frontend/src/app/globals.css`** (after the `.dark { ... }` block, before `@layer base`). Existing `:root`/`.dark` stay as neutral fallback; gender attributes override:

```css
/* ── Gender themes: Ikhwan (emerald + gold) ─────────────── */
html[data-gender="ikhwan"] {
  --background: oklch(0.99 0.005 150);
  --foreground: oklch(0.2 0.03 170);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0.03 170);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2 0.03 170);
  --primary: oklch(0.42 0.09 168);
  --primary-foreground: oklch(0.98 0.01 150);
  --secondary: oklch(0.95 0.02 160);
  --secondary-foreground: oklch(0.3 0.05 170);
  --muted: oklch(0.96 0.01 160);
  --muted-foreground: oklch(0.5 0.03 170);
  --accent: oklch(0.85 0.09 88);         /* gold */
  --accent-foreground: oklch(0.3 0.06 80);
  --border: oklch(0.9 0.015 160);
  --input: oklch(0.9 0.015 160);
  --ring: oklch(0.42 0.09 168);
}

html[data-gender="ikhwan"].dark {
  --background: oklch(0.17 0.02 175);
  --foreground: oklch(0.95 0.01 150);
  --card: oklch(0.22 0.025 172);
  --card-foreground: oklch(0.95 0.01 150);
  --popover: oklch(0.22 0.025 172);
  --popover-foreground: oklch(0.95 0.01 150);
  --primary: oklch(0.75 0.1 165);
  --primary-foreground: oklch(0.17 0.03 175);
  --secondary: oklch(0.28 0.03 170);
  --secondary-foreground: oklch(0.95 0.01 150);
  --muted: oklch(0.26 0.025 172);
  --muted-foreground: oklch(0.7 0.02 160);
  --accent: oklch(0.8 0.11 88);          /* gold pops on dark */
  --accent-foreground: oklch(0.2 0.05 80);
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 16%);
  --ring: oklch(0.75 0.1 165);
}

/* ── Gender themes: Akhwat (plum + champagne) ───────────── */
html[data-gender="akhwat"] {
  --background: oklch(0.99 0.005 350);
  --foreground: oklch(0.22 0.04 345);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.22 0.04 345);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.22 0.04 345);
  --primary: oklch(0.45 0.12 350);
  --primary-foreground: oklch(0.98 0.005 350);
  --secondary: oklch(0.95 0.02 350);
  --secondary-foreground: oklch(0.32 0.06 348);
  --muted: oklch(0.96 0.01 350);
  --muted-foreground: oklch(0.52 0.04 348);
  --accent: oklch(0.89 0.05 85);         /* champagne */
  --accent-foreground: oklch(0.35 0.05 70);
  --border: oklch(0.91 0.02 350);
  --input: oklch(0.91 0.02 350);
  --ring: oklch(0.45 0.12 350);
}

html[data-gender="akhwat"].dark {
  --background: oklch(0.18 0.03 340);
  --foreground: oklch(0.95 0.01 350);
  --card: oklch(0.23 0.035 342);
  --card-foreground: oklch(0.95 0.01 350);
  --popover: oklch(0.23 0.035 342);
  --popover-foreground: oklch(0.95 0.01 350);
  --primary: oklch(0.76 0.09 350);
  --primary-foreground: oklch(0.2 0.04 345);
  --secondary: oklch(0.29 0.04 344);
  --secondary-foreground: oklch(0.95 0.01 350);
  --muted: oklch(0.27 0.035 342);
  --muted-foreground: oklch(0.71 0.02 350);
  --accent: oklch(0.84 0.07 85);
  --accent-foreground: oklch(0.25 0.04 70);
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 16%);
  --ring: oklch(0.76 0.09 350);
}
```

- [ ] **Step 2: Write `frontend/src/components/theme-provider.tsx`** — applies gender + dark to `<html>`, persists locally for instant paint, syncs from profile after auth:

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Gender = "ikhwan" | "akhwat";
export type ThemeMode = "light" | "dark" | "system";

type ThemeState = {
  gender: Gender;
  mode: ThemeMode;
  setGender: (g: Gender) => void;
  setMode: (m: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

function applyTheme(gender: Gender, mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.gender = gender;
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [gender, setGenderState] = useState<Gender>("ikhwan");
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    const g = (localStorage.getItem("mb.gender") as Gender) || "ikhwan";
    const m = (localStorage.getItem("mb.mode") as ThemeMode) || "system";
    setGenderState(g);
    setModeState(m);
    applyTheme(g, m);
  }, []);

  const setGender = useCallback(
    (g: Gender) => {
      setGenderState(g);
      localStorage.setItem("mb.gender", g);
      applyTheme(g, mode);
    },
    [mode],
  );

  const setMode = useCallback(
    (m: ThemeMode) => {
      setModeState(m);
      localStorage.setItem("mb.mode", m);
      applyTheme(gender, m);
    },
    [gender],
  );

  return (
    <ThemeContext.Provider value={{ gender, mode, setGender, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme outside ThemeProvider");
  return ctx;
}
```

- [ ] **Step 3: Add FOUC-prevention inline script** in `frontend/src/app/[locale]/layout.tsx` — inside `<html>`, first child of `<body>` won't work; put in `<head>` via `<script dangerouslySetInnerHTML>` right inside `<html>`:

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `try{var g=localStorage.getItem("mb.gender")||"ikhwan";var m=localStorage.getItem("mb.mode")||"system";document.documentElement.dataset.gender=g;var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}`,
  }}
/>
```

(Next 16 may warn about script placement — check `node_modules/next/dist/docs/` for the current recommended pattern for theme scripts if a warning appears.)

- [ ] **Step 4: Verify:** dev server, in browser console run `document.documentElement.dataset.gender = "akhwat"` → page tint shifts plum. Toggle `document.documentElement.classList.add("dark")` → dark palette.

---

## Task 12: i18n messages — full key set, all 3 locales

**Files:**
- Modify: `frontend/messages/id.json`, `frontend/messages/en.json`, `frontend/messages/ms.json`

- [ ] **Step 1: Replace `frontend/messages/id.json`** with existing keys PLUS new namespaces (keep `Index`, `Features`, `Nav` as-is; add below). Full new namespaces for id:

```json
{
  "Nav": {
    "languageLabel": "Bahasa", "id": "Indonesia", "en": "English", "ms": "Melayu",
    "dashboard": "Beranda", "journal": "Jurnal", "profile": "Profil"
  },
  "Dashboard": {
    "welcome": "Selamat datang, {name}",
    "guestName": "Sahabat",
    "prayedToday": "Sudahkah berdoa hari ini?",
    "duaOfTheMoment": "Doa untukmu",
    "todayTodos": "Rencana hari ini",
    "emptyTodos": "Belum ada rencana hari ini",
    "goToJournal": "Buka Jurnal",
    "quickAddTitle": "Tambah cepat",
    "quickAddPlaceholder": "Apa rencanamu hari ini?",
    "quickAddHint": "Hanya untuk hari ini — tidak jadi template",
    "add": "Tambah",
    "cancel": "Batal"
  },
  "Journal": {
    "title": "Jurnal",
    "todoCard": "Todo",
    "todoCardDesc": "Rencanakan ibadah & kegiatan harianmu",
    "comingSoon": "Segera hadir",
    "systemTemplates": "Template bawaan",
    "myTemplates": "Template saya",
    "newTemplate": "Buat template",
    "templateName": "Nama template",
    "templateItems": "Daftar kegiatan (satu per baris)",
    "save": "Simpan",
    "delete": "Hapus",
    "activate": "Jadwalkan",
    "recurrenceTitle": "Kapan muncul?",
    "tomorrow": "Besok",
    "daily": "Setiap hari",
    "weekly": "Hari tertentu",
    "pickDate": "Tanggal tertentu",
    "days": {"0":"Min","1":"Sen","2":"Sel","3":"Rab","4":"Kam","5":"Jum","6":"Sab"},
    "scheduled": "Terjadwal ✓"
  },
  "Profile": {
    "title": "Profil",
    "name": "Nama",
    "gender": "Tampilan",
    "ikhwan": "Ikhwan",
    "akhwat": "Akhwat",
    "darkMode": "Mode gelap",
    "light": "Terang", "dark": "Gelap", "system": "Ikuti sistem",
    "language": "Bahasa",
    "city": "Kota (waktu doa)",
    "prayerWindows": "Jam waktu doa",
    "logout": "Keluar",
    "guestBanner": "Kamu memakai mode tamu. Simpan akunmu agar data tidak hilang.",
    "saveAccount": "Simpan akun",
    "email": "Email", "password": "Kata sandi",
    "signUp": "Daftar", "signIn": "Masuk",
    "continueGoogle": "Lanjut dengan Google",
    "saved": "Tersimpan"
  },
  "Dua": {
    "morning": "Pagi", "afternoon": "Siang", "evening": "Sore", "night": "Malam"
  },
  "SystemTemplates": {
    "subuhRoutine": "Rutinitas Subuh",
    "malamRoutine": "Rutinitas Malam",
    "tahajud": "Shalat Tahajud",
    "subuh": "Shalat Subuh",
    "dzikirPagi": "Dzikir Pagi",
    "bacaQuran": "Baca Quran",
    "maghrib": "Shalat Maghrib",
    "dzikirPetang": "Dzikir Petang",
    "isya": "Shalat Isya",
    "doaTidur": "Doa Tidur",
    "shalatDhuha": "Shalat Dhuha",
    "tilawahQuran": "Tilawah Quran",
    "shalatTahajud": "Shalat Tahajud",
    "bersedekah": "Bersedekah"
  },
  "Common": {
    "loading": "Memuat…",
    "error": "Terjadi kesalahan. Coba lagi.",
    "retry": "Coba lagi"
  }
}
```

- [ ] **Step 2: `frontend/messages/en.json`** — same key tree, English values (translate all of the above; e.g. `welcome`: "Welcome, {name}", `guestName`: "Friend", `prayedToday`: "Have you prayed today?", `emptyTodos`: "No plans for today yet", `quickAddHint`: "Today only — won't become a template", `guestBanner`: "You're in guest mode. Save your account so your data isn't lost.", `SystemTemplates.subuhRoutine`: "Fajr Routine", `malamRoutine`: "Night Routine", etc. — complete every key, no omissions).

- [ ] **Step 3: `frontend/messages/ms.json`** — same key tree, Malay values (e.g. `welcome`: "Selamat datang, {name}", `prayedToday`: "Sudahkah anda berdoa hari ini?", `emptyTodos`: "Tiada rancangan hari ini lagi", `SystemTemplates.subuhRoutine`: "Rutin Subuh" — complete every key).

- [ ] **Step 4: Verify:** `npm run dev`, no next-intl missing-message console errors on `/id`, `/en`, `/ms`.

---

## Task 13: App shell — bottom nav + top bar + providers

**Files:**
- Create: `frontend/src/components/bottom-nav.tsx`
- Create: `frontend/src/components/top-bar.tsx`
- Modify: `frontend/src/app/[locale]/layout.tsx`

- [ ] **Step 1: Write `frontend/src/components/bottom-nav.tsx`**:

```tsx
"use client";

import { Home, NotebookPen, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "../../i18n/routing";

const tabs = [
  { href: "/", key: "dashboard", icon: Home },
  { href: "/journal", key: "journal", icon: NotebookPen },
  { href: "/profile", key: "profile", icon: User },
] as const;

export default function BottomNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-md">
        {tabs.map(({ href, key, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${
                active ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
              {t(key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Write `frontend/src/components/top-bar.tsx`**:

```tsx
export default function TopBar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-12 max-w-md items-center px-4">
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Modify `frontend/src/app/[locale]/layout.tsx`** — wrap children with providers + shell. Body content becomes:

```tsx
<body className="min-h-dvh flex flex-col bg-muted/30">
  <NextIntlClientProvider messages={messages}>
    <AuthProvider>
      <ThemeProvider>
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x bg-background shadow-sm">
          <main className="flex flex-1 flex-col">{children}</main>
          <BottomNav />
        </div>
      </ThemeProvider>
    </AuthProvider>
  </NextIntlClientProvider>
</body>
```

Imports: `AuthProvider` from `@/components/auth-provider`, `ThemeProvider` from `@/components/theme-provider`, `BottomNav` from `@/components/bottom-nav`. Keep the FOUC script from Task 11 Step 3. TopBar is rendered per-page (title differs).

- [ ] **Step 4: Verify:** browser — centered phone-width column on desktop, bottom nav with 3 tabs, switching tabs navigates (journal/profile 404 until Tasks 15/16 — expected).

---

## Task 14: Dashboard page

**Files:**
- Create: `frontend/src/components/dua-card.tsx`
- Create: `frontend/src/components/today-todos.tsx`
- Create: `frontend/src/components/quick-add.tsx`
- Rewrite: `frontend/src/app/[locale]/page.tsx`

- [ ] **Step 1: Write `frontend/src/components/dua-card.tsx`** — time category from profile windows + client clock:

```tsx
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
    <Card>
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
```

- [ ] **Step 2: Write `frontend/src/components/today-todos.tsx`** — list + optimistic toggle:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { api, todayStr, todayDow } from "@/lib/api";
import { Link } from "../../i18n/routing";
import { Button } from "@/components/ui/button";

export type TodayTodo = {
  schedule_id: string;
  title: string;
  is_system_title: boolean;
  completed: boolean;
};

export default function TodayTodos({ refreshKey }: { refreshKey: number }) {
  const t = useTranslations("Dashboard");
  const sys = useTranslations();
  const [todos, setTodos] = useState<TodayTodo[] | null>(null);

  const load = useCallback(() => {
    api<TodayTodo[]>(`/todos/today?date=${todayStr()}&dow=${todayDow()}`)
      .then(setTodos)
      .catch(() => setTodos([]));
  }, []);

  useEffect(load, [load, refreshKey]);

  async function toggle(id: string) {
    setTodos((prev) =>
      prev?.map((x) => (x.schedule_id === id ? { ...x, completed: !x.completed } : x)) ?? null,
    );
    try {
      await api(`/todos/${id}/toggle`, {
        method: "POST",
        body: JSON.stringify({ date: todayStr(), dow: todayDow() }),
      });
    } catch {
      load(); // rollback to server truth
    }
  }

  if (todos === null) return <p className="text-sm text-muted-foreground">{sys("Common.loading")}</p>;

  if (todos.length === 0)
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">{t("emptyTodos")}</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/journal">{t("goToJournal")}</Link>
        </Button>
      </div>
    );

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <li key={todo.schedule_id}>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/30">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggle(todo.schedule_id)}
              className="h-5 w-5 accent-[var(--primary)]"
            />
            <span className={todo.completed ? "text-sm line-through text-muted-foreground" : "text-sm"}>
              {todo.is_system_title ? sys(todo.title) : todo.title}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 3: Write `frontend/src/components/quick-add.tsx`** — "+" button + dialog, creates one-time todo:

```tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { api, todayStr } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function QuickAdd({ onAdded }: { onAdded: () => void }) {
  const t = useTranslations("Dashboard");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await api("/todos", {
        method: "POST",
        body: JSON.stringify({
          custom_title: title.trim(),
          recurrence: "once",
          once_date: todayStr(),
          source: "quick_add",
        }),
      });
      setTitle("");
      setOpen(false);
      onAdded();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="rounded-full shadow-md" aria-label={t("quickAddTitle")}>
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("quickAddTitle")}</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={t("quickAddPlaceholder")}
        />
        <p className="text-xs text-muted-foreground">{t("quickAddHint")}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
          <Button onClick={submit} disabled={busy || !title.trim()}>{t("add")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Rewrite `frontend/src/app/[locale]/page.tsx`** — dashboard:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import TopBar from "@/components/top-bar";
import DuaCard from "@/components/dua-card";
import TodayTodos from "@/components/today-todos";
import QuickAdd from "@/components/quick-add";
import { Card, CardContent } from "@/components/ui/card";

type Profile = {
  display_name: string | null;
  prayer_windows: Record<"morning" | "afternoon" | "evening" | "night", [number, number]>;
};

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { session, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!session) return;
    api<Profile>("/profile", {}, 60_000).then(setProfile).catch(() => {});
  }, [session]);

  if (loading) return null;

  const name = profile?.display_name || t("guestName");
  const windows = profile?.prayer_windows ?? {
    morning: [5, 10], afternoon: [10, 15], evening: [15, 18], night: [18, 5],
  };

  return (
    <>
      <TopBar title={t("welcome", { name })} />
      <div className="flex flex-1 flex-col gap-4 p-4 pb-6">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-4 text-center text-sm font-medium">
            {t("prayedToday")}
          </CardContent>
        </Card>

        <DuaCard windows={windows} />

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">{t("todayTodos")}</h2>
          <QuickAdd onAdded={() => setRefreshKey((k) => k + 1)} />
        </div>
        <TodayTodos refreshKey={refreshKey} />
      </div>
    </>
  );
}
```

- [ ] **Step 5: Verify in browser** (`http://localhost:3000/id`, both servers running): greeting shows "Sahabat" (guest), dua card renders Arabic + latin + translation, quick-add creates a todo that appears in list, checkbox toggles and persists across reload, empty state shows before first add.

---

## Task 15: Jurnal page

**Files:**
- Create: `frontend/src/components/recurrence-picker.tsx`
- Create: `frontend/src/app/[locale]/journal/page.tsx`

- [ ] **Step 1: Write `frontend/src/components/recurrence-picker.tsx`** — dialog: tomorrow / daily / weekly-days / specific date:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type Recurrence =
  | { recurrence: "once"; once_date: string }
  | { recurrence: "daily" }
  | { recurrence: "weekly"; weekly_days: number[] };

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function RecurrencePicker({
  open, onClose, onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (r: Recurrence) => void;
}) {
  const t = useTranslations("Journal");
  const [mode, setMode] = useState<"tomorrow" | "daily" | "weekly" | "date">("tomorrow");
  const [days, setDays] = useState<number[]>([]);
  const [date, setDate] = useState(tomorrowStr());

  function confirm() {
    if (mode === "tomorrow") onPick({ recurrence: "once", once_date: tomorrowStr() });
    else if (mode === "daily") onPick({ recurrence: "daily" });
    else if (mode === "weekly" && days.length > 0) onPick({ recurrence: "weekly", weekly_days: days });
    else if (mode === "date") onPick({ recurrence: "once", once_date: date });
    onClose();
  }

  const modes = [
    { id: "tomorrow", label: t("tomorrow") },
    { id: "daily", label: t("daily") },
    { id: "weekly", label: t("weekly") },
    { id: "date", label: t("pickDate") },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("recurrenceTitle")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {modes.map((m) => (
            <Button
              key={m.id}
              variant={mode === m.id ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </Button>
          ))}
        </div>
        {mode === "weekly" && (
          <div className="flex flex-wrap gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days.includes(d) ? "default" : "outline"}
                className="w-11"
                onClick={() =>
                  setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
                }
              >
                {t(`days.${d}`)}
              </Button>
            ))}
          </div>
        )}
        {mode === "date" && (
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        )}
        <DialogFooter>
          <Button onClick={confirm} disabled={mode === "weekly" && days.length === 0}>
            {t("activate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Write `frontend/src/app/[locale]/journal/page.tsx`** — journal card grid (only Todo active) → todo view with system templates, my templates, create-template form:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarPlus, ListTodo, Trash2 } from "lucide-react";
import { api, invalidate } from "@/lib/api";
import TopBar from "@/components/top-bar";
import RecurrencePicker, { type Recurrence } from "@/components/recurrence-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Item = { id: string; title: string; sort_order: number };
type Template = { id: string; kind: "group" | "single"; name: string; is_system: boolean; template_items: Item[] };
type TemplatesResponse = { system: Template[]; mine: Template[] };

export default function JournalPage() {
  const t = useTranslations("Journal");
  const sys = useTranslations();
  const [view, setView] = useState<"cards" | "todo">("cards");
  const [data, setData] = useState<TemplatesResponse | null>(null);
  const [pickerFor, setPickerFor] = useState<Item[] | null>(null);
  const [scheduledIds, setScheduledIds] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState("");
  const [newItems, setNewItems] = useState("");

  const load = useCallback(() => {
    api<TemplatesResponse>("/templates", {}, 30_000).then(setData).catch(() => {});
  }, []);
  useEffect(() => {
    if (view === "todo") load();
  }, [view, load]);

  async function schedule(items: Item[], r: Recurrence) {
    await Promise.all(
      items.map((item) =>
        api("/todos", {
          method: "POST",
          body: JSON.stringify({ template_item_id: item.id, source: "journal", ...r }),
        }),
      ),
    );
    setScheduledIds((prev) => new Set([...prev, ...items.map((i) => i.id)]));
  }

  async function createTemplate() {
    const items = newItems.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!newName.trim() || items.length === 0) return;
    await api("/templates", {
      method: "POST",
      body: JSON.stringify({ name: newName.trim(), kind: items.length > 1 ? "group" : "single", items }),
    });
    setNewName(""); setNewItems("");
    invalidate("GET:/templates"); load();
  }

  async function removeTemplate(id: string) {
    await api(`/templates/${id}`, { method: "DELETE" });
    invalidate("GET:/templates"); load();
  }

  const resolveName = (tpl: Template) => (tpl.is_system ? sys(tpl.name) : tpl.name);
  const resolveTitle = (tpl: Template, item: Item) => (tpl.is_system ? sys(item.title) : item.title);

  if (view === "cards") {
    return (
      <>
        <TopBar title={t("title")} />
        <div className="grid flex-1 grid-cols-1 content-start gap-4 p-4">
          <button
            onClick={() => setView("todo")}
            className="flex items-center gap-4 rounded-xl border bg-card p-5 text-left transition-colors hover:bg-accent/40"
          >
            <ListTodo className="h-8 w-8 text-primary" />
            <span>
              <span className="block font-medium">{t("todoCard")}</span>
              <span className="block text-sm text-muted-foreground">{t("todoCardDesc")}</span>
            </span>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={t("todoCard")} />
      <div className="flex flex-1 flex-col gap-6 p-4 pb-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">{t("systemTemplates")}</h2>
          {(data?.system ?? []).map((tpl) => (
            <Card key={tpl.id}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm">{resolveName(tpl)}</CardTitle>
                <Button
                  size="sm"
                  variant={tpl.template_items.every((i) => scheduledIds.has(i.id)) ? "secondary" : "default"}
                  onClick={() => setPickerFor(tpl.template_items)}
                >
                  <CalendarPlus className="mr-1 h-4 w-4" />
                  {tpl.template_items.every((i) => scheduledIds.has(i.id)) ? t("scheduled") : t("activate")}
                </Button>
              </CardHeader>
              {tpl.kind === "group" && (
                <CardContent className="space-y-1 pb-3 pt-0">
                  {tpl.template_items.map((item) => (
                    <p key={item.id} className="text-sm text-muted-foreground">• {resolveTitle(tpl, item)}</p>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">{t("myTemplates")}</h2>
          {(data?.mine ?? []).map((tpl) => (
            <Card key={tpl.id}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm">{tpl.name}</CardTitle>
                <div className="flex gap-1.5">
                  <Button size="sm" onClick={() => setPickerFor(tpl.template_items)}>
                    <CalendarPlus className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeTemplate(tpl.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              {tpl.kind === "group" && (
                <CardContent className="space-y-1 pb-3 pt-0">
                  {tpl.template_items.map((item) => (
                    <p key={item.id} className="text-sm text-muted-foreground">• {item.title}</p>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">{t("newTemplate")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4 pt-0">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t("templateName")} />
              <Textarea
                value={newItems}
                onChange={(e) => setNewItems(e.target.value)}
                placeholder={t("templateItems")}
                rows={3}
              />
              <Button size="sm" onClick={createTemplate} disabled={!newName.trim() || !newItems.trim()}>
                {t("save")}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      <RecurrencePicker
        open={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onPick={(r) => pickerFor && schedule(pickerFor, r)}
      />
    </>
  );
}
```

- [ ] **Step 3: Verify in browser:** Jurnal tab → Todo card → system templates listed with translated names; "Jadwalkan" on Rutinitas Subuh with "Setiap hari" → 4 todos appear on Dashboard; create personal template (multi-line) → appears under "Template saya"; schedule it for "Besok" → NOT on today's dashboard (correct); delete personal template works; system template has no delete button.

---

## Task 16: Profil page + auth upgrade

**Files:**
- Create: `frontend/src/app/[locale]/profile/page.tsx`

- [ ] **Step 1: Write `frontend/src/app/[locale]/profile/page.tsx`**:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "../../../../i18n/routing";
import { api, invalidate } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useTheme, type Gender, type ThemeMode } from "@/components/theme-provider";
import TopBar from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Profile = {
  display_name: string | null;
  gender: Gender;
  theme_mode: ThemeMode;
  locale: string;
  city: string | null;
};

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const nav = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { isGuest } = useAuth();
  const { gender, mode, setGender, setMode } = useTheme();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");

  useEffect(() => {
    api<Profile>("/profile").then((p) => {
      setProfile(p);
      setName(p.display_name ?? "");
      setCity(p.city ?? "");
    }).catch(() => {});
  }, []);

  async function save(patch: Partial<Profile>) {
    await api("/profile", { method: "PATCH", body: JSON.stringify(patch) });
    invalidate("GET:/profile");
  }

  function pickGender(g: Gender) {
    setGender(g);           // instant theme switch
    save({ gender: g });    // persist
  }

  function pickMode(m: ThemeMode) {
    setMode(m);
    save({ theme_mode: m });
  }

  function pickLocale(l: string) {
    save({ locale: l });
    router.replace(pathname, { locale: l });
  }

  async function linkEmail() {
    setAuthMsg("");
    const { error } = await supabase.auth.updateUser({ email, password });
    setAuthMsg(error ? error.message : t("saved"));
  }

  async function linkGoogle() {
    await supabase.auth.linkIdentity({ provider: "google" });
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.reload(); // AuthProvider re-runs → fresh anonymous session
  }

  if (!profile) return <TopBar title={t("title")} />;

  return (
    <>
      <TopBar title={t("title")} />
      <div className="flex flex-1 flex-col gap-4 p-4 pb-6">
        {isGuest && (
          <Card className="border-accent bg-accent/20">
            <CardContent className="space-y-3 py-4">
              <p className="text-sm">{t("guestBanner")}</p>
              <div className="space-y-2">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("email")} />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("password")} />
                <Button size="sm" onClick={linkEmail} disabled={!email || password.length < 6}>
                  {t("saveAccount")}
                </Button>
                {GOOGLE_ENABLED && (
                  <Button size="sm" variant="outline" onClick={linkGoogle}>{t("continueGoogle")}</Button>
                )}
                {authMsg && <p className="text-xs text-muted-foreground">{authMsg}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm">{t("name")}</CardTitle></CardHeader>
          <CardContent className="flex gap-2 pb-4 pt-0">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button size="sm" onClick={() => save({ display_name: name })}>{t("saved").replace("✓","")||"OK"}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("gender")}</Label>
              <div className="flex gap-2">
                <Button size="sm" variant={gender === "ikhwan" ? "default" : "outline"} onClick={() => pickGender("ikhwan")}>{t("ikhwan")}</Button>
                <Button size="sm" variant={gender === "akhwat" ? "default" : "outline"} onClick={() => pickGender("akhwat")}>{t("akhwat")}</Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{t("darkMode")}</Label>
              <div className="flex gap-2">
                {(["light", "dark", "system"] as const).map((m) => (
                  <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => pickMode(m)}>
                    {t(m)}
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{t("language")}</Label>
              <div className="flex gap-2">
                {(["id", "en", "ms"] as const).map((l) => (
                  <Button key={l} size="sm" variant={locale === l ? "default" : "outline"} onClick={() => pickLocale(l)}>
                    {nav(l)}
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{t("city")}</Label>
              <div className="flex gap-2">
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
                <Button size="sm" onClick={() => save({ city })}>OK</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isGuest && (
          <Button variant="outline" onClick={logout}>{t("logout")}</Button>
        )}
      </div>
    </>
  );
}
```

Note: name-save button label — use a proper key: add `"save": "Simpan"` to `Profile` namespace in all 3 message files and use `t("save")` instead of the `t("saved").replace(...)` hack above. (Do it properly during implementation; the hack line is a known wart in this plan.)

- [ ] **Step 2: Verify in browser:** gender toggle instantly re-tints whole app (emerald ↔ plum) and persists on reload; dark/light/system all work; language buttons switch locale (URL prefix changes); name + city save and survive reload; guest banner shows (anonymous session); linking email converts guest — banner disappears, logout button appears; after logout, fresh guest session with empty data.

---

## Task 17: PWA manifest + icons

**Files:**
- Create: `frontend/src/app/manifest.ts`
- Create: `frontend/public/icon-192.png`, `frontend/public/icon-512.png`
- Create (scratch): icon generation script in scratchpad

- [ ] **Step 1: Check the docs first** (CLAUDE.md rule): read `frontend/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/manifest.md` (or nearest match found via Glob for `**/manifest*.md`). Confirm `MetadataRoute.Manifest` API shape; adjust Step 3 if the docs differ.

- [ ] **Step 2: Generate icons** using sharp (already in `frontend/node_modules` as a Next dependency). Write to scratchpad and run from `frontend/`:

```js
// scratchpad/gen-icons.mjs — run: node <path>/gen-icons.mjs (cwd: frontend/)
import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="#1d5c4f"/>
  <text x="256" y="330" font-size="240" text-anchor="middle">🌙</text>
</svg>`;

for (const size of [192, 512]) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(`public/icon-${size}.png`);
  console.log(`icon-${size}.png done`);
}
```

- [ ] **Step 3: Write `frontend/src/app/manifest.ts`**:

```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Muslim Berislam",
    short_name: "Berislam",
    description: "Temani perjalanan spiritualmu",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d5c4f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
```

No service worker: modern Chrome/Edge install PWAs from manifest alone; offline support is explicitly out of scope (spec). If install prompt doesn't appear during verification, check docs for Next 16 SW guidance and add minimal SW then — not before.

- [ ] **Step 4: Verify:** `curl http://localhost:3000/manifest.webmanifest` returns the JSON (exact route name per docs — may be `/manifest.json`). Chrome DevTools → Application → Manifest shows name + icons, installability check passes.

---

## Task 18: Component docs + CLAUDE.md update

**Files:**
- Create: `frontend/component-docs.md`
- Modify: `E:\Practice\001\CLAUDE.md`

- [ ] **Step 1: Write `frontend/component-docs.md`.** Document EVERY component created in Tasks 10-16 plus preexisting `language-switcher`. For each: purpose, props table (name/type/required/description), i18n namespaces consumed, usage example, gotchas. Sections:
  - `AuthProvider` / `useAuth` (session guarantee, `isGuest`, anonymous flow)
  - `ThemeProvider` / `useTheme` (gender+mode, localStorage keys `mb.gender`/`mb.mode`, FOUC script contract)
  - `BottomNav`, `TopBar`
  - `DuaCard` (+ exported `categoryForHour`)
  - `TodayTodos` (refreshKey contract, optimistic toggle + rollback)
  - `QuickAdd` (onAdded callback, one-time semantics)
  - `RecurrencePicker` (Recurrence union type)
  - `LanguageSwitcher`
  - Also: `lib/api.ts` (api(), invalidate(), cache TTL semantics, todayStr/todayDow) and `lib/supabase.ts`
  Write real content from the implemented code — not from this plan (code may have drifted during implementation).

- [ ] **Step 2: Update root `CLAUDE.md`:** server section — replace "all placeholder handlers" description with real route list (`/api/duas/current`, `/api/profile`, `/api/templates`, `/api/todos/*`), note `@supabase/server/core` middleware (`requireUser` → `req.supabase`/`req.supabaseAdmin`/`req.userId`), in-process TTL cache (`src/lib/cache.js`, duas+system-templates 1h), `.env` now exists (gitignored), DB schema in `server/db/*.sql` run manually in Supabase SQL editor. Frontend section — add: guest-mode anonymous auth pattern, theme system (`data-gender` + `.dark`, 4 palettes in globals.css), client cache in `lib/api.ts`, dashboard/journal/profile pages, `component-docs.md` pointer.

- [ ] **Step 3: Final full verification pass** (both servers running):
  1. Fresh incognito → `/id` → auto guest session, empty state, dua card correct for current time
  2. Quick add → appears, toggles; reload → persists
  3. Journal: schedule Rutinitas Subuh daily → 4 items on dashboard; personal template for Friday only (`weekly_days:[5]`) → absent today unless Friday
  4. Profile: gender/dark/language/name/city all work + persist
  5. Link email → guest converts, data retained (todos still there)
  6. Logout → new guest, clean slate
  7. All 3 locales: no missing-message errors in console
  8. PWA: manifest OK, installable
  9. `npm run lint` in `frontend/` → no new errors
  10. Server cache: two `curl /api/duas/current` calls → single DB hit (temporary log check)

---

## Self-review results (done at planning time)

- **Spec coverage:** all spec sections map to tasks: schema+RLS+trigger (T2), seed (T3), Express+core middleware (T4), caching server (T4-T6) + client (T10) — user's added requirement, routes (T5-T8), guest anonymous auth (T10), 4-palette theming (T11), i18n ×3 (T12), shell/bottom-nav (T13), Dashboard incl. quick-add + empty state + dua windows (T14), Jurnal incl. system/personal templates + recurrence (T15), Profil incl. account linking + logout (T16), PWA (T17), component-docs + CLAUDE.md (T18). Deferred items match spec's out-of-scope list.
- **Known wart:** Task 16 name-save button label hack — fix instruction included inline.
- **Known risk:** `@supabase/server/core` exact signatures unverified until install (Task 1 Step 4 + Task 8 Step 4 auth smoke test gate this).
- **Type consistency:** `TodayTodo`, `Recurrence`, `Template`/`Item`, `Profile` shapes match the API responses defined in Tasks 5-7.
