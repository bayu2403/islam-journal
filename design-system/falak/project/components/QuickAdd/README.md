# QuickAdd

The sheet the FAB opens for a Dunia todo, with the recurrence picker. Akhirat items come only from system templates.

- Fields: Judul (required), Waktu (optional `time`), Ulangi. Labels are mono HUD.
- Recurrence: segmented control with a gliding indicator (`ease-spring`); "Hari tertentu" shows seven 40px day orbs that pop to `primary` with a `glow` when pressed. Helper spells out the selection.
- Footer: glass Batal + primary Simpan, equal width.
- Empty title: `destructive` border + a 300ms nudge + "Judulnya diisi dulu, ya."
