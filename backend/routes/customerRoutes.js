const express = require("express");

const {
  getCustomers,
  getCustomer,
} = require(
  "../controllers/customerController"
);

const {
  requireAuth,
  requireAdmin,
} = require(
  "../middleware/authMiddleware"
);

const router =
  express.Router();

router.get(
  "/",
  requireAuth,
  requireAdmin,
  getCustomers
);

router.get(
  "/:id",
  requireAuth,
  requireAdmin,
  getCustomer
);

module.exports = router;