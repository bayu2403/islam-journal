const express = require("express");
const { requireUser } = require("../middleware/supabase");

const router = express.Router();

// GET /api/activity?limit=20 — latest completions for "Riwayat ibadahku"
router.get("/", requireUser, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const { data, error } = await req.supabase
      .from("todo_completions")
      .select("completed_at, on_date, status, todo_schedules(custom_title, template_items(title))")
      .order("completed_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json(
      data.map((row) => ({
        completed_at: row.completed_at,
        on_date: row.on_date,
        status: row.status,
        title: row.todo_schedules?.custom_title ?? row.todo_schedules?.template_items?.title ?? "",
        is_system_title: row.todo_schedules?.custom_title == null,
      })),
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
