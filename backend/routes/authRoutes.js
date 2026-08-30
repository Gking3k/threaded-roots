const express = require("express");

const {
  login,
  setupAdmin,
} = require(
  "../controllers/authController"
);

const {
  loginLimiter,
} = require(
  "../middleware/rateLimiters"
);

const router =
  express.Router();

router.post(
  "/login",
  loginLimiter,
  login
);

router.post(
  "/setup-admin",
  loginLimiter,
  setupAdmin
);

module.exports = router;