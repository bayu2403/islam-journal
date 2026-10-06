# Prompt Project — Muslim Berislam

> Prompt untuk dikirim ke Claude (Artifact) agar bisa generate kode UI sesuai spesifikasi di bawah.

---

## Project Overview

**Nama:** Muslim Berislam
**Tipe:** Progressive Web App (PWA) — Islamic spiritual & productivity app
**Target Platform:** Mobile-first. Saat dibuka di PC/laptop, UI tetap tampil seperti mobile (max-width container ~480px, centered).
**Audience:** Ikhwan (pria) & Akhwat (wanita) — tampilan dan skema warna berbeda per gender.

---

## Tech Stack

- **Frontend:** Next.js 16 + shadcn/ui + Tailwind CSS v4 + Lucide Icons
- **i18n:** next-intl (default: 🇮🇩 Indonesian, supported: 🇬🇧 English, 🇲🇾 Malay)
- **Backend:** Node.js + Express 5 (nanti migrasi ke Go + Gin)
- **Database:** Supabase / PostgreSQL
- **Component Library:** shadcn/ui (button, card, input, dialog, dropdown-menu, tabs, separator, badge, dll)

---

## UI/UX Rules (Hard Requirements)

1. **Mobile-first** — Semua halaman menggunakan max-width container (~480px), centered di layar besar.
2. **Bottom Navigation (Sticky)** — 3 menu di bawah: **Dashboard** | **Jurnal** | **Profil**. Sticky, selalu terlihat.
3. **Navbar Atas** — Top bar tipis untuk judul halaman.
4. **Desain tenang, minimal, spiritual** — Banyak negative space, font bersih, transisi halus.

---

## 🎨 THEME SYSTEM: Ikhwan & Akhwat

> Setiap user memilih **gender** saat registrasi. Ini menentukan tema visual yang digunakan.
> Masing-masing mode memiliki **Light mode** dan **Dark mode** sendiri.

### Warna Ikhwan (Maskulin — Earthy/Blue)

