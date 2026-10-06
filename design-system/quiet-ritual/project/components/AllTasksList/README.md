# AllTasksList

"Semua task hari ini": every task for the day, time-ordered, with a status chip and a check button so the user can mark a skipped or missed task as done later.

- `card` list with 1px `border` dividers, rows 12px × 16px: time (tabular, `muted-foreground`) · name + category · status chip + check.
- Status chips: **Selesai** on `secondary`; **Belum** and **Dilewati** share the same neutral `muted` chip — only the word differs. Never red, never strikethrough, never a warning icon.
- Check button: 28px circle, 1px `input` border; checked = `primary` fill with a white check. Tapping a checked row sets status back to `pending`.
- Late-checking is allowed for any past row; no "terlambat" labels.
