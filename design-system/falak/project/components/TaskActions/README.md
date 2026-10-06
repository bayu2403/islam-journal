# TaskActions

The Dikerjakan / Lewati pill pair: two equally valid answers with identical size (38px, 18px padding, `radius-full`, 13px/550) and identical motion weight.

- **Dikerjakan**: `accent` fill, `accent-foreground` label. On tap the check path draws itself (`duration-base`) and a light sweep crosses the pill (`duration-slow`), then the card exits upward.
- **Lewati dulu**: 1px `input` border (`card-inverse-muted` on the holo card). On tap the card exits sideways — same duration, same easing. No red, no shake, no "gagal".
- Both lift 1px on hover and ripple on press. Pills stop propagation so the card's dalil sheet doesn't open.
- Never add counters, streak flames, confetti or sounds to completion. The sweep is the whole celebration.