| Mode | Primary | Background | Card | Accent | Text |
|------|---------|------------|------|--------|------|
| **Light** | Biru navy (#1B3A5C) | Krem muda (#F8F6F2) | Putih (#FFFFFF) | Emas (#C9A96E) | #1A1A2E |
| **Dark** | Biru dongker (#0D1B2A) | Slate gelap (#1B2838) | #243447 | Emas muted (#A88C4A) | #E8E0D8 |

**Deskripsi:** Kesan tenang, maskulin, kokoh, seperti langit malam & bumi.

### Warna Akhwat (Feminin — Rose/Soft)

| Mode | Primary | Background | Card | Accent | Text |
|------|---------|------------|------|--------|------|
| **Light** | Rose dusty (#B5828C) | Pink soft (#FDF2F4) | Putih (#FFFFFF) | Gold rose (#D4A5A5) | #2D1B1E |
| **Dark** | Mauve gelap (#6B4F5A) | Deep rose (#2A1C20) | #3D2A30 | Rose gold (#C98A8A) | #F0E4E6 |

**Deskripsi:** Kesan lembut, hangat, elegan, seperti bunga mawar & senja.

### Aturan Implementasi Tema

- Tema disimpan di **CSS variables** yang di-switch berdasarkan gender user + preferensi dark/light.
- Variable naming: `--theme-primary`, `--theme-bg`, `--theme-card`, `--theme-accent`, `--theme-text`.
- `body` atau root container mendapat class: `.theme-ikhwan-light`, `.theme-ikhwan-dark`, `.theme-akhwat-light`, `.theme-akhwat-dark`.
- Transisi halus (0.3s ease) saat bertukar mode.
- Toggle dark mode ada di halaman Profil (atau via ikon di top bar).

---

## Halaman 1: Dashboard (Halaman Awal — Setelah Login)

**Header:**
- "Selamat datang, [Nama User]" — dengan sapaan gender-appropriate
- Subtitle: "Sudahkah berdoa hari ini? 🤲"
- **Tombol "+" kecil** di pojok kanan untuk **Quick Add Todo** (modal sederhana: input judul, submit → langsung masuk todo hari ini)

**Konten Utama — Doa Harian (Random Terjadwal):**
- Menampilkan **1 doa** secara random berdasarkan waktu saat ini.
- Doa diambil dari database, dikelompokkan berdasarkan waktu:
  - **Pagi (05:00–10:00):** Doa bangun tidur, doa masuk kamar mandi, doa berpakaian, dll.
  - **Siang (10:00–15:00):** Doa sebelum makan, doa sebelum belajar, dzikir umum.
  - **Sore (15:00–18:00):** Doa sore, dzikir petang.
  - **Malam (18:00–05:00):** Doa sebelum tidur, doa keluarga, dll.
- **Concern Regional:** Waktu doa bisa berbeda antar kota meskipun zona waktu sama (misal Kota A dzikir pagi 5–7, Kota B 6–8). Perlu penyesuaian jadwal per user/lokasi.
- Tampilkan: teks doa (Arab + latin), terjemahan (sesuai locale user), dan sumber waktu kapan doa ini muncul.
- **Animasi:** Kartu doa muncul dengan fade-in saat berganti waktu.

**Konten Kedua — Todo List (Hari Ini):**
- Menampilkan todo untuk **hari ini**.
- Setiap todo item: checkbox ✅ (centang = selesai), judul, icon kategori (kalau dari template).
- Todo yang selesai: strikethrough + faded.
- Kalau belum ada todo, tampilkan empty state:
  - "Belum ada rencana hari ini ✨"
  - Tombol: "Atur Todo dari Jurnal" → navigasi ke halaman Jurnal
  - Tombol: "Buat Todo Baru" → modal quick add (sama seperti tombol "+")
- **Quick Add dari Dashboard:** Todo yang dibuat dari Dashboard bersifat **one-time**, tidak tersimpan sebagai template pribadi.

---

## Halaman 2: Jurnal

> Jurnal adalah pusat perencanaan todo. Di sini user bisa:
> a) Memilih dari **System Templates** (pre-created)
> b) Membuat **Custom Todo** yang otomatis tersimpan sebagai **Personalized Template** (bisa dipakai terus)

### Bagian A: System Templates

- Daftar template bawaan sistem, dikelompokkan per kategori:
  - **🌅 Pagi:** Shalat Tahajud, Dzikir Subuh, Shalat Subuh, Doa Pagi
  - **🌤 Siang:** Shalat Dzuhur, Dzikir Siang, Tilawah Quran
  - **🌇 Sore:** Shalat Ashar, Dzikir Petang
  - **🌙 Malam:** Shalat Maghrib, Shalat Isya, Dzikir Malam, Doa Sebelum Tidur
- Setiap template menampilkan: icon, judul, jumlah item, badge kategori
- Bisa klik **seluruh template** (semua item masuk todo besok) atau **item individual**

### Bagian B: Personalized Templates

- Section terpisah: **"Template Pribadiku"**
- Menampilkan template yang pernah user buat sendiri (dari custom todo sebelumnya)
- Setiap personal template: icon + judul + jumlah item + tombol "Gunakan" + tombol "Hapus"
- Kalau belum ada: "Belum ada template pribadi. Buat todo custom di bawah! 👇"

### Bagian C: Create Custom Todo

- Form sederhana:
  - Input: judul todo (wajib)
  - Input: icon (pilih dari daftar Lucide icons populer — hati, bintang, book, moon, sun, dll)
  - Tombol: "Simpan & Jadwalkan untuk Besok"
- **Alur:** Todo ini akan:
  1. Masuk ke `user_todos` dengan `planned_date = tomorrow`
  2. Tersimpan juga ke `personalized_templates` (bisa dipakai lagi nanti)

### Alur Lengkap Todo:

```
┌─ DI JURNAL ─────────────────────────────────────┐
│                                                   │
│  [System Templates]     [Template Pribadi]        │
│  ┌─────────────────┐    ┌─────────────────┐      │
│  │ Rutinitas Subuh │    │ Rutinitasku #1  │      │
│  │ ☐ Tahajud       │    │ ☐ Baca 1 juz   │      │
│  │ ☐ Subuh         │    │ ☐ Olahraga     │      │
│  │ ☐ Doa Pagi     │    └─────────────────┘      │
│  └─────────────────┘                              │
│                                                   │
│  [Buat Custom Todo]                               │
│  ┌─────────────────────────────────┐              │
│  │ Nama todo: [______________]     │              │
│  │ Icon: [pilih]  [Simpan & Jadwal]│              │
│  └─────────────────────────────────┘              │
└───────────────────────────────────────────────────┘
        ↕ (planned_date = tomorrow)
┌─ DI DASHBOARD (besok) ───────────────────────────┐
│   ☐ Tahajud     ☐ Subuh     ☐ Baca 1 juz       │
└───────────────────────────────────────────────────┘
```

---

## Halaman 3: Profil

- Foto profile & nama user
- **Pengaturan Gender:** Ikhwan / Akhwat (mengubah tema)
- **Toggle Dark Mode:** On/Off
- **Pilihan Bahasa:** Indonesia / English / Melayu
- **Pengaturan Lokasi:** Kota / Zona waktu (untuk penyesuaian jadwal doa)
- **Statistik / Streak Ibadah** (opsional untuk MVP — bisa placeholder)
- Tombol **Logout**

---

## 🗄 DATABASE SCHEMA (Lengkap)

### Table: `users`

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  gender        VARCHAR(10) NOT NULL CHECK (gender IN ('ikhwan', 'akhwat')),
  locale        VARCHAR(5) DEFAULT 'id',
  city          VARCHAR(100),
  timezone      VARCHAR(50) DEFAULT 'Asia/Jakarta',
  dark_mode     BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `prayers` (Doa Harian)

```sql
CREATE TABLE prayers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id        VARCHAR(255) NOT NULL,
  title_en        VARCHAR(255) NOT NULL,
  title_ms        VARCHAR(255) NOT NULL,
  arabic_text     TEXT NOT NULL,
  latin_text      TEXT NOT NULL,
  translation_id  TEXT NOT NULL,
  translation_en  TEXT NOT NULL,
  translation_ms  TEXT NOT NULL,
  waktu           VARCHAR(20) NOT NULL CHECK (waktu IN ('pagi', 'siang', 'sore', 'malam')),
  start_hour      INTEGER NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
  end_hour        INTEGER NOT NULL CHECK (end_hour BETWEEN 0 AND 23),
  CONSTRAINT waktu_check CHECK (
    (waktu = 'pagi'   AND start_hour BETWEEN 5 AND 7)   OR
    (waktu = 'siang'  AND start_hour BETWEEN 8 AND 14)  OR
    (waktu = 'sore'   AND start_hour BETWEEN 15 AND 17) OR
    (waktu = 'malam'  AND (start_hour >= 18 OR start_hour < 5))
  ),
  source          VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `todo_system_templates` (Template Bawaan)

```sql
CREATE TABLE todo_system_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_id     VARCHAR(255) NOT NULL,
  name_en     VARCHAR(255) NOT NULL,
  name_ms     VARCHAR(255) NOT NULL,
  category    VARCHAR(50) NOT NULL,  -- 'pagi', 'siang', 'sore', 'malam', 'universal'
  icon        VARCHAR(50) DEFAULT 'check-square',
  is_package  BOOLEAN DEFAULT FALSE, -- TRUE = paket, FALSE = item individual
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE todo_system_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID REFERENCES todo_system_templates(id) ON DELETE CASCADE,
  title_id      VARCHAR(255) NOT NULL,
  title_en      VARCHAR(255) NOT NULL,
  title_ms      VARCHAR(255) NOT NULL,
  icon          VARCHAR(50) DEFAULT 'circle',
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `personalized_templates` (Template Buatan User)

```sql
CREATE TABLE personalized_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  icon        VARCHAR(50) DEFAULT 'heart',
  category    VARCHAR(50) DEFAULT 'custom',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE personalized_template_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID REFERENCES personalized_templates(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  icon          VARCHAR(50) DEFAULT 'circle',
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `user_todos`

```sql
CREATE TABLE user_todos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(id) ON DELETE CASCADE,
  source_type           VARCHAR(20) NOT NULL CHECK (source_type IN ('system', 'personalized', 'quick')),
  source_template_id    UUID,                      -- nullable, refer ke system/personalized template (FK di-handle app layer — karena bisa ke 2 tabel berbeda)
  title                 VARCHAR(255) NOT NULL,
  icon                  VARCHAR(50) DEFAULT 'circle',
  planned_date          DATE NOT NULL,
  is_completed          BOOLEAN DEFAULT FALSE,
  completed_at          TIMESTAMPTZ,
  sort_order            INTEGER DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);
```

> **Penjelasan source_type:**
> - `system` = dari system template
> - `personalized` = dari template pribadi
> - `quick` = quick add dari Dashboard (one-time, tidak tersimpan sebagai template)

---

## 🌱 SEED DATA

### Doa Harian (Sample — 8 doa)

```sql
INSERT INTO prayers (title_id, title_en, title_ms, arabic_text, latin_text, translation_id, translation_en, translation_ms, waktu, start_hour, end_hour, source) VALUES
-- PAGI
(
  'Doa Bangun Tidur', 'Prayer Upon Waking', 'Doa Bangun Tidur',
  'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
  'Alhamdulillahilladzi ahyana ba''da ma amatana wa ilaihin nusyur',
  'Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya lah kami kembali.',
  'All praise is to Allah who gave us life after He caused us to die, and to Him is the resurrection.',
  'Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya lah kami kembali.',
  'pagi', 5, 7, 'HR. Bukhari no. 6312'
),
(
  'Doa Sebelum Makan', 'Prayer Before Eating', 'Doa Sebelum Makan',
  'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
  'Allahumma barik lana fi ma razaqtana wa qina adzaban nar',
  'Ya Allah, berkahilah kami dalam rezeki yang Engkau berikan dan lindungilah kami dari siksa neraka.',
  'O Allah, bless us in what You have provided us and protect us from the punishment of the Fire.',
  'Ya Allah, berkahilah kami dalam rezeki yang Engkau berikan dan lindungilah kami dari siksa neraka.',
  'siang', 10, 14, 'HR. Ibnu Sunni no. 465'
),
(
  'Doa Sebelum Belajar', 'Prayer Before Studying', 'Doa Sebelum Belajar',
  'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا',
  'Rabbi zidni ''ilman warzuqni fahma',
  'Ya Tuhanku, tambahkanlah ilmu kepadaku dan berilah aku pemahaman.',
  'O my Lord, increase me in knowledge and grant me understanding.',
  'Ya Tuhanku, tambahkanlah ilmu kepadaku dan berilah aku pemahaman.',
  'siang', 10, 15, 'QS. Thaha: 114'
),
(
  'Dzikir Petang', 'Evening Remembrance', 'Dzikir Petang',
  'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
  'Amsaina wa amsal mulku lillahi walhamdulillah',
  'Kami telah memasuki waktu petang dan kerajaan hanya milik Allah, segala puji bagi Allah.',
  'We have entered the evening and the dominion belongs to Allah, and all praise is to Allah.',
  'Kami telah memasuki waktu petang dan kerajaan hanya milik Allah, segala puji bagi Allah.',
  'sore', 15, 17, 'HR. Muslim no. 2723'
),
(
  'Doa Menjelang Maghrib', 'Prayer at Sunset', 'Doa Menjelang Maghrib',
  'اللَّهُمَّ بِأَمْسِكَ نَمْسِي وَبِأَصْبَحِكَ نُصْبِحُ',
  'Allahumma bi amsika namsi wa bi asbahika nusbih',
  'Ya Allah, dengan kekuasaan-Mu kami memasuki petang dan dengan kekuasaan-Mu kami memasuki pagi.',
  'O Allah, by Your power we enter the evening and by Your power we enter the morning.',
  'Ya Allah, dengan kekuasaan-Mu kami memasuki petang dan dengan kekuasaan-Mu kami memasuki pagi.',
  'sore', 15, 18, 'HR. Abu Dawud no. 5068'
),
(
  'Doa Sebelum Tidur', 'Prayer Before Sleeping', 'Doa Sebelum Tidur',
  'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
  'Bismikallahumma amutu wa ahya',
  'Dengan nama-Mu ya Allah aku mati dan aku hidup.',
  'In Your name, O Allah, I die and I live.',
  'Dengan nama-Mu ya Allah aku mati dan aku hidup.',
  'malam', 19, 22, 'HR. Bukhari no. 6312'
),
(
  'Doa untuk Kedua Orang Tua', 'Prayer for Parents', 'Doa untuk Kedua Orang Tua',
  'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
  'Rabbighfir li wa liwalidayya warhamhuma kama rabbayani shaghira',
  'Ya Tuhanku, ampunilah aku dan kedua orang tuaku, dan sayangilah mereka sebagaimana mereka menyayangiku di waktu kecil.',
  'My Lord, forgive me and my parents, and have mercy on them as they raised me when I was small.',
  'Ya Tuhanku, ampunilah aku dan kedua orang tuaku, dan sayangilah mereka sebagaimana mereka menyayangiku di waktu kecil.',
  'malam', 19, 23, 'QS. Al-Isra: 24'
),
(
  'Doa Masuk Masjid', 'Prayer Entering Mosque', 'Doa Masuk Masjid',
  'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
  'Allahummaftah li abwaba rahmatik',
  'Ya Allah, bukalah pintu-pintu rahmat-Mu untukku.',
  'O Allah, open for me the doors of Your mercy.',
  'Ya Allah, bukalah pintu-pintu rahmat-Mu untukku.',
  'siang', 8, 17, 'HR. Muslim no. 713'
);
```

### System Templates (Sample)

```sql
-- Template: Rutinitas Subuh
INSERT INTO todo_system_templates (name_id, name_en, name_ms, category, icon, is_package) VALUES
('Rutinitas Subuh', 'Morning Routine', 'Rutin Subuh', 'pagi', 'sunrise', TRUE);

INSERT INTO todo_system_items (template_id, title_id, title_en, title_ms, icon, sort_order)
SELECT t.id, 'Shalat Tahajud', 'Tahajjud Prayer', 'Shalat Tahajud', 'moon', 1
FROM todo_system_templates t WHERE t.name_id = 'Rutinitas Subuh'
UNION ALL
SELECT t.id, 'Shalat Subuh', 'Fajr Prayer', 'Shalat Subuh', 'sun', 2
FROM todo_system_templates t WHERE t.name_id = 'Rutinitas Subuh'
UNION ALL
SELECT t.id, 'Dzikir Pagi', 'Morning Dhikr', 'Dzikir Pagi', 'book-open', 3
FROM todo_system_templates t WHERE t.name_id = 'Rutinitas Subuh'
UNION ALL
SELECT t.id, 'Baca Quran', 'Read Quran', 'Baca Quran', 'book', 4
FROM todo_system_templates t WHERE t.name_id = 'Rutinitas Subuh';

-- Template: Rutinitas Malam
INSERT INTO todo_system_templates (name_id, name_en, name_ms, category, icon, is_package) VALUES
('Rutinitas Malam', 'Evening Routine', 'Rutin Malam', 'malam', 'moon', TRUE);

INSERT INTO todo_system_items (template_id, title_id, title_en, title_ms, icon, sort_order)
SELECT t.id, 'Shalat Maghrib', 'Maghrib Prayer', 'Shalat Maghrib', 'sunset', 1
FROM todo_system_templates t WHERE t.name_id = 'Rutinitas Malam'
UNION ALL
SELECT t.id, 'Dzikir Petang', 'Evening Dhikr', 'Dzikir Petang', 'book-open', 2
FROM todo_system_templates t WHERE t.name_id = 'Rutinitas Malam'
UNION ALL
SELECT t.id, 'Shalat Isya', 'Isha Prayer', 'Shalat Isya', 'moon', 3
FROM todo_system_templates t WHERE t.name_id = 'Rutinitas Malam'
UNION ALL
SELECT t.id, 'Doa Sebelum Tidur', 'Prayer Before Sleep', 'Doa Sebelum Tidur', 'bed', 4
FROM todo_system_templates t WHERE t.name_id = 'Rutinitas Malam';

-- Individual items (bukan paket)
INSERT INTO todo_system_templates (name_id, name_en, name_ms, category, icon, is_package) VALUES
('Shalat Dhuha', 'Dhuha Prayer', 'Shalat Dhuha', 'pagi', 'sun', FALSE),
('Tilawah Quran', 'Quran Recitation', 'Tilawah Quran', 'siang', 'book', FALSE),
('Shalat Tahajud', 'Tahajjud Prayer', 'Shalat Tahajud', 'malam', 'moon', FALSE),
('Bersedekah', 'Charity', 'Bersedekah', 'siang', 'hand-heart', FALSE);
```

---

## 📁 COMPONENT DOCUMENTATION

> Dokumentasi ini untuk future AI developers yang akan mengembangkan app. Setiap komponen yang dibuat harus memiliki dokumentasi seperti di bawah.

---

### Component: `PrayerCard`
**Path:** `src/components/prayer-card.tsx`
**Deskripsi:** Kartu untuk menampilkan doa harian di Dashboard.

```tsx
interface PrayerCardProps {
  arabicText: string;
  latinText: string;
  translation: string;
  source: string;
  waktuLabel: string;   // "Pagi" | "Siang" | "Sore" | "Malam"
  variant?: 'ikhwan' | 'akhwat';
}
```

**States:**
- **Loading:** Skeleton card dengan shimmer animation
- **Loaded:** Tampilkan doa lengkap dengan arabic, latin, translation
- **Empty:** Pesan "Belum ada doa untuk waktu ini" (fallback)

**Variants:**
- `ikhwan` — border biru navy, accent gold
- `akhwat` — border rose, accent rose gold

---

### Component: `TodoItem`
**Path:** `src/components/todo-item.tsx`
**Deskripsi:** Item todo individual di Dashboard.

```tsx
interface TodoItemProps {
  id: string;
  title: string;
  icon: string;            // nama Lucide icon
  isCompleted: boolean;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
}
```

**States:**
- **Default:** Checkbox unchecked, teks normal, icon berwarna
- **Completed:** Checkbox checked, strikethrough, opacity 50%
- **Deleting:** Animasi slide-out sebelum dihapus

**Interactions:**
- Klik checkbox → toggle `isCompleted`, animasi centang
- Swipe left (mobile) → reveal "Hapus" button
- Long press → mode reorder

---

### Component: `TodoList`
**Path:** `src/components/todo-list.tsx`
**Deskripsi:** Daftar todo untuk hari ini di Dashboard.

```tsx
interface TodoListProps {
  todos: TodoItem[];
  emptyMessage: string;
  onAddTodo: () => void;
  onNavigateToJurnal: () => void;
}
```

**States:**
- **Has items:** Render list of `TodoItem` dengan spacing
- **Empty:** Tampilkan ilustrasi + `emptyMessage` + 2 tombol aksi
- **Loading:** Skeleton list (3 baris)

---

### Component: `TemplateCard`
**Path:** `src/components/template-card.tsx`
**Deskripsi:** Kartu template di halaman Jurnal (system atau personalized).

```tsx
interface TemplateCardProps {
  name: string;
  icon: string;
  category: string;
  itemCount: number;
  isPackage: boolean;
  variant: 'system' | 'personalized';
  onUse: () => void;
  onDelete?: () => void;        // hanya untuk personalized
}
```

**States:**
- **Default:** Menampilkan info template + tombol "Gunakan"
- **Personalized:** Tambah tombol "Hapus" (icon trash)
- **Used:** Feedback toast "Todo berhasil dijadwalkan untuk besok!"

---

### Component: `ThemeToggle`
**Path:** `src/components/theme-toggle.tsx`
**Deskripsi:** Toggle dark mode di halaman Profil.

```tsx
interface ThemeToggleProps {
  gender: 'ikhwan' | 'akhwat';
  isDark: boolean;
  onToggle: () => void;
}
```

**Preview:** Menampilkan preview kecil dari warna yang akan berubah (primary, bg, accent).

---

### Component: `BottomNav`
**Path:** `src/components/bottom-nav.tsx`
**Deskripsi:** Bottom navigation bar — sticky di bawah.

```tsx
interface BottomNavProps {
  items: NavItem[];
  activeItem: string;
}

interface NavItem {
  id: string;
  label: string;      // sudah di-translate
  icon: string;       // Lucide icon name
  href: string;
}
```

**States:**
- **Active:** Icon filled + warna primary (mengikuti gender theme)
- **Inactive:** Icon outline + warna abu-abu
- **Transition:** Animasi subtle saat pindah tab (icon scale)

---

### Component: `QuickAddModal`
**Path:** `src/components/quick-add-modal.tsx`
**Deskripsi:** Modal untuk quick add todo dari Dashboard.

```tsx
interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}
```

**States:**
- **Open:** Modal slide-up (mobile), centered dialog (desktop)
- **Submitting:** Button jadi loading spinner
- **Success:** Close modal, todo langsung muncul di list
- **Error:** Tampilkan error message di dalam modal

---

### Component: `CustomTodoForm`
**Path:** `src/components/custom-todo-form.tsx`
**Deskripsi:** Form untuk create custom todo di Jurnal (auto-save as personalized template).

```tsx
interface CustomTodoFormProps {
  onSubmit: (data: { title: string; icon: string }) => void;
  isSubmitting: boolean;
}
```

---

### Component: `Navbar`
**Path:** `src/components/navbar.tsx`
**Deskripsi:** Top bar tipis di setiap halaman.

```tsx
interface NavbarProps {
  title: string;          // judul halaman (sudah di-translate)
  showBack?: boolean;     // untuk halaman detail
  onBack?: () => void;
  rightAction?: React.ReactNode;  // icon/button tambahan di kanan
}
```

---

## Data Flow (Gambaran Lengkap)

```
┌─ PENGGUNA MEMBUKA APP ─────────────────────┐
│                                              │
│  1. Middleware next-intl deteksi locale      │
│  2. Fetch user profile (gender, dark_mode)   │
│  3. Apply theme CSS variables                │
│  4. Redirect ke /{locale}/dashboard          │
│                                              │
└──────────────────────────────────────────────┘

