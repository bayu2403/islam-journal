---
name: Muslim Berislam
description: A calm daily spiritual + productivity companion for Indonesian Muslims
colors:
  emerald-primary: "oklch(0.4 0.09 168)"
  warm-ivory-bg: "oklch(0.985 0.01 95)"
  ink-green-fg: "oklch(0.22 0.02 160)"
  soft-sage-secondary: "oklch(0.94 0.05 120)"
  fresh-lime-accent: "oklch(0.9 0.15 125)"
  deep-teal-slate-inverse: "oklch(0.28 0.04 180)"
  warm-amber-reward: "oklch(0.75 0.15 65)"
  hairline-border: "oklch(0.9 0.02 100)"
  muted-neutral: "oklch(0.95 0.02 100)"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(1.5rem, 4vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.05em"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1.125rem"
  3xl: "1.375rem"
spacing:
  card: "1rem"
  section: "1.5rem"
  page: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.emerald-primary}"
    textColor: "#fdfcf9"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
  button-primary-hover:
    backgroundColor: "{colors.emerald-primary}"
  button-pill-filled:
    backgroundColor: "{colors.fresh-lime-accent}"
    rounded: "9999px"
    padding: "0 1rem"
  button-pill-outline:
    textColor: "{colors.ink-green-fg}"
    rounded: "9999px"
    padding: "0 1rem"
  card-default:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink-green-fg}"
    rounded: "{rounded.xl}"
    padding: "1rem"
  card-inverse-akhirat:
    backgroundColor: "{colors.deep-teal-slate-inverse}"
    textColor: "#f7f4ec"
    rounded: "{rounded.2xl}"
    padding: "1.25rem"
---

# Design System: Muslim Berislam

## 1. Overview

**Creative North Star: "The Quiet Ritual"**

Muslim Berislam is built to feel like a calm daily ritual, not a dashboard and
not a habit-tracking game. Beranda shows exactly one task at a time, ordered by
real prayer times, so the interface never confronts the user with a wall of
obligations. Hadith and dua text carry real religious weight — they're rendered
in full, on request, never truncated or paraphrased for layout convenience.
Serif display type (Lora) for greetings and section headings paired with a
clean humanist sans (Geist) for body text gives the "premium" register through
restraint: deliberate deep-toned color and generous spacing, not gradients,
glassmorphism, or decorative motion.

The system explicitly rejects: generic SaaS-cream dashboards (a near-white
warm-tinted background used as a default with no real palette commitment),
gamified habit-tracker aesthetics (streak badges, cartoon mascots, confetti,
scolding copy on a missed task), and playful iconography near religious
content. "Lewati" (skip) is a neutral action, styled the same weight as
"dikerjakan" (done) — never red, never alarmed.

Two calendars — Masehi and Hijriah — appear together everywhere a date is
shown; neither is a footnote to the other.

**Key Characteristics:**
- One task at a time, ordered by real (Aladhan-sourced) prayer times, not app-invented priority
- Religious content (hadith/dua) rendered verbatim, in full, with visual weight
- Skipping is neutral — no punitive color, copy, or motion
- Serif headings (Lora) + sans body (Geist) as the sole type contrast axis
- Four palettes: Ikhwan/Akhwat × light/dark, sharing the same token structure

## 2. Colors

Warm, deep, and deliberate — a committed palette carrying real color rather than
tinted-neutral restraint, built around emerald (Ikhwan) or plum (Akhwat) as the
primary hue, with a dedicated dark "inverse" card reserved for Akhirat (afterlife)
task content and a warm amber/gold token reserved for hadith-source highlights.

### Primary
- **Deep Emerald** (`oklch(0.4 0.09 168)`): primary actions, active nav state,
  focus rings, "dikerjakan" filled button. The signature Ikhwan hue; the Akhwat
  palette swaps this for a deep plum (`oklch(0.45 0.12 350)`) at the same
  lightness/chroma shape — same role, different hue family.

### Secondary
- **Soft Sage** (`oklch(0.94 0.05 120)`): secondary surfaces, subtle section
  fills. Akhwat equivalent is a soft rose-tinted neutral (`oklch(0.95 0.03 10)`).
- **Fresh Lime** (`oklch(0.9 0.15 125)`): the accent — filled pill buttons
  ("dikerjakan"), the today-highlight circle in the Jurnal week strip, small
  status chips. Akhwat equivalent is a soft rose (`oklch(0.88 0.08 10)`).

