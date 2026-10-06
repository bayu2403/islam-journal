# DuaCard

The dua recommendation for the current time of day: Arabic, transliteration, meaning and source, all verbatim.

- `card` surface, 1px `border`, `radius-xl`, 16px padding.
- Eyebrow "Rekomendasi doa hari ini" in `muted-foreground`.
- Arabic: `arabic-lg` (full view) or `arabic-md` (Beranda compact), `dir="rtl" lang="ar"`, right-aligned.
- Transliteration: `small`, italic, `muted-foreground`, `lang="ar-Latn"`. Meaning: `body`.
- Source (Qur'an or hadith reference) in `muted-foreground` at the foot. `reward` is NOT used here — it belongs to the Akhirat card's hadith fragment only.
- "Doa lain" ghost button refreshes `GET /api/duas/current`.
