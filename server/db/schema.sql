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
