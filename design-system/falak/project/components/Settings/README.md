# Settings

Theme (Ikhwan / Akhwat × Malam / Siang) and language (ID / EN / MS) as full-width segmented controls with gliding indicators.

- Malam (dark) is the default and listed first — Falak is dark-first. Gender sets `html[data-gender]`, mode toggles `.dark`; persist to localStorage (`mb.gender`, `mb.mode`) and the profile.
- On palette change, crossfade the page background for `duration-base`; don't transition every token.
