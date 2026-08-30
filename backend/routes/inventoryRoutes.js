const express = require("express");

const {
  getInventory,
  getProductInventory,
  createInventory,
  updateInventory,
} = require("../controllers/inventoryController");

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  requireAuth,
  requireAdmin,
  getInventory
);

router.get(
  "/product/:productId",
  requireAuth,
  requireAdmin,
  getProductInventory
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  createInventory
);

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  updateInventory
);

module.exports = router;