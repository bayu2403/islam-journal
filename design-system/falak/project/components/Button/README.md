# Button

Four variants that move: `primary` (solid `primary`, a light sweep crosses it on hover and it lifts 1px into `shadow-glow`), `glass` (`glass` + `blur-glass`, for actions sitting on the atmosphere), `outline` (1px `input`), `ghost`.

- 40px tall (32px `sm`), `radius-md`, label 13px/550 Onest.
- Press: scale 0.96 in `duration-instant`, release on `ease-spring`; a ripple in `currentColor` spreads from the pointer (`Falak` bundle adds it automatically).
- Focus-visible: 2px solid `ring` + 6px `glow` halo. Disabled: 40% opacity, desaturated.
- **FAB**: 56px `primary` orb with `shadow-glow` and a breathing halo ring; rotates 90° on hover. One per screen, bottom-right above the dock.
- One `primary` per view. Labels are verbs: Simpan, Tambah, Coba lagi.
