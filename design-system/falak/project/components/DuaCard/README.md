# DuaCard

The dua for the current time of day on a `glass` panel: Arabic, transliteration, meaning, source.

- HUD eyebrow names the time slot ("Doa · waktu siang"); ghost "Doa lain" refreshes `GET /api/duas/current`.
- Arabic `arabic-lg` (compact on Beranda: `arabic-md`), right-aligned, RTL.
- Transliteration italic `muted-foreground` with `lang="ar-Latn"`; meaning `small`/`body`.
- Source as a mono data line in `muted-foreground`. No `reward` here, no glow on the text, no animation on the Arabic.
