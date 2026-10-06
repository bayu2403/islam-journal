const express = require("express");
const { requireUser } = require("../middleware/supabase");

const router = express.Router();

router.get("/", requireUser, async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from("profiles").select("*").eq("id", req.userId).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

const EDITABLE = ["display_name", "photo_url", "gender", "theme_mode", "locale", "city", "country", "prayer_windows"];

router.patch("/", requireUser, async (req, res, next) => {
  try {
    const patch = {};
    for (const key of EDITABLE) if (key in req.body) patch[key] = req.body[key];
    if (Object.keys(patch).length === 0) {
      return res.status(422).json({ error: { message: "No editable fields in body", code: "validation" } });
    }
    patch.updated_at = new Date().toISOString();
    const { data, error } = await req.supabase
      .from("profiles").update(patch).eq("id", req.userId).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
