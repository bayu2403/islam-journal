const express = require("express");
const { cache } = require("../lib/cache");
const { requireUser } = require("../middleware/supabase");

const router = express.Router();
const SYSTEM_TTL_MS = 60 * 60 * 1000;

// GET /api/templates → { system: [...], mine: [...] } each with nested items
router.get("/", requireUser, async (req, res, next) => {
  try {
    const system = await cache.wrap("templates:system", SYSTEM_TTL_MS, async () => {
      const { data, error } = await req.supabaseAdmin
        .from("templates")
        .select("id, kind, name, is_system, category, summary, dalil, template_items(id, title, sort_order, summary, dalil, default_time, prayer_key)")
        .is("owner_id", null)
        .order("sort_order", { referencedTable: "template_items" });
      if (error) throw error;
      return data;
    });
    const { data: mine, error } = await req.supabase
      .from("templates")
      .select("id, kind, name, is_system, category, summary, dalil, template_items(id, title, sort_order, summary, dalil, default_time, prayer_key)")
      .eq("owner_id", req.userId)
      .order("created_at");
    if (error) throw error;
    res.json({ system, mine });
  } catch (err) {
    next(err);
  }
});

// POST /api/templates  body: { name, kind: 'group'|'single', items: ["title", ...] }
router.post("/", requireUser, async (req, res, next) => {
  try {
    const { name, kind, items } = req.body;
    if (!name || !["group", "single"].includes(kind) || !Array.isArray(items) || items.length === 0) {
      return res.status(422).json({ error: { message: "name, kind, non-empty items required", code: "validation" } });
    }
    const { data: template, error } = await req.supabase
      .from("templates").insert({ owner_id: req.userId, name, kind }).select().single();
    if (error) throw error;
    const rows = items.map((title, i) => ({ template_id: template.id, title, sort_order: i }));
    const { data: createdItems, error: itemsError } = await req.supabase
      .from("template_items").insert(rows).select();
    if (itemsError) throw itemsError;
    res.status(201).json({ ...template, template_items: createdItems });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/templates/:id — RLS blocks system/foreign templates
router.delete("/:id", requireUser, async (req, res, next) => {
  try {
    const { error, count } = await req.supabase
      .from("templates").delete({ count: "exact" }).eq("id", req.params.id);
    if (error) throw error;
    if (count === 0) return res.status(404).json({ error: { message: "Not found or not yours", code: "not_found" } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