┌─ TODO LIFE CYCLE ────────────────────────────┐
│                                               │
│  [Sumber Todo]    [Tindakan]    [Hasil]       │
│                                               │
│  System Template   Klik "Gunakan"  → Todo besok│
│  Personalized      Klik "Gunakan"  → Todo besok│
│  Quick Add (Dash)  Input + Submit   → Todo hari│
│  Custom (Jurnal)   Form + Submit   → Todo besok│
│                                       + Template│
│                                               │
│  [Dashboard — Hari Ini]                      │
│  CHECKLIST → selesai → streak++               │
└──────────────────────────────────────────────┘

┌─ PRAYER SCHEDULING ──────────────────────────┐
│                                               │
│  Saat Dashboard dimuat:                       │
│  1. Ambil waktu user (timezone dari profil)   │
│  2. Cari doa WHERE start_hour <= jam_sekarang │
│     AND end_hour > jam_sekarang               │
│  3. Random pilih 1 dari yang cocok            │
│  4. Tampilkan + cache                        │
│                                               │
│  Refresh otomatis saat jam berganti waktu:    │
│  (pagi→siang→sore→malam)                     │
└──────────────────────────────────────────────┘
```

### Recommended Indexes

```sql
CREATE INDEX idx_user_todos_date ON user_todos(user_id, planned_date);          -- query todo harian
CREATE INDEX idx_user_todos_completed ON user_todos(user_id, is_completed);     -- filter selesai/belum
CREATE INDEX idx_prayers_time ON prayers(start_hour, end_hour);                 -- cari doa berdasarkan jam
CREATE INDEX idx_prayers_waktu ON prayers(waktu);                               -- filter by kategori waktu
CREATE INDEX idx_personalized_templates_user ON personalized_templates(user_id); -- template milik user
```

---

## API Endpoints (Gambaran — untuk backend)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (termasuk gender, locale) |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |

### User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile + preferences |
| PUT | `/api/users/me` | Update profile (name, gender, locale, city, timezone, dark_mode) |

### Prayers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prayers/today` | Get doa untuk waktu sekarang |
| GET | `/api/prayers/:id` | Get detail doa |
| GET | `/api/prayers?time=pagi` | Filter by waktu |

