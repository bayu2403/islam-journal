**The Quiet Ritual.** Muslim Berislam is a calm daily companion for Indonesian Muslims — wajib and sunnah prayers, dhikr, Qur'an reading and personal todos — opened briefly several times a day (subuh, mid-work, evening). It should feel *tenang, khusyuk, premium*: calm, reverent, premium. Premium comes from restraint — deep committed colour, serif moments, generous space — never from gradients, glassmorphism or decorative motion.

## Principles

1. **One task at a time, in real time.** Beranda shows the next Akhirat task and the next Dunia task, ordered by real prayer times (Aladhan, KEMENAG method). Never a wall of tasks.
2. **Religious content carries the meaning.** Hadith, dua and dalil are rendered verbatim and in full in their full view, with visual weight. Never truncated in the dialog, never paraphrased for length, never styled as decorative display or gradient text.
3. **Skipping is neutral.** "Lewati dulu" has exactly the size and weight of "Dikerjakan". Skipped or missed tasks share the neutral `muted` chip with pending ones. No red, no strikethrough, no alarm.
4. **Two calendars, always together.** Wherever a date appears, Masehi and Hijriah sit side by side at equal size. Neither is a footnote.
5. **Arabic is read aloud.** `dir="rtl" lang="ar"`, a Naskh face (`arabic-lg` 26px / `arabic-md` 21px) with 2.0 leading.

## Content fundamentals

Gentle, invitational Indonesian, second person *kamu*, sentence case. Copy never induces guilt or counts failures.

| Say | Never |
| --- | --- |
| Lewati dulu | Gagal · Skip · Batal |
| Belum · Dilewati | Terlewat! · Missed · Terlambat |
| Alhamdulillah, semua sudah untuk saat ini. | Kerja bagus! 🎉 · Streak 7 hari! |
| Judulnya diisi dulu, ya. | Error: field required |
| Jadwal sholat belum bisa dimuat. Sementara kami pakai waktu perkiraan. | Gagal memuat data! |
| Apa yang kamu syukuri hari ini? | Kamu belum menulis hari ini |

- Greetings: "Assalamu'alaikum, {nama}" with a soft invitation beneath ("Ayo mulai hari dengan berdoa.").
- Religious terms keep their common Indonesian spelling: sholat, dzikir, Subuh, Dzuhur, Ashar, Maghrib, Isya, Al-Qur'an, HR. (hadits riwayat), QS.
- Buttons are verbs: Simpan, Tambah, Coba lagi, Lihat dalil, Buat akun.
- No emoji anywhere in the UI, and never on or near religious content.
- Keep `messages/id.json`, `en.json`, `ms.json` in sync; English and Malay follow the same gentle register.

## Colour

Four palettes — Ikhwan (emerald · lime · amber) and Akhwat (plum · rose · champagne), each light and dark — share one set of token names, so components never branch on theme.

- **Ground and text.** `background` is the page; `foreground` all body text and headings. Surfaces: `card` for standard and Dunia cards, `popover` for dialogs and menus. Secondary text in `muted-foreground` (≥5.2:1 on `background`, `card` and `muted`).
- **Primary** (`primary` / `primary-foreground`): the one solid action per view, active nav tab, links, selected week day, checked rows, the focus-ring source.
- **Secondary** (`secondary`): the Rencana hari ini date panel, icon chips on template cards, the Selesai chip.
- **Accent** (`accent` / `accent-foreground`): the Dikerjakan pill and today's circle in the week strip. A fill only.
- **The One Dark Card Rule.** `card-inverse` is used by exactly one component: the Akhirat TaskCard, once per screen. Text on it is `card-inverse-foreground` (headline, pills) and `card-inverse-muted` (eyebrow, time, summary). In dark palettes it sits *below* `background` as a well, edged by `card-inverse-border`. Never use it for chrome, featured content or a second card — the Jurnal Akhirat planner tile stays light.
- **The Amber-Is-Sacred Rule.** `reward` colours only the hadith-source fragment on the Akhirat card — "(HR. Tirmidzi no. 241)". `reward-ink` carries the same role on light grounds (the dalil dialog citation). Neither is a general gold accent; the dua card's Qur'an source is `muted-foreground`.
- **Destructive** only for real validation failures. Network and server errors use a neutral `muted` note.
- **Borders.** `border` is a 1px hairline for cards and dividers (decorative). Controls — inputs, outline buttons, the Lewati pill, check circles — use `input`, which holds ≥3:1.

