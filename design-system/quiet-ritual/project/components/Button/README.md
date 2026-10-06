# Button

Four quiet variants for everything that is not a task decision. `primary` (solid `primary` fill, `primary-foreground` label) at most once per view — Simpan, Masuk, Upgrade akun. `secondary` on `secondary` for supporting actions, `outline` (1px `input` border) for neutral choices like Batal, `ghost` for toolbar and inline actions.

- Height 32px (`h-8`), 12px side padding, `radius-lg`, label style `label` at 13px/500. Large: 40px for full-width actions.
- Hover is a tint shift only (~14% toward `foreground`); pressed a little deeper. No scale, no shadow pop.
- Focus-visible: 2px solid `ring`, 2px offset. Disabled: 50% opacity, no pointer events.
- The quick-add FAB is the one button that floats: 48px `radius-full`, `primary` fill, `shadow-float`.
- Consumer provides: the label (verb first, sentence case: "Simpan rencana", not "OK"), an optional leading lucide icon, and an `aria-label` for icon-only buttons.
- Don't use a button for Dikerjakan / Lewati — those are [TaskActions](../TaskActions/README.md) pills.