### System Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates/system` | Get semua system templates + items |
| GET | `/api/templates/system/:id` | Get detail template + items |

### Personalized Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates/personalized` | Get user''s personalized templates |
| POST | `/api/templates/personalized` | Create new personalized template |
| PUT | `/api/templates/personalized/:id` | Update template |
| DELETE | `/api/templates/personalized/:id` | Delete template |

### Todos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos?date=2026-07-05` | Get todos by date |
| POST | `/api/todos` | Create todo (system/personalized/quick) |
| PUT | `/api/todos/:id` | Update todo (toggle completed, edit) |
| DELETE | `/api/todos/:id` | Delete todo |
| POST | `/api/todos/plan-from-template` | Plan todos from template for tomorrow |

---

## Desain Visual Detail

### Ikhwan Theme

| Token | Light | Dark |
|-------|-------|------|
| `--theme-primary` | #1B3A5C | #0D1B2A |
| `--theme-bg` | #F8F6F2 | #1B2838 |
| `--theme-card` | #FFFFFF | #243447 |
| `--theme-accent` | #C9A96E | #A88C4A |
| `--theme-text` | #1A1A2E | #E8E0D8 |
| `--theme-muted` | #E8E4DC | #2D3A4A |
| `--theme-border` | #D4D0C8 | #3A4A5A |

