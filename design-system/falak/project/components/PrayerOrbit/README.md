# PrayerOrbit

The Beranda hero: the day as the sun's arc. Five prayer nodes sit on a 180° orbit spaced by their real times (Aladhan, KEMENAG method); the sun marks now; a countdown names the next prayer. Masehi and Hijriah sit at equal weight across the top.

- Panel: `glass`, `radius-xl`, 18px padding.
- Track: dashed 1px `input`. Progress arc: 2.5px `primary` with a `glow` drop-shadow, drawn from 0 on load (`duration-slow`, `ease-out-expo`).
- Nodes: past = filled `primary`; next = `accent` ring (6px); future = hollow `input`. Labels in HUD mono.
- Sun: `primary` dot with a `glow` bloom pulsing every 2.4s.
- Countdown: `countdown` style (JetBrains Mono 40px, tabular), ticks each second; label "Menuju Ashar · 15:21".
- Dates: HUD labels "Masehi" / "Hijriah", values in Unbounded 15px. Hijri from `Intl` `islamic-umalqura`.
- The `svg` carries an `aria-label` with the current time and position; the countdown has `aria-live="off"` (screen readers get the label, not every tick).
