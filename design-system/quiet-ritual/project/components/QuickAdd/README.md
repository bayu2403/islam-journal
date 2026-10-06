# QuickAdd

The bottom sheet opened by the + FAB to add a Dunia todo, with the recurrence picker inside it. Akhirat items are never created here — they come from system templates.

- Fields: Judul (required), Waktu (optional `time` input), Ulangi.
- **Recurrence picker**: a full-width segmented control (Setiap hari / Hari tertentu); "Hari tertentu" reveals seven 36px day toggles (S S R K J S A), pressed = `primary` fill. A helper line spells out the selection ("Senin, Rabu, Jumat").
- Footer: outline "Batal" + primary "Simpan", both 40px.
- Validation: only an empty title errors — `aria-invalid`, `destructive` border and a one-line message ("Judulnya diisi dulu, ya.").
