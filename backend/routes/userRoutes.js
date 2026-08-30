const express = require("express");

const {
  getCurrentUser,
  getUsers,
  createUser,
} = require(
  "../controllers/userController"
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
  "/me",
  requireAuth,
  getCurrentUser
);

router.get(
  "/",
  requireAuth,
  requireAdmin,
  getUsers
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  createUser
);

module.exports = router;