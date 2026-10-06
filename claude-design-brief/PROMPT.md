Create a complete design system for **"Muslim Berislam"**, a mobile-first (max-width ~448px) PWA that helps Indonesian Muslims with daily worship and productivity. Users open it briefly several times a day (subuh, mid-work, evening). They use it to keep up wajib/sunnah prayers, dhikr, Quran reading, and personal todos.

## Attached references

- **02-card-style-reference.jpeg** is the **primary visual reference**. Match its feel: a dark, premium Akhirat card with a small uppercase category label and icon chip, a bold headline, and a one-line benefit whose hadith source is in a warm orange highlight. Below it sits a clean white Dunia card with a hairline border. The background is warm off-white, the whitespace is generous, and the whole thing is quiet and editorial.
- **01-beranda-wireframe.jpeg, 03-jurnal-wireframe.jpeg, 04-profil-wireframe.jpeg** show **layout and information architecture only**. Take section order and content blocks from them. **Ignore their visual styling.** Their gradients, saturated lime/peach fills, and emoji are placeholders that go against the brand.
- **PRODUCT.md / DESIGN.md** (if attached) describe the current product and design system. Treat their token values as the starting point.

## Brand

The Creative North Star is **"The Quiet Ritual"**. The personality is *tenang, khusyuk, premium*: calm, reverent, premium. The premium feel comes from restraint: deliberate deep color, serif display type, and generous spacing. Do not use gradients, glassmorphism, or decorative motion.

Avoid these anti-references:
- Generic SaaS near-white dashboards that never commit to a real palette
- Gamified habit trackers: streak badges, mascots, confetti, celebratory bounce, or scolding copy
- Playful or cartoon iconography near religious content, including emoji on religious surfaces

## Core principles

1. **One task at a time, ordered by real prayer times.** Never show a wall of tasks.
2. **Religious content carries the meaning, so treat it with weight.** Hadith, dua, and dalil are rendered verbatim and in full. Never truncate them in full view, and never style them as decorative gradient text.
3. **Skipping is neutral.** "Lewati" (skip) has the same visual weight as "Dikerjakan" (done). Skipped or missed tasks never get red or alarm styling.
4. **Show two calendars together.** Wherever a date appears, show Masehi (Gregorian) and Hijriah side by side. Neither one is a footnote.
5. **Arabic text** renders RTL (`dir="rtl" lang="ar"`) at a legible, generous size.

## Theming: 4 palettes sharing ONE token structure

