# TaskActions

The Dikerjakan / Lewati pill pair — the only decision on a task card, and two equally valid answers. Both pills are 32px tall, 16px side padding, `radius-full`, label 12px/500: identical size and weight, so skipping never reads as the lesser choice.

- **Dikerjakan**: `accent` fill, `accent-foreground` label, a leading check icon. Posts status `done`.
- **Lewati dulu**: 1px `input` border on light cards; on the Akhirat card the border becomes `card-inverse-muted` and the label `card-inverse-foreground`. Posts status `skipped`.
- Neither pill ever turns red, strikes through, shakes or celebrates. After a tap the card swaps to the next task with a 200ms fade (`duration-base`); nothing else moves.
- Pills stop click propagation: tapping one never also opens the dalil dialog.
- Copy: "Lewati dulu" (skip for now) — never "Gagal", "Batal", "Skip".
