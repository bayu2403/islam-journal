# FormControls

Input, Textarea, Label, Badge and status Chip.

- Input 46px, `radius-md`, 1px `input` (≥3.2:1), `card` fill, `primary` caret. Focus: `ring` border + 1px ring + 6px `glow` halo, easing in on `ease-out-expo`. Invalid: `destructive` border and a 300ms nudge.
- Labels are mono HUD, uppercase, tracked, always visible above the field.
- Badge (`radius-sm`, mono): `primary` Wajib, `secondary` Sunnah, `outline`. Chip: see AllTasksList.
- Base UI, not Radix: compose with `render={<El/>}`.
