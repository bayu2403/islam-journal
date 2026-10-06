-- Migration 002 — Revision 1 (akhirat/dunia, hadith content, times, notes).
-- Run AFTER schema.sql + seed.sql, in Supabase SQL editor. Idempotent-ish:
-- ALTERs use IF NOT EXISTS where possible; inserts use ON CONFLICT.

-- ── ALTER: categories, content, times ─────────────────────
alter table public.templates      add column if not exists category text not null default 'dunia' check (category in ('akhirat','dunia'));
alter table public.templates      add column if not exists summary text;
alter table public.templates      add column if not exists dalil text;
alter table public.template_items add column if not exists summary text;
alter table public.template_items add column if not exists dalil text;
alter table public.template_items add column if not exists default_time time;
alter table public.template_items add column if not exists prayer_key text check (prayer_key in ('fajr','dhuhr','asr','maghrib','isha'));
alter table public.todo_schedules add column if not exists category text not null default 'dunia' check (category in ('akhirat','dunia'));
alter table public.todo_schedules add column if not exists scheduled_time time;
alter table public.todo_completions add column if not exists status text not null default 'done' check (status in ('done','skipped'));
alter table public.profiles       add column if not exists country text not null default 'Indonesia';

-- ── daily_notes (Cerita hari ini) ──────────────────────────
create table if not exists public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  on_date date not null,
  body text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, on_date)
);
alter table public.daily_notes enable row level security;
drop policy if exists "notes all own" on public.daily_notes;
create policy "notes all own" on public.daily_notes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── Existing system templates → akhirat + content ─────────
update public.templates set category = 'akhirat' where owner_id is null;

update public.templates set
  summary = 'Satu huruf Al-Quran = sepuluh kebaikan. (HR. Tirmidzi no. 2910)',
  dalil   = '"Barangsiapa membaca satu huruf dari Kitabullah, maka baginya satu kebaikan, dan satu kebaikan dilipatgandakan menjadi sepuluh kebaikan. Aku tidak mengatakan alif-lam-mim itu satu huruf, tetapi alif satu huruf, lam satu huruf, dan mim satu huruf." (HR. Tirmidzi no. 2910, shahih)'
where id = '00000000-0000-0000-0000-000000000012';

update public.templates set
  summary = 'Sedekah tidak mengurangi harta. (HR. Muslim no. 2588)',
  dalil   = '"Sedekah tidaklah mengurangi harta. Tidaklah Allah menambah bagi seorang hamba yang pemaaf kecuali kemuliaan, dan tidaklah seseorang merendahkan diri karena Allah kecuali Allah angkat derajatnya." (HR. Muslim no. 2588)'
where id = '00000000-0000-0000-0000-000000000014';

update public.templates set
  summary = 'Shalat paling utama setelah shalat wajib. (HR. Muslim no. 1163)',
  dalil   = '"Shalat yang paling utama setelah shalat wajib adalah shalat malam." (HR. Muslim no. 1163). Pada sepertiga malam terakhir, Allah turun ke langit dunia dan berfirman: "Siapa yang berdoa kepada-Ku pasti Aku kabulkan, siapa yang meminta kepada-Ku pasti Aku beri, siapa yang memohon ampun kepada-Ku pasti Aku ampuni." (HR. Bukhari no. 1145, Muslim no. 758)'
where id = '00000000-0000-0000-0000-000000000013';

update public.templates set
  summary = 'Menunaikan sedekah seluruh persendian tubuh. (HR. Muslim no. 720)',
  dalil   = '"Setiap pagi, setiap ruas sendi kalian wajib bersedekah; setiap tasbih adalah sedekah, setiap tahmid adalah sedekah, setiap tahlil adalah sedekah, setiap takbir adalah sedekah, amar makruf sedekah, nahi mungkar sedekah — dan semua itu tercukupi dengan dua rakaat yang dikerjakan di waktu Dhuha." (HR. Muslim no. 720)'
where id = '00000000-0000-0000-0000-000000000011';

update public.template_items set default_time = '03:30' where id = '00000000-0000-0000-0001-000000000013'; -- tahajud single item
update public.template_items set default_time = '08:00' where id = '00000000-0000-0000-0001-000000000011'; -- dhuha single item

