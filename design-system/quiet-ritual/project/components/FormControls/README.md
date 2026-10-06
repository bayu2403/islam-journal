# FormControls

Input, Textarea, Label, Badge, status Chip and helper/error text — the shadcn primitives restyled to the system.

- **Input**: 40px, `radius-lg`, 1px `input` border (≥3:1), `card` fill. Hover darkens the border; focus-visible = 2px `ring` outline + `ring` border; disabled 50%; invalid = `destructive` border + `mb-error` line.
- **Textarea**: same skin, min 88px, vertical resize.
- **Label**: `label` style, always visible above the field — never placeholder-as-label.
- **Badge** (`radius-sm`, 20px): `secondary` default, `primary` for Wajib, `outline`. **Chip** (`radius-full`, 22px): statuses. Dilewati and Belum share the neutral `muted` chip.
- Error copy is gentle and specific: "Judulnya diisi dulu, ya." Never "Error!" or "Invalid".
- Base UI, not Radix: compose with `render={<El/>}`, not `asChild`.
