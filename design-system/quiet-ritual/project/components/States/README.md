# States

Empty, loading and error states — all calm.

- **Empty** ("all tasks done for now"): dashed `border` on `card`, a 40px `secondary` circle with a check, a grateful line and when the next task arrives. No confetti, no trophy, no streak count.
- **Loading**: skeleton blocks on `muted` shaped like the real card (eyebrow, headline, summary, two pills), a slow 1.6s opacity breathe that stops under reduced motion.
- **Error**: a `muted` note with a `cloud-off` icon, what happened in plain words, what the app is doing meanwhile (fallback prayer times), and an outline "Coba lagi". Never red for network or server errors; `destructive` is for validation only.
