# TaskCard

The signature component: one card per category showing only the NEXT task, ordered by real prayer time. The whole card is a tap target that opens the [DalilDialog](../DalilDialog/README.md); its pills do not.

**Anatomy** (both variants, 20px padding, 8px internal gap, `radius-2xl`): eyebrow row (24px icon chip + uppercase `eyebrow` label, time on the right) → `h3` headline → one-line `body`-small summary → [TaskActions](../TaskActions/README.md) row (+ "Lihat dalil" link on Akhirat).

**Akhirat** — `card-inverse` surface, `card-inverse-foreground` headline, `card-inverse-muted` eyebrow, time and summary, `card-inverse-border` edge (a hairline only in dark palettes). The summary's hadith source sits in `reward` — the only place `reward` ever appears on screen. Time comes from the prayer schedule (Aladhan, KEMENAG method), shown as "Ashar · 15:21". Icon: `landmark`.

**Dunia** — `card` surface, 1px `border`, `muted-foreground` eyebrow and summary. Optional `scheduled_time`; omit the time slot entirely when there is none. Icon: `activity` (or `leaf`) — not `sparkles`.

Rules:
- Exactly one Akhirat card per screen; `card-inverse` is never used for anything else.
- Summary may clamp to two lines on the card; the full dalil is always available in the dialog, verbatim.
- No shadow, no left-border stripe, no gradient. Pressed feedback is a tint, not a scale.
- Empty category: see [States](../States/README.md) — calm copy, no confetti.