-- ── NEW: Solat Fardhu 5 Waktu (group, prayer-linked items) ─
insert into public.templates (id, owner_id, kind, name, category, summary, dalil) values
('00000000-0000-0000-0000-000000000003', null, 'group', 'SystemTemplates.solatFardhu', 'akhirat',
 'Amalan pertama yang dihisab pada hari kiamat. (HR. Tirmidzi no. 413)',
 '"Sesungguhnya amal yang pertama kali dihisab dari seorang hamba pada hari kiamat adalah shalatnya. Jika shalatnya baik, sungguh ia beruntung dan selamat; jika rusak, sungguh ia rugi." (HR. Tirmidzi no. 413, shahih). "Islam dibangun di atas lima perkara: syahadat, mendirikan shalat, menunaikan zakat, haji, dan puasa Ramadhan." (HR. Bukhari no. 8, Muslim no. 16)')
on conflict (id) do nothing;

insert into public.template_items (id, template_id, title, sort_order, prayer_key, default_time, summary, dalil) values
('00000000-0000-0000-0001-000000000021', '00000000-0000-0000-0000-000000000003', 'SystemTemplates.subuh',   0, 'fajr',    '04:30',
 'Berada dalam jaminan Allah sepanjang hari. (HR. Muslim no. 657)',
 '"Barangsiapa yang shalat Subuh maka dia berada dalam jaminan Allah." (HR. Muslim no. 657). "Barangsiapa shalat Subuh berjamaah, maka seakan-akan ia shalat semalam penuh." (HR. Muslim no. 656)'),
('00000000-0000-0000-0001-000000000022', '00000000-0000-0000-0000-000000000003', 'SystemTemplates.dzuhur',  1, 'dhuhr',   '12:00',
 'Penghapus dosa di antara waktu shalat. (HR. Muslim no. 233)',
 '"Shalat lima waktu, Jumat ke Jumat, dan Ramadhan ke Ramadhan adalah penghapus dosa di antara keduanya selama dosa-dosa besar dijauhi." (HR. Muslim no. 233)'),
('00000000-0000-0000-0001-000000000023', '00000000-0000-0000-0000-000000000003', 'SystemTemplates.ashar',   2, 'asr',     '15:15',
 'Jangan terlewat — penjagaan amal. (HR. Bukhari no. 553)',
 '"Barangsiapa meninggalkan shalat Ashar, maka terhapuslah amalnya." (HR. Bukhari no. 553). Para malaikat malam dan siang berkumpul pada shalat Subuh dan Ashar. (HR. Bukhari no. 555, Muslim no. 632)'),
('00000000-0000-0000-0001-000000000024', '00000000-0000-0000-0000-000000000003', 'SystemTemplates.maghrib', 3, 'maghrib', '18:00',
 'Amal yang paling dicintai Allah: shalat pada waktunya. (HR. Bukhari no. 527)',
 'Nabi ﷺ ditanya: "Amal apakah yang paling dicintai Allah?" Beliau menjawab: "Shalat pada waktunya." (HR. Bukhari no. 527, Muslim no. 85)'),
('00000000-0000-0000-0001-000000000025', '00000000-0000-0000-0000-000000000003', 'SystemTemplates.isya',    4, 'isha',    '19:15',
 'Berjamaah Isya = shalat separuh malam. (HR. Muslim no. 656)',
 '"Barangsiapa shalat Isya berjamaah, maka seakan-akan ia shalat separuh malam; dan barangsiapa shalat Subuh berjamaah, maka seakan-akan ia shalat semalam penuh." (HR. Muslim no. 656)')
on conflict (id) do nothing;

-- ── NEW: sunnah singles ────────────────────────────────────
insert into public.templates (id, owner_id, kind, name, category, summary, dalil) values
('00000000-0000-0000-0000-000000000015', null, 'single', 'SystemTemplates.rawatib', 'akhirat',
 'Dibangunkan rumah di surga. (HR. Muslim no. 728)',
 '"Barangsiapa mengerjakan 12 rakaat (sunnah rawatib) dalam sehari semalam, dibangunkan baginya rumah di surga." (HR. Muslim no. 728). Rinciannya: 4 rakaat sebelum Dzuhur, 2 sesudahnya, 2 sesudah Maghrib, 2 sesudah Isya, dan 2 sebelum Subuh. (HR. Tirmidzi no. 414)'),
('00000000-0000-0000-0000-000000000016', null, 'single', 'SystemTemplates.qabliyahSubuh', 'akhirat',
 'Lebih baik daripada dunia dan seisinya. (HR. Muslim no. 725)',
 '"Dua rakaat (sebelum) fajar lebih baik daripada dunia dan seisinya." (HR. Muslim no. 725)'),