## Typography

Serif for moments, sans for everything functional, Naskh for Arabic.

- **Lora** (`serif`, 600–700): `display` for the greeting and page titles, `h1` for date numerals and dialog titles, `h2` for section headings. Also the StoryCard textarea — the user's own writing. Never on buttons, body copy or hadith text.
- **Geist** (`sans`): `h3` 18/24 bold for task headlines, `title` 15/22 semibold, `body` 14/21, `small` 13/19, `label` 12/16 medium, `eyebrow` 11/14 semibold uppercase +0.12em for AKHIRAT / DUNIA, `caption` 12/16 for times. Use `tabular-nums` for every time and date numeral.
- **Amiri** (`arabic`, fallback Noto Naskh Arabic): `arabic-lg` in full views, `arabic-md` inline; never below 20px.
- **Geist Mono** only for activity-feed timestamps.
- Headings take `text-wrap: balance`; running text stays near 65 characters.

## Space, shape, depth

- 4px base. Page gutter `space-4` (16px); card padding `space-4`, task card and panel padding `space-5`; section gap `space-6`; stacked cards `space-3`.
- Radius from `--radius` 0.625rem: buttons and inputs `radius-lg`, cards `radius-xl`, task cards `radius-2xl`, date panel and sheets `radius-3xl`, pills and day circles `radius-full`.
- **Flat unless floating.** Cards, rows and chips take a 1px hairline, never a shadow. `shadow-float` belongs to the + FAB only; `shadow-sheet` to dialogs, sheets and the dropdown menu.
- No coloured left/right border stripes. No gradients (the StoryCard's ruled lines are the one linear pattern).
- Mobile-first column, `max-width: 448px`, centred with side borders on wider screens; sticky top bar and bottom nav honour safe-area insets.

## Motion

150–200ms ease-out fades and short slides only (`duration-fast`, `duration-base`). Hover is a tint shift, never a scale or shadow pop. Completing a task swaps the card with a 200ms fade — no bounce, confetti or celebration. Under `prefers-reduced-motion` every transition and skeleton breathe drops to 0ms.

## Iconography

Lucide, 1.5px stroke (1.8 inactive / 2.4 active in the bottom nav), `currentColor`, 14–20px. Calm and literal.

- Akhirat: `landmark` (the dome-and-columns silhouette reads as masjid). Dunia: `activity` or `leaf` — replace the current `sparkles`, which reads playful.
- Shell: `house`, `notebook-pen`, `user`. Time: `clock`, `sunset` for the next prayer. Journals: `book-open` (ilmu), `leaf` (kesehatan), `hand-heart` (penghargaan diri), `pen-line` (cerita).
- Near dua or hadith use no icon at all, or `book-open` — never stars, sparkles, hearts-with-faces, trophies, flames or emoji.
- There is no logo yet: the name is set in Lora 700.

## Accessibility

WCAG AA in all four palettes (see the Accessibility section for the full table): body text ≥4.5:1, large text, icons, control borders and the focus ring ≥3:1. Focus-visible is a 2px solid `ring` outline with 2px offset (on the Akhirat card the ring switches to `card-inverse-foreground`). Touch targets ≥32px tall with 8px spacing; nav items span the full third. Status is always carried by a word (Selesai / Belum / Dilewati), never colour alone.
