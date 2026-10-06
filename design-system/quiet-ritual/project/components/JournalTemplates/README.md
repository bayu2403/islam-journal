# JournalTemplates

Two Jurnal blocks: the "Rencana esok hari" planner tiles and the horizontally scrolling "Journal harian" template cards.

- **Planner tiles**: two light `card` tiles side by side, Akhirat and Dunia, each with an eyebrow and the scheduled items. The Akhirat tile stays light — `card-inverse` belongs to the Beranda task card only. Only Dunia has "Tambah" (users cannot create custom Akhirat todos).
- **Template card**: 148px wide, `radius-xl`, 1px `border`, 32px icon chip on `secondary`, `title` + one-line `small` description. Scroll-snaps; the third card peeks to signal more.
- Template names are i18n keys (`SystemTemplates.*`); descriptions come from messages files in all three locales.