### Akhwat Theme

| Token | Light | Dark |
|-------|-------|------|
| `--theme-primary` | #B5828C | #6B4F5A |
| `--theme-bg` | #FDF2F4 | #2A1C20 |
| `--theme-card` | #FFFFFF | #3D2A30 |
| `--theme-accent` | #D4A5A5 | #C98A8A |
| `--theme-text` | #2D1B1E | #F0E4E6 |
| `--theme-muted` | #F0E4E6 | #4A353C |
| `--theme-border` | #E0D0D4 | #5A454C |

### Komponen Visual

- **Bottom Nav:** Icon + label kecil. Active state: icon filled + warna primary. Inactive: icon outline + abu.
- **Kartu Doa:** Background `--theme-card`, border `--theme-border`, shadow halus (`0 2px 8px rgba(0,0,0,0.04)`).
- **Todo Item:** Checkbox custom (bisa di-click), teks di samping kanan, icon kategori di ujung kanan.
- **Modal:** Slide-up dari bawah (mobile), backdrop blur.
- **Tombol:** Rounded-full untuk primary CTA, rounded-lg untuk secondary.
- **Loading State:** Skeleton dengan animasi pulse (warna `--theme-muted`).
- **Toast:** Notifikasi kecil di bottom, auto-dismiss 3 detik.
- **Typografi:** Inter (body), font sans-serif yang bersih. Arab menggunakan font Arabic (Amiri atau Uthmanic).

---

## Catatan Tambahan

- **Empty state:** Awalnya user tidak punya todo — tampilkan pesan ramah + ajakan ke Jurnal
- **System templates** tidak bisa dihapus/diedit oleh user
- **Personalized templates** bisa diedit, dihapus, dan di-duplikasi
- **Quick add** dari Dashboard adalah one-time, tidak jadi template
- **Refresh doa:** Setiap pergantian waktu (pagi→siang→sore→malam), doa otomatis berganti — bisa pakai `setInterval` atau refetch saat app dibuka
- **MVP scope:** 3 halaman (Dashboard, Jurnal, Profil) + 2 mode gender + dark mode + todo system + personalized templates
