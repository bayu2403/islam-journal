const express = require("express");
const { requireUser } = require("../middleware/supabase");

const router = express.Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDay(req, res) {
  const { date, dow } = { ...req.query, ...req.body };
  const dowNum = Number(dow);
  if (!DATE_RE.test(date ?? "") || !(dowNum >= 0 && dowNum <= 6)) {
    res.status(422).json({ error: { message: "date (YYYY-MM-DD) and dow (0-6) required", code: "validation" } });
    return null;
  }
  return { date, dow: dowNum };
}

// GET /api/todos/today?date=2026-07-04&dow=6
router.get("/today", requireUser, async (req, res, next) => {
  try {
    const day = parseDay(req, res);
    if (!day) return;
    const { data: schedules, error } = await req.supabase
      .from("todo_schedules")
      .select(
        "id, custom_title, recurrence, once_date, weekly_days, source, category, scheduled_time, " +
        "template_items(title, summary, dalil, default_time, prayer_key)"
      )
      .eq("active", true)
      .or(
        `and(recurrence.eq.once,once_date.eq.${day.date}),` +
        `recurrence.eq.daily,` +
        `and(recurrence.eq.weekly,weekly_days.cs.{${day.dow}})`
      );
    if (error) throw error;

    const ids = schedules.map((s) => s.id);
    const statusById = new Map();
    if (ids.length > 0) {
      const { data: completions, error: cErr } = await req.supabase
        .from("todo_completions").select("schedule_id, status").eq("on_date", day.date).in("schedule_id", ids);
      if (cErr) throw cErr;
      for (const c of completions) statusById.set(c.schedule_id, c.status);
    }

    res.json(
      schedules.map((s) => ({
        schedule_id: s.id,
        title: s.custom_title ?? s.template_items?.title ?? "",
        is_system_title: s.custom_title == null, // i18n key → resolve client-side
        summary: s.template_items?.summary ?? null,
        dalil: s.template_items?.dalil ?? null,
        category: s.category,
        // Effective display time: explicit schedule time wins; template default
        // is the fallback. prayer_key items get their real time client-side
        // from /prayer-times for the day.
        time: s.scheduled_time ?? s.template_items?.default_time ?? null,
        prayer_key: s.template_items?.prayer_key ?? null,
        source: s.source,
        recurrence: s.recurrence,
        status: statusById.get(s.id) ?? null, // null = pending
      }))
    );
  } catch (err) {
    next(err);
  }
});

// POST /api/todos
// body: { custom_title? , template_item_id?, recurrence, once_date?, weekly_days?, source }
router.post("/", requireUser, async (req, res, next) => {
  try {
    const { custom_title, template_item_id, recurrence, once_date, weekly_days, source, category, scheduled_time } = req.body;
    if (!["once", "daily", "weekly"].includes(recurrence))
      return res.status(422).json({ error: { message: "recurrence must be once|daily|weekly", code: "validation" } });
    if (!custom_title === !template_item_id)
      return res.status(422).json({ error: { message: "exactly one of custom_title / template_item_id", code: "validation" } });
    if (recurrence === "once" && !DATE_RE.test(once_date ?? ""))
      return res.status(422).json({ error: { message: "once_date required for recurrence=once", code: "validation" } });
    if (recurrence === "weekly" && (!Array.isArray(weekly_days) || weekly_days.length === 0))
      return res.status(422).json({ error: { message: "weekly_days required for recurrence=weekly", code: "validation" } });

    const { data, error } = await req.supabase
      .from("todo_schedules")
      .insert({
        user_id: req.userId,
        custom_title: custom_title ?? null,
        template_item_id: template_item_id ?? null,
        recurrence,
        once_date: recurrence === "once" ? once_date : null,
        weekly_days: recurrence === "weekly" ? weekly_days : null,
        source: source === "quick_add" ? "quick_add" : "journal",
        category: category === "akhirat" ? "akhirat" : "dunia",
        scheduled_time: /^\d{2}:\d{2}(:\d{2})?$/.test(scheduled_time ?? "") ? scheduled_time : null,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/todos/:scheduleId/status  body: { date, dow, status: 'done'|'skipped'|'pending' }
// 'pending' clears the completion row (un-check from the all-tasks list).
router.post("/:scheduleId/status", requireUser, async (req, res, next) => {
  try {
    const day = parseDay(req, res);
    if (!day) return;
    const { status } = req.body;
    if (!["done", "skipped", "pending"].includes(status)) {
      return res.status(422).json({ error: { message: "status must be done|skipped|pending", code: "validation" } });
    }
    const scheduleId = req.params.scheduleId;

    if (status === "pending") {
      const { error } = await req.supabase
        .from("todo_completions").delete().eq("schedule_id", scheduleId).eq("on_date", day.date);
      if (error) throw error;
      return res.json({ status: null });
    }

    const { error } = await req.supabase
      .from("todo_completions")
      .upsert(
        {
          user_id: req.userId,
          schedule_id: scheduleId,
          on_date: day.date,
          status,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "schedule_id,on_date" },
      );
    if (error) throw error;
    res.json({ status });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/todos/:scheduleId (deactivate — history stays)
router.delete("/:scheduleId", requireUser, async (req, res, next) => {
  try {
    const { error, count } = await req.supabase
      .from("todo_schedules").update({ active: false }, { count: "exact" }).eq("id", req.params.scheduleId);
    if (error) throw error;
    if (count === 0) return res.status(404).json({ error: { message: "Not found", code: "not_found" } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
