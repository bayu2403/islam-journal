# Motion

Falak moves like the sky: slow ambient light, fast precise responses. Every duration and curve is a token.

| Moment | Duration | Easing |
| --- | --- | --- |
| Press, ripple start | `duration-instant` 120ms | `ease-spring` release |
| Hover lift, tab glide, chip swap | `duration-fast` 220ms | `ease-out-expo` / `ease-spring` |
| Card enter (rise 14px + de-blur 8px, 70ms stagger), sheet rise, check draw | `duration-base` 420ms | `ease-out-expo` |
| Card exit after Dikerjakan (up) / Lewati (side) | `duration-base` | `ease-in-quart` |
| Orbit arc draw, completion light sweep | `duration-slow` 900ms | `ease-out-expo` |
| Holo border beam revolution | `duration-beam` 6s | linear |
| Aurora drift, khatam rotation | `duration-ambient` 18s | ease-in-out / linear |

Rules: animate `transform`, `opacity`, `filter` only. Ambient motion lives in the background and the holo card, never on text. Hadith, dua and Arabic never animate beyond their entrance fade. `prefers-reduced-motion`: all ambient loops stop, transitions go to 0ms, content still swaps.