### Tertiary
- **Warm Amber** (`--reward`, `oklch(0.75 0.15 65)`): reserved exclusively for
  the hadith-source fragment inside a task card's summary line ("… (HR.
  Tirmidzi no. 2910)"). Never used decoratively elsewhere. Akhwat equivalent is
  a champagne gold (`oklch(0.78 0.12 85)`).

### Neutral
- **Warm Ivory** (background, `oklch(0.985 0.01 95)`): page background.
- **Ink Green** (foreground, `oklch(0.22 0.02 160)`): body text.
- **Hairline Border** (`oklch(0.9 0.02 100)`): card and input borders, always
  1px, always hairline-weight.
- **Deep Teal-Slate** (`--card-inverse`, `oklch(0.28 0.04 180)`): the ONE dark
  surface in an otherwise light-mode page — reserved for the Akhirat task card
  so afterlife-category content reads as visually distinct and weightier than
  worldly (Dunia) tasks, which stay on the light card surface. Akhwat equivalent
  is a deep plum (`oklch(0.3 0.06 340)`).

### Named Rules
**The One Dark Card Rule.** In light mode, exactly one component type is ever
dark: the Akhirat task card. It is never used for chrome, never for a second
card on the same screen, never as a "featured" treatment for anything else. Its
darkness is the visual signal that a task carries religious weight.

**The Amber-Is-Sacred Rule.** `--reward` (amber / champagne-gold) touches
nothing but the hadith-source citation fragment. It does not become a generic
"gold accent" elsewhere in the UI.

## 3. Typography

**Display Font:** Lora (with Georgia, serif fallback)
**Body Font:** Geist Sans (with ui-sans-serif, system-ui fallback)
**Label/Mono Font:** Geist Mono (code/monospace contexts only; not used in UI copy)

**Character:** A classic serif for moments that deserve a slower read (greetings,
page titles, section headings) against a clean, quiet sans for everything
functional — body copy, buttons, form labels, list items. The contrast is
warmth-vs-utility, not two competing display voices.

