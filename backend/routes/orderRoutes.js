const express = require("express");

const {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
  getCustomerOrder,
} = require(
  "../controllers/orderController"
);

const {
  requireAuth,
  requireAdmin,
} = require(
  "../middleware/authMiddleware"
);

const {
  orderLimiter,
} = require(
  "../middleware/rateLimiters"
);

const router =
  express.Router();

/* Customer creates an order. */
router.post(
  "/",
  orderLimiter,
  createOrder
);

router.get(
  "/reference/:reference",
  getCustomerOrder
);

/* Administrative order access. */
router.get(
  "/",
  requireAuth,
  requireAdmin,
  getOrders
);

router.get(
  "/:id",
  requireAuth,
  requireAdmin,
  getOrder
);

router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  updateOrderStatus
);

module.exports = router;