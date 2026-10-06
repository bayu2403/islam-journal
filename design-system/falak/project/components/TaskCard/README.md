# TaskCard

The signature: one card per category showing only the NEXT task (ordered by real prayer times). Live preview — tap Dikerjakan or Lewati to watch the queue advance.

**Akhirat — holo card.** `card-inverse` surface (the deepest surface in every palette), 1px `card-inverse-border`, and a conic **border beam** (`primary` → `accent`) revolving once per `duration-beam`. A `glow` bloom sits in the top-right corner behind a slowly rotating khatam (8-point star) in `primary` at 22%. Text: `card-inverse-foreground` headline, `card-inverse-muted` HUD and summary. The hadith source is set in JetBrains Mono in `reward` — the only place `reward` appears.

**Dunia — glass card.** `glass` + `blur-glass`, 1px `border`, `accent`-tinted icon tag, no beam.

**Anatomy** (both, 20px padding, `radius-xl`): HUD row (26px tag + uppercase category, time right) → `h3` headline → `small` summary → pill row.

**Motion**: enters with rise + de-blur (`fk-enter`, 70ms stagger); hover lifts 2px (holo adds `shadow-glow`); Dikerjakan exits up, Lewati exits sideways, both `duration-base` on `ease-in-quart`; next card enters. Reduced motion: beam, khatam and transitions stop; content swaps instantly.

Rules: one holo card per screen; tap card → DalilSheet; the summary may clamp to 2 lines, the dalil never does.
