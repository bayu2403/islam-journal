const express = require("express");
const { cache } = require("../lib/cache");
const { requireUser } = require("../middleware/supabase");

const router = express.Router();

const PRAYER_TTL_MS = 24 * 60 * 60 * 1000; // schedule is per-day; 1 API hit per city per day
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Fixed fallback when Aladhan is unreachable — typical Indonesia times.
const FALLBACK = { fajr: "04:30", dhuhr: "12:00", asr: "15:15", maghrib: "18:00", isha: "19:15" };

// Aladhan returns "HH:MM (WIB)" style strings — keep HH:MM only.
const clean = (s) => (typeof s === "string" ? s.slice(0, 5) : null);

// GET /api/prayer-times?date=YYYY-MM-DD
// City/country come from the caller's profile (defaults Jakarta/Indonesia).
router.get("/", requireUser, async (req, res, next) => {
  try {
    const date = DATE_RE.test(req.query.date ?? "") ? req.query.date : null;
    if (!date) {
      return res.status(422).json({ error: { message: "date (YYYY-MM-DD) required", code: "validation" } });
    }

    const { data: profile } = await req.supabase
      .from("profiles").select("city, country").eq("id", req.userId).single();
    const city = profile?.city?.trim() || "Jakarta";
    const country = profile?.country?.trim() || "Indonesia";

    const key = `prayer:${city.toLowerCase()}:${country.toLowerCase()}:${date}`;
    const times = await cache.wrap(key, PRAYER_TTL_MS, async () => {
      // Aladhan expects DD-MM-YYYY in the path. method=20 = KEMENAG (Indonesia).
      const [y, m, d] = date.split("-");
      const url =
        `https://api.aladhan.com/v1/timingsByCity/${d}-${m}-${y}` +
        `?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=20`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) throw new Error(`Aladhan ${resp.status}`);
      const json = await resp.json();
      const t = json?.data?.timings;
      const result = {
        fajr: clean(t?.Fajr),
        dhuhr: clean(t?.Dhuhr),
        asr: clean(t?.Asr),
        maghrib: clean(t?.Maghrib),
        isha: clean(t?.Isha),
      };
      if (Object.values(result).some((v) => !v)) throw new Error("Aladhan payload missing timings");
      return { ...result, source: "aladhan" };
    }).catch((err) => {
      console.error("[prayer-times] falling back to defaults:", err.message);
      return { ...FALLBACK, source: "fallback" };
    });

    res.json(times);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
