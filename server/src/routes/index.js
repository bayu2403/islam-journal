const express = require("express");
const router = express.Router();

router.use("/duas", require("./duas"));
router.use("/profile", require("./profile"));
router.use("/templates", require("./templates"));
router.use("/todos", require("./todos"));
router.use("/prayer-times", require("./prayer-times"));
router.use("/notes", require("./notes"));
router.use("/activity", require("./activity"));

module.exports = router;
