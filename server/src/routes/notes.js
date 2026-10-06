const express = require("express");
const { requireUser } = require("../middleware/supabase");

const router = express.Router();
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/notes/today?date=YYYY-MM-DD → { body } ('' when no note yet)
router.get("/today", requireUser, async (req, res, next) => {
  try {
    const date = DATE_RE.test(req.query.date ?? "") ? req.query.date : null;
    if (!date) return res.status(422).json({ error: { message: "date (YYYY-MM-DD) required", code: "validation" } });
    const { data, error } = await req.supabase
      .from("daily_notes").select("body").eq("on_date", date).maybeSingle();
    if (error) throw error;
    res.json({ body: data?.body ?? "" });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/today  body: { date, body }
router.put("/today", requireUser, async (req, res, next) => {
  try {
    const { date, body } = req.body;
    if (!DATE_RE.test(date ?? "") || typeof body !== "string") {
      return res.status(422).json({ error: { message: "date (YYYY-MM-DD) and body (string) required", code: "validation" } });
    }
    const { error } = await req.supabase
      .from("daily_notes")
      .upsert(
        { user_id: req.userId, on_date: date, body, updated_at: new Date().toISOString() },
        { onConflict: "user_id,on_date" },
      );
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
