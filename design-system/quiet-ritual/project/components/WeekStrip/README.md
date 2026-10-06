# WeekStrip

Seven days, Senin to Ahad, each showing its Masehi number in a 40px circle and its Hijriah day beneath in `caption`.

- **Today**: `accent` circle, `accent-foreground` numeral, `aria-current="date"`.
- **Selected** (the day being planned — usually tomorrow for "Rencana esok hari"): 2px `primary` ring inside the circle and a `primary` day name. Today and selected can coincide.
- Hover: `muted` fill. Focus: 2px `ring` outline.
- Days are `role="tab"` buttons in a `tablist`; swipe or arrow keys move a week.
- Month header lists both calendars when the week spans two hijri months ("Juli · Muharram–Safar").
