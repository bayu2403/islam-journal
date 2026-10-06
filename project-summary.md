# Muslim Berislam — Spiritual & Productivity App

> **Date:** July 4, 2026  
> **Status:** Planning Phase  
> **Node.js:** v20.19.6 (current)

---

## 📱 App Identity

| Attribute | Value |
|---|---|
| **App Name** | Muslim Berislam |
| **Default Language** | 🇮🇩 Indonesian |
| **Supported Languages** | English, Malay (additional) |
| **Tagline** | *Your spiritual journey companion* |

---

## 🎯 App Concept

A calm, spiritual **Islamic productivity app** combining worship tracking with personal growth tools. The app is meant to feel **minimal, peaceful, and modern** — not rigid or enterprise-like. The UI and copy are written in **Indonesian by default**, with seamless switching to English and Malay.

### Core Features

| Feature | Description (ID) | Description (EN) |
|---|---|---|
| ✅ **Daily Checklist** | Catat tugas harian & ibadah | Track daily tasks & ibadah items |
| 📓 **Journaling / Diary** | Refleksi pribadi & jurnal spiritual | Personal reflection & spiritual journal |
| 🕌 **Prayer Tracker** | Catat shalat 5 waktu & riwayat | Track salah (prayer) adherence & times |
| 📖 **Quran Reader** | Baca teks Arab + terjemahan + audio | Read Arabic text + translation + audio |
| 📊 **Progress Tracking** | Pantau progres Quran, kebiasaan, streak | Visual progress on Quran, habits, streaks |
| 🔄 **Habit Tracker** | Lacak kebiasaan spiritual & pribadi | General habit tracking (spiritual & personal) |
| 🧘 **Calm UI** | Tampilan minimalis & menenangkan | Minimal, aesthetic design |

---

## 🌐 Language Strategy

| Language | Status | Locale |
|---|---|---|
| 🇮🇩 **Indonesian** | ✅ **Default** | `id` |
| 🇬🇧 **English** | ✅ Supported | `en` |
| 🇲🇾 **Malay** | ✅ Supported | `ms` |

> **Note:** i18n infrastructure (e.g., `next-intl`) should be set up from the start so all text is in translation files, making it easy to add more languages later. Indonesian (`id`) is the source language.

---

## 🧱 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js** | App framework — routing, SSR, API routes, performance |
| **shadcn/ui** | Copy-paste component library (modern, flexible, customizable) |
| **Tailwind CSS** | Utility-first styling — fast, flexible, aesthetic |
| **Radix UI** | Low-level primitives used under shadcn/ui |
| **Lucide Icons** | Clean, modern icon set |

> **Why this stack?**  
> Next.js provides structure & performance, shadcn/ui gives ready-made components without locking you in, and Tailwind enables fast custom styling. Together they're the current "gold standard" for modern React apps — ideal for a feature-rich app like this.

### Backend — Two-Phase Plan

#### Phase 1: Node.js (Now)

> *Current laptop cannot run Go, but can run Node.js v20.19.6. Start here, ship fast.*

| Technology | Purpose |
|---|---|
| **Node.js + Express** | Backend API server (REST) |
| **Supabase / PostgreSQL** | Database & auth (user data, progress, journals, etc.) |

#### Phase 2: Go with Gin (Future Rewrite)

> *Once the laptop can run Go, migrate the backend for performance & type safety.*

| Technology | Purpose |
|---|---|
| **Go + Gin** | Backend API server (rewritten from Node.js) |
| **Supabase / PostgreSQL** | Database & auth (unchanged) |

**Migration strategy:** Keep the same database schema (Supabase/Postgres) — the Go rewrite only touches the API layer. The frontend talks to the same REST endpoints, so it's a drop-in replacement.

---

## 📖 Quran Feature — Architecture

### Data Sources

| Source | Type | Usage |
|---|---|---|
| **AlQuran Cloud API** | REST API | Fetch surah list, ayat text, translation, audio URLs |
| **Tanzil Project** | Dataset (optional) | Self-host Quran text if needed (gold-standard accuracy) |
| **Quran Audio CDN** | Streaming | Stream mp3 recitation from various qari (Mishary, Al-Budair, etc.) |

### Data Strategy

| Data Type | Storage | Notes |
|---|---|---|
| Ayah text, translation, audio | **API (AlQuran Cloud)** | Fetch on demand; optionally cache in Supabase |
| User progress (last read, bookmarks, juz progress) | **Database (Supabase/Postgres)** | Always store user-specific data in your own DB |
| Audio | **CDN streaming** | No need to store audio files locally |

### Open-Source References

| Project | What to learn from |
|---|---|
| **Quran.com** (open source) | Modern reading UI, audio sync, bookmarks |
| **Ayat App** (Android) | Feature set — tafsir, audio, bookmarking |

---

## 🎨 Design Direction

- **Vibe:** Calm, peaceful, minimal, "islamic spiritual" aesthetic
- **Not:** Rigid/enterprise like MUI or Ant Design
- **Customizable:** shadcn/ui allows full control over look & feel
- **Color:** Likely muted earth tones, greens, blues — to be defined
- **Typography:** Clean sans-serif (Geist font) for modern Indonesian/English/Malay readability
- **Arabic text:** Special handling for Quranic Uthmani script

---

## 🧩 Suggested Architecture

### Phase 1 (Node.js)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Node.js + Express│────▶│  Supabase/      │
│  (shadcn+TW)    │◀────│  (backend API)   │◀────│  PostgreSQL     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌──────────────┐
│  AlQuran Cloud  │     │  Audio CDN   │
│  (API)          │     │  (recitation)│
└─────────────────┘     └──────────────┘
```

### Phase 2 (Go + Gin)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Go + Gin        │────▶│  Supabase/      │
│  (shadcn+TW)    │◀────│  (rewritten API) │◀────│  PostgreSQL     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌──────────────┐
│  AlQuran Cloud  │     │  Audio CDN   │
│  (API)          │     │  (recitation)│
└─────────────────┘     └──────────────┘
```

> **Key insight:** The frontend <-> API contract stays identical. Only the backend language changes. The database stays the same in Supabase.

- **Frontend** calls AlQuran Cloud API directly for text & audio URLs
- **Frontend** calls Node.js (later Go) API for user-specific data (progress, journals, checklists)
- **API** reads/writes to Supabase/Postgres for persistence
- **Audio** is streamed directly from CDN URLs provided by AlQuran Cloud

---

## 🚀 MVP Roadmap (7–14 Day Estimate)

1. **Project setup** — Next.js + shadcn/ui + Tailwind + Node.js/Express + i18n scaffold
2. **Auth** — Supabase auth integration (login/register in Indonesian)
3. **Home/Dashboard** — Overview of today's checklist, prayer status, Quran progress
4. **Daily Checklist** — CRUD checklist items, check/uncheck
5. **Journal** — Create, edit, delete journal entries with date
6. **Prayer Tracker** — Track 5 daily prayers, view history
7. **Quran Reader** — Surah list, ayat display, audio playback
8. **Progress & Statistics** — Streaks, completion rates, Quran juz progress
9. **Polish** — UI refinements, dark mode, responsive, language toggles

---

## ⚡ Key Principles

- **Start with Node.js, plan for Go** — ship now, optimize later
- **Indonesian first** — all UI text written in Indonesian, then translate to English & Malay
- **Don't over-rely on external APIs** for user-specific data — store progress locally
- **Cache Quran text** for faster loading
- **Keep UI minimal & calm** — this is a spiritual tool, not a corporate dashboard
- **Prioritize mobile experience** — likely primary usage is on phone
