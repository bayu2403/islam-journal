# StoryCard

"Cerita hari ini" — a calm, paper-like journal field, one entry per day (upsert via `/api/notes/today`).

- `card` surface with 1px `border`; the whole card takes the `ring` border on focus-within.
- Textarea set in Lora 15px on 28px ruled lines (a 1px `border` rule every line) — the one place serif carries running text, because it is the user's own writing, not UI.
- Placeholder is an invitation: "Apa yang kamu syukuri hari ini?" Never a prompt that implies a missed day.
- Footer: "Tersimpan otomatis" and the dual date.