### Hierarchy
- **Display** (Lora, 700, `clamp(1.5rem, 4vw, 1.875rem)`, 1.25 line-height):
  page titles ("Profil", "Journal") and the Beranda greeting ("Assalamu
  'alaikum, {name}").
- **Headline** (Lora, 700, 1.25rem): section headings within a page ("Rencana
  hari ini", "Aktivitasku").
- **Title** (Geist Sans, 600, 0.875rem–1rem): card titles, template names.
- **Body** (Geist Sans, 400, 0.875rem, 1.5 line-height): all functional copy —
  descriptions, list items, form values. Arabic dua/hadith text sits at a
  larger 1.25–1.5rem size with `dir="rtl" lang="ar"` and its own generous
  line-height (loose) since it's read aloud, not skimmed.
- **Label** (Geist Sans, 500, 0.75rem, 0.05em tracking): the tiny uppercase
  "AKHIRAT" / "DUNIA" category labels on task cards, form field labels.

### Named Rules
**The Serif-For-Moments Rule.** Lora appears only on greetings and section/page
titles — never on body copy, never on buttons, never on hadith text (which
needs to read as plain, quotable prose, not styled display type).

## 4. Elevation

Flat and tonal by default. Depth comes from color contrast (the Deep Teal-Slate
Akhirat card sitting darker than its light-card sibling) and hairline rings
(`ring-1 ring-foreground/10` on cards), not drop shadows. Shadows are reserved
for genuinely floating elements: the quick-add "+" button (`shadow-md`) and
modal dialogs (their overlay + a soft `shadow-lg` on the sheet itself).

### Shadow Vocabulary
- **Floating action** (`shadow-md`): the quick-add "+" button — the one element
  that's meant to read as physically lifted above the page.
- **Modal sheet** (`shadow-lg`): dialog/sheet content over its scrim.

### Named Rules
**The Flat-Unless-Floating Rule.** A shadow only appears on an element that is
genuinely layered above the page content (a button that floats, a dialog that
overlays). Cards, list rows, and inline chips never get a shadow — a hairline
ring or a color shift is the only depth cue they're allowed.

## 5. Components

Quiet and deliberate: hairline borders over drop shadows, generous corner radii
(xl/2xl, `0.875rem`–`1.125rem`), no loud hover states — hover is a small
background-tint shift, never a scale or shadow pop.

### Buttons
- **Shape:** `rounded-lg` (0.625rem) for standard buttons; fully `rounded-full`
  (pill) for the "dikerjakan" / "lewati" task-card actions specifically.
- **Primary** (`bg-primary text-primary-foreground`): solid Deep Emerald
  (or Deep Plum in Akhwat), `hover:bg-primary/80`. Height 2rem (`h-8`),
  horizontal padding `0.625rem`.
- **Outline:** hairline `border-border`, transparent background,
  `hover:bg-muted`.
- **Ghost:** no border, `hover:bg-muted`.
- **Task-card pills:** "dikerjakan" is a filled Fresh-Lime pill
  (`bg-accent text-accent-foreground`); "lewati" is an outline pill at reduced
  opacity (`border-current/30 opacity-80`) — same size, same weight, so
  skipping never reads as the "lesser" or "wrong" choice.

### Cards / Containers
- **Corner Style:** `rounded-xl` (0.875rem) standard cards; `rounded-2xl`
  (1.125rem) for the Akhirat/Dunia task cards and the accent "Rencana hari ini"
  panel; `rounded-3xl` for the outer date panel.
- **Background:** white/`--card` for standard and Dunia cards;
  `--card-inverse` (Deep Teal-Slate) exclusively for the Akhirat card.
- **Shadow Strategy:** none at rest — see Elevation.
- **Border:** `ring-1 ring-foreground/10` (hairline), not a `border` utility.
- **Internal Padding:** `1rem` standard cards, `1.25rem` task cards.

### Inputs / Fields
- **Style:** hairline `border-input`, `bg-background` (or `bg-input/30` in
  dark mode), `rounded-lg`.
- **Focus:** `focus-visible:border-ring focus-visible:ring-3 ring-ring/50` — a
  soft outer ring, no color-shifting border animation.
- **Error / Disabled:** disabled = `opacity-50` + no pointer events; error
  state uses `aria-invalid` with a destructive-tinted ring, reserved for actual
  validation failures (not used anywhere in the current flows, which favor
  inline empty-state messaging over red error text).

### Navigation
- **Bottom nav** (mobile-first, sticky): 3 tabs (Beranda / Jurnal / Profil),
  lucide icons + label, active tab in Deep Emerald with a heavier icon stroke
  (2.4 vs 1.8), inactive in muted-foreground. `bg-card/95` with backdrop-blur
  when scrolled content sits behind it.
- **Top bar:** thin (`h-12`), sticky, page title only — no back-chrome except
  the optional ghost back-arrow used on Jurnal's picker sub-views.

### Task Card (signature component)
The core recurring pattern: one card per category (Akhirat dark / Dunia
light), same internal layout — tiny uppercase category label with icon in
Warm Amber (Akhirat) or primary color (Dunia), bold title, a summary line that
splits the hadith-source fragment into the Warm Amber tertiary color, then the
"dikerjakan"/"lewati" pill pair. The whole card is a tap target that opens the
full-dalil dialog; the pills stop click propagation so tapping an action never
also opens the dialog.

## 6. Do's and Don'ts

### Do:
- **Do** keep the Akhirat card as the only dark surface on a light-mode
  screen (`--card-inverse`, `oklch(0.28 0.04 180)` in Ikhwan).
- **Do** render hadith/dua text verbatim and in full in the dalil dialog —
  never truncate mid-sentence, never paraphrase.
- **Do** give "dikerjakan" and "lewati" equal visual weight (same size, same
  pill shape) — skipping is a neutral action, not a failure.
- **Do** show Masehi and Hijriah dates together, every time a date appears.
- **Do** use hairline rings (`ring-1 ring-foreground/10`) for card depth, not
  drop shadows.

### Don't:
- **Don't** use a generic SaaS-cream background as a default choice — this
  project's warm-ivory background is a deliberate, named token
  (`oklch(0.985 0.01 95)`), not an unconsidered near-white.
- **Don't** add streak badges, cartoon mascots, confetti, or celebratory
  gamification motion anywhere near worship tracking.
- **Don't** style a skipped task in red, strikethrough-with-shame, or any
  visually "failed" treatment — skipped items in "Semua task hari ini" get the
  same neutral chip style as pending items, just a different label.
- **Don't** use `--reward` (Warm Amber / champagne-gold) as a general accent
  color — it is reserved for the hadith-source citation fragment only.
- **Don't** add a drop shadow to a card, list row, or chip that isn't
  genuinely floating above the page (see The Flat-Unless-Floating Rule).
- **Don't** use `border-left`/`border-right` colored stripes as an accent on
  any card or list item.
