const express = require("express");

const {
  getSettings,
  updateSettings,
  getPaymentInfo,
  updatePaymentInfo,
} = require(
  "../controllers/settingsController"
);

const {
  requireAuth,
  requireAdmin,
} = require(
  "../middleware/authMiddleware"
);

const router =
  express.Router();

/*
 * Public storefront settings.
 */
router.get(
  "/",
  getSettings
);

router.get(
  "/payment-info",
  requireAuth,
  requireAdmin,
  getPaymentInfo
);

/*
 * Protected settings management.
 */
router.put(
  "/",
  requireAuth,
  requireAdmin,
  updateSettings
);

router.put(
  "/payment-info",
  requireAuth,
  requireAdmin,
  updatePaymentInfo
);

module.exports = router;