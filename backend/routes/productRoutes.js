const express = require("express");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} = require("../controllers/productController");

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * Public product endpoints.
 */
router.get("/", getProducts);

router.get(
  "/:id",
  getProduct
);

/*
 * Protected product management.
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  createProduct
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  updateProduct
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteProduct
);

/*
 * Variant management.
 */
router.post(
  "/:id/variants",
  requireAuth,
  requireAdmin,
  createVariant
);

router.put(
  "/variants/:variantId",
  requireAuth,
  requireAdmin,
  updateVariant
);

router.delete(
  "/variants/:variantId",
  requireAuth,
  requireAdmin,
  deleteVariant
);

module.exports = router;