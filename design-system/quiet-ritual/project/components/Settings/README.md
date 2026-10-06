# Settings

Theme switcher (Ikhwan / Akhwat × Terang / Gelap) and language switcher (ID / EN / MS) on Profil, as full-width segmented controls.

- Two independent segments for theme: gender sets `html[data-gender]`, mode toggles `.dark`. Persist to localStorage (`mb.gender`, `mb.mode`) and the profile.
- Language segment switches the next-intl locale via the locale-aware router; labels are the codes, with `lang` attributes on each option.
- Changing theme swaps tokens instantly — no transition on colour change (avoids a flash of mixed palettes).