Use shadcn-compatible token names in oklch: `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `border`, `input`, `ring`, `destructive`. Add these custom tokens:

- `card-inverse` / `card-inverse-foreground`: the dark "well" card reserved for Akhirat tasks. In dark mode it must be **darker than the page background** so it still reads as a distinct surface.
- `reward`: reserved **only** for the hadith-source fragment, e.g. "(HR. Tirmidzi no. 2910)". Never use it decoratively.

Starting values (refine them, but keep their character):

| Palette | Key values |
|---|---|
| **Ikhwan light** (emerald + lime + amber) | bg warm ivory `oklch(0.985 0.01 95)`, fg ink green `oklch(0.22 0.02 160)`, primary deep emerald `oklch(0.4 0.09 168)`, secondary soft sage `oklch(0.94 0.05 120)`, accent fresh lime `oklch(0.9 0.15 125)`, card-inverse deep teal-slate `oklch(0.28 0.04 180)`, reward warm amber `oklch(0.75 0.15 65)` |
| **Ikhwan dark** | bg `oklch(0.16 0.015 170)`, card `oklch(0.24 0.025 172)`, primary `oklch(0.75 0.1 160)`, accent lime `oklch(0.85 0.16 125)`, card-inverse `oklch(0.09 0.02 180)`, reward `oklch(0.8 0.15 70)` |
| **Akhwat light** (plum + rose + champagne) | bg `oklch(0.985 0.008 350)`, fg `oklch(0.24 0.03 345)`, primary deep plum `oklch(0.45 0.12 350)`, secondary `oklch(0.95 0.03 10)`, accent soft rose `oklch(0.88 0.08 10)`, card-inverse deep plum `oklch(0.3 0.06 340)`, reward champagne gold `oklch(0.78 0.12 85)` |
| **Akhwat dark** | bg `oklch(0.17 0.025 340)`, card `oklch(0.25 0.035 342)`, primary `oklch(0.76 0.09 350)`, accent `oklch(0.8 0.1 10)`, card-inverse `oklch(0.1 0.03 340)`, reward `oklch(0.82 0.12 85)` |

All 4 palettes must pass **WCAG AA**: 4.5:1 for body text and 3:1 for large text and UI elements. That includes text on `card-inverse` and the `reward` color on its surfaces. Include a contrast table.

## Typography

- **Display, headings, and greetings:** Lora (serif), weight 600–700.
- **Body and UI:** Geist Sans. Body is 14px with 1.5 line-height. Labels are 12px medium with slight tracking; use uppercase tracked labels for category chips like "AKHIRAT" / "DUNIA".
- **Arabic:** choose a respectful, highly legible Naskh face (e.g. Amiri or Noto Naskh Arabic). Set it larger than Latin body text with generous line-height.
- Define a full type scale with size, weight, and line-height for each style: display, h1–h3, body, small, label, caption, arabic-lg, arabic-md.

## Foundations

- **Spacing:** 4px base. Page gutter 16px, card padding 16–20px, section gap 24px.
- **Radius:** scale from a base of 0.625rem (sm → 4xl). Pills are fully rounded.
- **Elevation:** prefer 1px hairline borders to shadows. Use at most one subtle shadow level.
- **Iconography:** lucide at 1.5px stroke, calm. Give guidance on which icons suit religious content (e.g. mosque/dome for Akhirat, a pulse or leaf icon for Dunia).
- **Motion:** keep it minimal: 150–200ms ease-out fades and slides only. Respect `prefers-reduced-motion`. Completing a task gets no celebratory motion.

## Components

Show each component in all 4 palettes, with default, hover, pressed, focus-visible, and disabled states.

1. **Button**: primary, secondary, outline, and ghost. Also a pill-filled (accent) + pill-outline pair for "Dikerjakan" / "Lewati", given equal weight.
2. **Task card**:
   - *Akhirat variant*: card-inverse surface, category chip, template name as the headline, time from the prayer schedule, one-line benefit summary with the hadith source in the `reward` color, a "Lihat dalil" link, and done/skip pills.
   - *Dunia variant*: light card with hairline border, category chip, title, optional scheduled time, and done/skip pills.
3. **Dalil dialog**: the full hadith text (Arabic, translation, and sahih citation) in a scrollable view. Never truncate it.
4. **Date panel**: a serif greeting ("Assalamu'alaikum, …"), Masehi and Hijriah dates side by side, and the next prayer's name and time.
5. **Week strip (Jurnal)**: 7 days. Each day shows the Masehi day number with a small Hijriah day number. Today is highlighted with an accent circle; include a selected state.
6. **All-tasks-today list**: rows with done, skipped, or pending status. Skipped rows use neutral muted styling, and late-checking is allowed.
7. **Dua card**: Arabic (RTL), transliteration, meaning, and source.
8. **Story card ("Cerita hari ini")**: a calm, paper-like textarea for journaling.
9. **Activity feed item (Profil)**, e.g. "14:00 · Sudah sholat Dzuhur".
10. **Template card (Jurnal)**, a **Quick-add dialog** for Dunia todos, and a **recurrence picker** (daily or specific weekdays).
11. **Top bar** and **bottom nav** (Beranda / Jurnal / Profil): sticky and safe-area aware.
12. Inputs, textarea, label, badge/chip, tabs, dropdown menu, separator.
13. **Theme switcher** (Ikhwan/Akhwat × Light/Dark) and **language switcher** (ID / EN / MS).
14. **Empty states** (e.g. "all tasks done for now": calm, no confetti), loading skeletons, and error states that don't alarm.

## Screens to mock (mobile, 390×844)

Follow the wireframe layouts, restyled with the system:

- **Beranda:** serif greeting, date panel, dua recommendation card, "Rencana hari ini" with the next Akhirat card and the next Dunia card, and a "Semua task hari ini" link.
- **Jurnal:** title with a subtitle quote, week strip, "Rencana esok hari" (Akhirat / Dunia), and "Journal harian" template cards (Catatan ilmu, Journal kesehatan, Journal penghargaan diri).
- **Profil:** avatar and name, guest-upgrade prompt, Cerita hari ini, and "Aktivitasku" with the Riwayat ibadah feed, plus theme and language settings.

Show **Beranda in all 4 palettes**.

## Deliverables

- **Token sheet:** CSS variables in oklch, organized as a `:root` base plus `html[data-gender="ikhwan"|"akhwat"]` and `.dark` variants. It must be compatible with Tailwind v4 `@theme inline` and shadcn naming.
- **Component specs:** anatomy, spacing, states, and do/don't examples. Cover skip styling, religious-text treatment, and `reward` color usage in particular.
- **Contrast and accessibility table** for all 4 palettes.
- **Copy tone guidance:** gentle, invitational Indonesian (e.g. "Lewati dulu", not "Gagal"). Copy never induces guilt.
