const express = require("express");

const {
  markPaymentAsMade,
  confirmPayment,
} = require(
  "../controllers/paymentController"
);

const {
  requireAuth,
  requireAdmin,
} = require(
  "../middleware/authMiddleware"
);

const {
  paymentLimiter,
} = require(
  "../middleware/rateLimiters"
);

const router =
  express.Router();

router.post(
  "/:reference/mark-paid",
  markPaymentAsMade
);

router.post(
  "/:reference/mark-paid",
  paymentLimiter,
  markPaymentAsMade
);

router.patch(
  "/:reference/confirm",
  paymentLimiter,
  requireAuth,
  requireAdmin,
  confirmPayment
);

module.exports = router;