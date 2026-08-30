const express = require("express");

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require(
  "../controllers/categoryController"
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
  getCategories
);

router.get(
  "/:id",
  getCategory
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  createCategory
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  updateCategory
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteCategory
);

module.exports = router;