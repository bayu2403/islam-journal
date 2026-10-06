# 🌙 Muslim Berislam

> A calm, spiritual Islamic productivity app combining worship tracking with personal growth tools.

**Muslim Berislam** helps you track daily checklists, journal your reflections, log prayers, read the Quran with audio, and build meaningful spiritual habits — all in one peaceful space.

**Default language:** 🇮🇩 Indonesian · Also available in: 🇬🇧 English, 🇲🇾 Malay

---

## 🧱 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 16** | App framework — routing, SSR, performance |
| **shadcn/ui** | Component library (button, card, dialog, etc.) |
| **Tailwind CSS v4** | Utility-first styling |
| **Lucide Icons** | Clean icon set |
| **next-intl** | Internationalization (ID, EN, MS) |

### Backend (Phase 1 — Node.js)

> *Phase 2 will rewrite to Go + Gin.*

| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server (port 4000) |
| **Supabase / PostgreSQL** | Database & auth *(not yet connected)* |
| **Helmet + CORS** | Security middleware |

---

## 📁 Project Structure

```
muslim-berislam/
├── frontend/                      # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/          # Locale-aware routes (id, en, ms)
│   │   │   │   ├── layout.tsx     # NextIntlClientProvider wrapper
│   │   │   │   └── page.tsx       # Landing page
│   │   │   ├── globals.css        # Tailwind + shadcn styles
│   │   │   ├── layout.tsx         # Root layout (html, body, fonts)
│   │   │   └── page.tsx           # Root catch-all
│   │   ├── components/
│   │   │   ├── ui/                # shadcn components
│   │   │   └── language-switcher.tsx
│   │   └── lib/
│   │       └── utils.ts           # cn() utility
│   ├── i18n/
│   │   ├── routing.ts             # Locale config (id, en, ms)
│   │   └── request.ts             # Message loader
│   ├── messages/
│   │   ├── id.json                # Indonesian translations
│   │   ├── en.json                # English translations
│   │   └── ms.json                # Malay translations
│   ├── middleware.ts              # Locale routing middleware
│   ├── next.config.ts             # next-intl plugin
│   └── package.json
│
├── server/                        # Express API
│   ├── src/
│   │   ├── index.js               # Server entry (port 4000)
│   │   ├── routes/index.js        # Placeholder routes
│   │   └── config/database.js     # Supabase placeholder
│   ├── .env / .env.example
│   └── package.json
│
├── project-summary.md             # Full project docs
└── README.md                      # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20.19.6 (or compatible)
- **npm** (comes with Node.js)

### 1. Frontend (Next.js)

```bash
# Start the dev server
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

> The dev server uses Turbopack for fast hot-reload.

### 2. Backend (Express API)

Open a **second terminal**:

```bash
# Start the API server
cd server
npm run dev
```

The API runs on **http://localhost:4000**.

Test it:
```bash
curl http://localhost:4000/api/health
# → { "status": "ok", "timestamp": "..." }
```

### 3. Running Both Together

| Service | Command | URL |
|---|---|---|
| Frontend | `cd frontend && npm run dev` | http://localhost:3000 |
| Backend  | `cd server && npm run dev`   | http://localhost:4000 |

> ⚠️ **Port 3000 already in use?**  
> Kill the existing process: `taskkill //F //PID <PID>` (Windows) or `kill -9 <PID>` (Mac/Linux)
> Then retry: `cd frontend && npm run dev`

---

## 🌐 Language Support

The app uses **next-intl** for internationalization. Currently supported:

| Language | Locale | Status |
|---|---|---|
| 🇮🇩 **Indonesian** | `id` | ✅ Default |
| 🇬🇧 **English** | `en` | ✅ Supported |
| 🇲🇾 **Malay** | `ms` | ✅ Supported |

**Switching languages:** Click the flag icon in the top-right corner of any page.

**Adding a new language:**
1. Add the locale to `i18n/routing.ts` → `locales` array
2. Create `messages/{locale}.json` with all translation keys
3. The middleware and routing will handle it automatically

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/checklists` | Checklist CRUD *(placeholder)* |
| GET | `/api/journals` | Journal entries *(placeholder)* |
| GET | `/api/prayers` | Prayer tracking *(placeholder)* |
| GET | `/api/quran/progress` | Quran reading progress *(placeholder)* |
| GET | `/api/habits` | Habit tracking *(placeholder)* |

---

## 🗄️ Supabase Setup (Coming Soon)

The app is designed to use Supabase for authentication and database. To connect:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Add them to `server/.env`:
   ```
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_role_key
   ```
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `frontend/.env.local`

---

## 📜 Available Scripts

### Frontend (`cd frontend`)

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

### Backend (`cd server`)

| Script | Description |
|---|---|
| `npm run dev` | Start with file watching (`node --watch`) |
| `npm start` | Start without watching |

---

## 🔮 Future Plans

- **Go + Gin rewrite** — Migrate backend from Node.js/Express to Go/Gin (same API contract)
- **Supabase auth** — User registration/login with email, Google, etc.
- **Quran integration** — AlQuran Cloud API for text, translation & audio
- **Prayer times** — Automatic prayer time calculation based on location
- **Progress analytics** — Visual streaks, charts, and insights
- **Mobile responsive** — Optimized for phone usage
- **Dark mode** — Calm dark theme

---

## 📄 License

Private project.

---

## 🎨 Design systems

Two alternative design systems (The Quiet Ritual, Falak) with landing pages live in [`design-system/`](design-system/README.md).

## ⚙️ Environment setup

Secrets are not committed. Copy the examples and fill in your Supabase values:

```bash
cp server/.env.example server/.env
cp frontend/.env.example frontend/.env.local
```

Database schema and seed: run `server/db/schema.sql`, `seed.sql`, then `migration-002.sql` in the Supabase SQL editor.
