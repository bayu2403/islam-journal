const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
const indexRouter = require("./routes/index");
app.use("/api", indexRouter);

// Central error handler — consistent {error:{message,code}} shape
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || (err.code === "PGRST116" ? 404 : 500);
  res.status(status).json({
    error: { message: err.message || "Internal server error", code: err.code || "internal" },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
