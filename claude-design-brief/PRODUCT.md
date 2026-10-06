# Product

## Register

product

## Users

Indonesian Muslim individuals using "Muslim Berislam" as a personal spiritual and
productivity companion — solo use, phone-in-hand, multiple short check-ins per
day (subuh, mid-work, evening). Job to be done: keep up wajib/sunnah prayers,
dhikr, Quran reading, and personal todos without the app feeling like a chore
tracker or a game.

## Product Purpose

Help the user build steady worship + daily-life consistency. Beranda surfaces one
task at a time per category (Akhirat/Dunia) ordered by real prayer times; Jurnal
lets them plan tomorrow and browse hadith-grounded templates; Profil holds their
story-of-the-day and worship history. Success = the user opens the app briefly,
several times a day, and it never feels punitive when something is skipped.

## Brand Personality

Tenang, khusyuk, premium — calm, reverent, premium. Quiet-ritual voice, not
gamified-habit-app voice. Serif display type (Lora) for greetings/headings paired
with a humanist sans for body; deep emerald/gold (Ikhwan) and plum/champagne
(Akhwat) palettes carry the "premium" register instead of decoration. Hadith and
dua content is rendered verbatim and given visual weight/respect — never
truncated, never re-styled as decorative gradient text.

## Anti-references

- Generic SaaS-cream dashboards (near-white warm-tinted bg as a default) — the
  app already commits to a real palette per gender/mode, keep it that way.
- Gamified habit-tracker aesthetics (Duolingo-style streak badges, cartoon
  mascots, confetti, aggressive celebratory motion). "Lewati" (skip) is a neutral,
  non-punitive action — the UI must never scold or shame a skipped task.
- Overly cheerful iconography for religious content — icons/illustrations near
  duas/hadith should read as calm and respectful, not playful.

## Design Principles

1. **One task at a time, in real time.** Beranda never shows a wall of tasks —
   it shows the next thing, ordered by actual prayer times (Aladhan), not app-invented
   priority.
2. **Religious content is load-bearing, not decorative.** Hadith/dua text is
   always rendered verbatim, in full, on request (dalil dialog) — never
   truncated mid-sentence, never paraphrased for length.
3. **Skipping is neutral, not a failure state.** "Lewati" and the done/skipped
   status model exist so the user can move on without guilt; no streak-breaking
   language, no red/alarm styling on skipped items.
4. **Two calendars, always together.** Masehi and Hijriah dates appear together
   wherever a date is shown — neither is the "real" one relegated to a footnote.
5. **Premium through restraint, not ornament.** The calm/reverent/premium feel
   comes from serif type, deliberate color, and generous spacing — not gradients,
   glassmorphism, or decorative motion.

## Accessibility & Inclusion

WCAG AA contrast (4.5:1 body text, 3:1 large text) across all 4 gender×mode
palettes, including the dark "card-inverse" Akhirat card and the `--reward`
hadith-source highlight color. Arabic dua/hadith text must render with correct
RTL directionality (`dir="rtl" lang="ar"`) at a legible size. Standard touch
target sizing; no additional low-vision requirements identified beyond WCAG AA.
