const express = require("express");

const {
  getStats,
} = require("../controllers/adminController");

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/stats",
  requireAuth,
  requireAdmin,
  getStats
);

module.exports = router;