# Accessibility

WCAG 2 contrast ratios for every text/ground and control/ground pair the components use, computed from the oklch token values (alpha tokens composited over their ground). All pairs pass in all four palettes.

| Pair | Use | Ikhwan · Terang | Ikhwan · Gelap | Akhwat · Terang | Akhwat · Gelap | Min |
|---|---|---:|---:|---:|---:|---:|
| `foreground` on `background` | Body text on page | 16.50 | 16.74 | 15.87 | 16.54 | 4.5 |
| `foreground` on `card` | Body text on card | 17.21 | 14.10 | 16.62 | 13.95 | 4.5 |
| `muted-foreground` on `background` | Secondary text on page | 5.70 | 7.87 | 5.86 | 7.96 | 4.5 |
| `muted-foreground` on `card` | Secondary text on card | 5.95 | 6.63 | 6.13 | 6.71 | 4.5 |
| `muted-foreground` on `muted` | Text on status chip | 5.15 | 6.26 | 5.43 | 6.33 | 4.5 |
| `primary-foreground` on `primary` | Primary button label | 8.20 | 9.07 | 7.49 | 8.17 | 4.5 |
| `primary` on `card` | Links, active tab, selected day | 8.68 | 7.65 | 7.96 | 7.24 | 4.5 |
| `secondary-foreground` on `secondary` | Date panel text | 11.33 | 12.46 | 11.09 | 12.36 | 4.5 |
| `accent-foreground` on `accent` | Dikerjakan pill, today circle | 10.98 | 11.76 | 8.30 | 8.99 | 4.5 |
| `card-inverse-foreground` on `card-inverse` | Akhirat headline | 13.17 | 18.95 | 12.80 | 18.86 | 4.5 |
| `card-inverse-muted` on `card-inverse` | Akhirat summary, eyebrow, Lewati | 7.75 | 9.37 | 7.92 | 9.52 | 4.5 |
| `reward` on `card-inverse` | Hadith source on Akhirat card | 6.24 | 10.78 | 6.95 | 11.75 | 4.5 |
| `reward-ink` on `popover` | Citation in dalil dialog | 5.76 | 8.51 | 5.60 | 9.23 | 4.5 |
| `destructive` on `card` | Validation message | 6.48 | 6.22 | 6.48 | 6.18 | 4.5 |
| `ring` on `background` | Focus ring on page | 8.32 | 9.08 | 7.60 | 8.59 | 3 |
| `ring` on `card` | Focus ring on card | 8.68 | 7.65 | 7.96 | 7.24 | 3 |
| `input` on `card` | Input / outline / Lewati border | 3.34 | 3.54 | 3.42 | 3.72 | 3 |
| `input` on `background` | Same, on page ground | 3.21 | 4.20 | 3.26 | 4.42 | 3 |

## Changes from the starting values

- `input` darkened in every palette (e.g. Ikhwan light 0.9 → 0.64 L). The old hairline value measured 1.35:1 on white and failed the 3:1 control-border rule; `border` keeps the hairline for purely decorative edges.
- `card-inverse-muted` added so secondary text on the Akhirat card has a checked value instead of `opacity-70`/`opacity-90` over `card-inverse-foreground`.
- `reward-ink` added: the light-palette `reward` is 2.3:1 on white, so the dalil dialog's citation uses a darker amber of the same hue.
- `muted-foreground` in dark palettes lifted slightly (0.70 → 0.72, 0.71 → 0.73 L); Akhwat light deepened 0.52 → 0.50 L and `accent-foreground` 0.35 → 0.33 L for headroom (both already passed).
- `destructive` given a warm, palette-neutral value per mode (was inherited from the neutral shadcn base).

## Beyond colour

- Arabic: `dir="rtl" lang="ar"`, Amiri ≥20px, 2.0 leading. Transliteration marked `lang="ar-Latn"`.
- Focus-visible: 2px solid `ring`, 2px offset; on `card-inverse`, the outline uses `card-inverse-foreground`.
- Status never relies on colour: every chip carries its word (Selesai, Belum, Dilewati); check buttons carry `aria-label`s ("Tandai sudah dikerjakan").
- Dialogs trap focus, close on Escape, and return focus to the card that opened them.
- `prefers-reduced-motion`: all transitions and the skeleton breathe drop to 0ms.