('00000000-0000-0000-0000-000000000017', null, 'single', 'SystemTemplates.shalatWitir', 'akhirat',
 'Penutup shalat malam. (HR. Bukhari no. 998)',
 '"Jadikanlah witir sebagai akhir shalat malam kalian." (HR. Bukhari no. 998, Muslim no. 751)'),
('00000000-0000-0000-0000-000000000018', null, 'single', 'SystemTemplates.tahiyatulMasjid', 'akhirat',
 'Hak masjid sebelum duduk. (HR. Bukhari no. 444)',
 '"Jika salah seorang dari kalian masuk masjid, janganlah ia duduk hingga shalat dua rakaat." (HR. Bukhari no. 444, Muslim no. 714)'),
('00000000-0000-0000-0000-000000000019', null, 'single', 'SystemTemplates.jamaah40Hari', 'akhirat',
 'Dicatat 2 pembebasan: dari neraka & dari kemunafikan. (HR. Tirmidzi no. 241)',
 '"Barangsiapa shalat berjamaah karena Allah selama 40 hari dengan mendapati takbir pertama, dicatat baginya dua kebebasan: kebebasan dari neraka dan kebebasan dari kemunafikan." (HR. Tirmidzi no. 241, dinilai hasan)')
on conflict (id) do nothing;

insert into public.template_items (id, template_id, title, sort_order, default_time, summary, dalil) values
('00000000-0000-0000-0001-000000000015', '00000000-0000-0000-0000-000000000015', 'SystemTemplates.rawatib',         0, null,    'Dibangunkan rumah di surga. (HR. Muslim no. 728)', '"Barangsiapa mengerjakan 12 rakaat (sunnah rawatib) dalam sehari semalam, dibangunkan baginya rumah di surga." (HR. Muslim no. 728)'),
('00000000-0000-0000-0001-000000000016', '00000000-0000-0000-0000-000000000016', 'SystemTemplates.qabliyahSubuh',   0, '04:15', 'Lebih baik daripada dunia dan seisinya. (HR. Muslim no. 725)', '"Dua rakaat (sebelum) fajar lebih baik daripada dunia dan seisinya." (HR. Muslim no. 725)'),
('00000000-0000-0000-0001-000000000017', '00000000-0000-0000-0000-000000000017', 'SystemTemplates.shalatWitir',     0, '20:30', 'Penutup shalat malam. (HR. Bukhari no. 998)', '"Jadikanlah witir sebagai akhir shalat malam kalian." (HR. Bukhari no. 998, Muslim no. 751)'),
('00000000-0000-0000-0001-000000000018', '00000000-0000-0000-0000-000000000018', 'SystemTemplates.tahiyatulMasjid', 0, null,    'Hak masjid sebelum duduk. (HR. Bukhari no. 444)', '"Jika salah seorang dari kalian masuk masjid, janganlah ia duduk hingga shalat dua rakaat." (HR. Bukhari no. 444, Muslim no. 714)'),
('00000000-0000-0000-0001-000000000019', '00000000-0000-0000-0000-000000000019', 'SystemTemplates.jamaah40Hari',    0, null,    'Dicatat 2 pembebasan. (HR. Tirmidzi no. 241)', '"Barangsiapa shalat berjamaah karena Allah selama 40 hari dengan mendapati takbir pertama, dicatat baginya dua kebebasan: kebebasan dari neraka dan kebebasan dari kemunafikan." (HR. Tirmidzi no. 241, dinilai hasan)')
on conflict (id) do nothing;

-- Copy hadith content onto the pre-existing single-template items (dhuha/tahajud)
update public.template_items set
  summary = 'Menunaikan sedekah seluruh persendian tubuh. (HR. Muslim no. 720)',
  dalil   = '"Setiap pagi, setiap ruas sendi kalian wajib bersedekah... dan semua itu tercukupi dengan dua rakaat yang dikerjakan di waktu Dhuha." (HR. Muslim no. 720)'
where id = '00000000-0000-0000-0001-000000000011';

update public.template_items set
  summary = 'Shalat paling utama setelah shalat wajib. (HR. Muslim no. 1163)',
  dalil   = '"Shalat yang paling utama setelah shalat wajib adalah shalat malam." (HR. Muslim no. 1163)'
where id = '00000000-0000-0000-0001-000000000013';
