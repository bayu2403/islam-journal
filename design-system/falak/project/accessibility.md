# Accessibility

WCAG 2 contrast for every text/ground and control/ground pair the components use, computed from the oklch values (translucent tokens composited over their ground). Every pair passes in all four palettes.

| Pair | Use | Ikhwan · Malam | Akhwat · Malam | Ikhwan · Siang | Akhwat · Siang | Min |
|---|---|---:|---:|---:|---:|---:|
| `foreground` on `background` | Body text on page | 17.30 | 17.31 | 16.82 | 16.25 | 4.5 |
| `foreground` on `card` | Body text on card | 15.76 | 15.87 | 18.04 | 17.52 | 4.5 |
| `muted-foreground` on `background` | Secondary text on page | 8.48 | 8.66 | 5.54 | 5.69 | 4.5 |
| `muted-foreground` on `card` | Secondary text on card | 7.73 | 7.94 | 5.94 | 6.13 | 4.5 |
| `muted-foreground` on `muted` | Text on status chip | 6.97 | 7.19 | 5.08 | 5.27 | 4.5 |
| `primary-foreground` on `primary` | Primary button label | 12.42 | 10.20 | 6.15 | 6.34 | 4.5 |
| `primary` on `card` | Links, active states on card | 11.81 | 9.95 | 6.32 | 6.53 | 4.5 |
| `primary` on `background` | Signal text on page | 12.97 | 10.85 | 5.90 | 6.06 | 4.5 |
| `secondary-foreground` on `secondary` | Text on secondary | 12.96 | 13.17 | 11.79 | 11.61 | 4.5 |
| `accent-foreground` on `accent` | Label on accent fill | 10.55 | 10.91 | 11.36 | 9.10 | 4.5 |
| `card-inverse-foreground` on `card-inverse` | Akhirat headline | 18.65 | 18.61 | 16.93 | 16.71 | 4.5 |
| `card-inverse-muted` on `card-inverse` | Akhirat summary, meta | 9.89 | 10.05 | 9.29 | 9.34 | 4.5 |
| `reward` on `card-inverse` | Hadith source on Akhirat card | 13.15 | 13.67 | 11.94 | 12.28 | 4.5 |
| `reward-ink` on `popover` | Citation in dalil sheet | 11.18 | 11.74 | 5.65 | 5.63 | 4.5 |
| `destructive` on `card` | Validation text | 7.20 | 7.30 | 6.00 | 6.00 | 4.5 |
| `ring` on `background` | Focus ring on page | 12.97 | 10.85 | 5.90 | 6.06 | 3 |
| `ring` on `card` | Focus ring on card | 11.81 | 9.95 | 6.32 | 6.53 | 3 |
| `input` on `card` | Control border on card | 3.25 | 3.45 | 3.46 | 3.57 | 3 |
| `input` on `background` | Control border on page | 3.57 | 3.76 | 3.23 | 3.31 | 3 |


## Glass and glow

- Text never sits on `glow` or `glow-2` as a fill. Measured at the aurora's brightest point (glow at 70% of its alpha over `background`): on glass, `foreground` ≥12.6:1 and `muted-foreground` ≥5.5:1; on bare ground, `foreground` ≥10.6:1 and `muted-foreground` ≥4.7:1 in every palette. Where `backdrop-filter` is unsupported, `.fk-glass` falls back to `card`.
- The holo card's beam and khatam sit behind or around text, never under it at more than 22% opacity.
- The greeting name's gradient runs `foreground` → `primary` only (≥5.9:1 at both stops); `accent` is kept out of text because it is 1.3:1 on the Siang grounds. Display size only, never on religious text.

## Motion

- `prefers-reduced-motion: reduce` stops the aurora, beam, khatam rotation, sun pulse, FAB halo, shimmer and blink, and sets every transition to 0ms. Cards still swap and sheets still open, instantly.
- No flashing: every loop is ≤1 cycle per 1.6s and low contrast.
- The countdown ticks visually; screen readers get the orbit's `aria-label` instead of per-second announcements.

## Beyond colour

- Arabic: `dir="rtl" lang="ar"`, Noto Naskh ≥20px, 2.0 leading; transliteration `lang="ar-Latn"`.
- Focus-visible: 2px solid `ring` + 6px `glow` halo; on the holo card the ring becomes `card-inverse-foreground`.
- Status always carries a word (Selesai, Berikutnya, Belum, Dilewati); check buttons carry `aria-label`s.
- Touch targets: pills 38px, checks 30px with 8px spacing, dock items a full third of the dock.
