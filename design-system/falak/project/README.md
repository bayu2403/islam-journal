**Falak** — the Muslim Berislam interface. *Ilmu falak* is the astronomy that computes prayer times; the system takes that literally. The day is an orbit, prayers are nodes on it, the screen is a clear night sky with instruments. Modern, animated, precise — and still reverent: light and motion live in the chrome, while dua and hadith stay still.

## Principles

1. **The sky is the clock.** Beranda leads with the PrayerOrbit: the sun's real position, the next prayer, a live countdown. Everything else is ordered by it.
2. **One task at a time.** The next Akhirat task (holo card) and the next Dunia task (glass card). Nothing more on the home screen.
3. **Light for chrome, stillness for revelation.** Beams, aurora, glows, springs — on surfaces, controls and transitions. Hadith, dua and Arabic never glow, never gradient, never move after they arrive.
4. **Skipping is neutral.** Lewati has the same size, weight, duration and easing as Dikerjakan. Skipped rows share the neutral chip with pending ones.
5. **Two calendars, equal weight.** Masehi and Hijriah side by side wherever a date appears.

## Content fundamentals

Gentle, invitational Indonesian, *kamu*, sentence case. Data labels (HUD) are mono uppercase and terse; sentences stay warm.

| Say | Never |
| --- | --- |
| Lewati dulu | Gagal · Skip · Batal |
| Menuju Ashar · 15:21 | Kamu terlambat! |
| Belum · Dilewati · Berikutnya | Terlewat! · Missed |
| Alhamdulillah, semua sudah untuk saat ini. | Streak 7 hari! 🔥 · Level up! |
| Judulnya diisi dulu, ya. | Error: field required |
| Jadwal sholat belum bisa dimuat. Sementara kami pakai waktu perkiraan. | Gagal memuat data! |

- HUD voice: `AKHIRAT`, `ASHAR · 15:21`, `27.07 · 02 SAFAR` — facts, not prose.
- No emoji. No mascots. Keep `messages/id.json`, `en.json`, `ms.json` in sync.

## Colour

Four palettes on one token set — dark-first. **Malam** (dark) is the default; **Siang** (light) is the lunar variant.

- **Ground**: `background` is a night sky (midnight teal for Ikhwan, plum-night for Akhwat), always wearing the `.fk-ground` atmosphere: a star-dot grid in `grid` fading down the screen and two aurora lights (`glow`, `glow-2`) drifting over `duration-ambient`.
- **Signal**: `primary` — mint (Ikhwan) or orchid (Akhwat). The orbit arc, the sun, active dock tab, primary action, links, focus. **Second light**: `accent` — sky-cyan or apricot — today's orb, the Dikerjakan pill, the second stop of every beam.
- **Surfaces**: `glass` + `blur-glass` for panels that float over the atmosphere (orbit, Dunia card, dua, dock, lists); `card` for inputs and fallbacks; `popover` for sheets and menus.
- **The Holo Rule.** `card-inverse` is the deepest surface on screen and belongs only to the Akhirat TaskCard, with its conic border beam and khatam field. One per screen.
- **The Solar Rule.** `reward` (solar gold) colours only the hadith-source fragment on the holo card; `reward-ink` carries it in the dalil sheet. Never a general accent.
- `destructive` only for validation. Network errors are a calm glass note with an `accent` icon.

## Typography

- **Unbounded** (`display`): wide, geometric, orbital. `display` 32px for greetings and page titles, `h1` 24px for sheet titles and names, `h2` 17px for section heads, plus day-orb numerals and dates. The greeting's name may carry the `.fk-grad` light gradient — the only gradient text in the system.
- **Onest** (`sans`): `h3` 19px/650 task headlines, `title`, `body` 15/23, `small`, `label`.
- **JetBrains Mono** (`mono`): the instrument voice — `hud` 11px uppercase +0.14em for eyebrows and tags, `countdown` 40px tabular, `data` 12px for times and dates, the hadith source.
- **Noto Naskh Arabic** (`arabic`): all dua and hadith, `arabic-lg` 26/52 or `arabic-md` 21/40, RTL. **Reem Kufi** (`kufi`) only for short ornamental Arabic like the فَلَك wordmark — never for text that is read.

## Space, shape, light

- 4px base; gutter `space-4`, task card padding `space-5`, sections `space-6`, `space-12` clearance above the dock.
- Radii are generous and soft: `radius-md` 12 controls, `radius-lg` 18 panels, `radius-xl` 24 cards, `radius-2xl` 32 sheets and dock, `radius-full` pills and orbs.
- Depth is light, not weight: `shadow-glow` (a coloured halo from `primary`) on hover and on the holo card; `shadow-float` (soft dark drop) on the dock, sheets and menus only.
- Geometry motif: the **khatam** — two squares at 45° forming an 8-point star — nested three deep, drawn in 0.8 hairlines. It rotates slowly in the holo card and the empty state. `Falak.khatam()` renders it.

## Motion

Motion is the brand. Slow ambient light in the background (aurora 18s, beam 6s, khatam 18s); fast, precise responses in the foreground (120–420ms, `ease-out-expo` in, `ease-in-quart` out, `ease-spring` for anything you touch). Cards enter with rise + de-blur in a 70ms stagger; the orbit arc draws itself on load; the countdown ticks; tabs and the dock indicator glide; presses ripple. Completion is a drawn check and one light sweep — never confetti. See the Motion component for the full table. Everything stops under `prefers-reduced-motion`.

## Iconography

Lucide, 1.6 stroke (2.1 active in the dock), `currentColor`, 14–22px, inside 26px tinted tags on cards.

- Akhirat `landmark`; Dunia `activity` or `leaf`; Beranda tab `orbit`; Jurnal `notebook-pen`; Profil `user`.
- Journals: `book-open`, `leaf`, `hand-heart`, `pen-line`. States: `cloud-off`, `refresh-cw`, `check`.
- Near dua and hadith: no icons, or `book-open` at most. No sparkles, stars-with-faces, trophies, flames or emoji.
- No logo yet: the wordmark is "Falak" in Unbounded with فَلَك in Reem Kufi.

## Implementation notes

- The `Falak` bundle (`components/bundle.js`) provides `icons()`, `khatam()`, `glide()` (segmented and dock indicators), `countdown()`, `taskDemo()` and press ripples — reference behaviour for the React components.
- Glass requires `backdrop-filter`; `.fk-glass` falls back to `card` where unsupported.
- The border beam uses `@property --fk-angle`; browsers without it show the static `card-inverse-border`.
- Hadith text in previews is sample layout content; production strings come verbatim from the DB.
