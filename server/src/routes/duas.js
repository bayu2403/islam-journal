const express = require("express");
const { cache } = require("../lib/cache");
const { withAdmin } = require("../middleware/supabase");

const router = express.Router();
const DUAS_TTL_MS = 60 * 60 * 1000; // 1h; seed data changes ~never

const CATEGORIES = ["morning", "afternoon", "evening", "night", "any"];

// GET /api/duas/current?category=morning
// Returns one random dua for the category (falls back to 'any').
router.get("/current", withAdmin, async (req, res, next) => {
  try {
    const category = CATEGORIES.includes(req.query.category) ? req.query.category : "any";
    const all = await cache.wrap("duas:all", DUAS_TTL_MS, async () => {
      const { data, error } = await req.supabaseAdmin.from("duas").select("*");
      if (error) throw error;
      return data;
    });
    let pool = all.filter((d) => d.time_category === category);
    if (pool.length === 0) pool = all.filter((d) => d.time_category === "any");
    if (pool.length === 0) pool = all;
    const dua = pool[Math.floor(Math.random() * pool.length)];
    res.set("Cache-Control", "no-store"); // random per request
    res.json(dua);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
