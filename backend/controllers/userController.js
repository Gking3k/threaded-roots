const bcrypt = require("bcrypt");

const userModel =
  require("../models/userModel");

async function getCurrentUser(
  req,
  res
) {
  try {
    const user =
      await userModel.findUserById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load user",
    });
  }
}

async function getUsers(
  req,
  res
) {
  try {
    const users =
      await userModel.getUsers();

    res.json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load users",
    });
  }
}

async function createUser(
  req,
  res
) {
  try {
    const name =
      req.body.name?.trim();

    const email =
      req.body.email
        ?.trim()
        .toLowerCase();

    const password =
      req.body.password;

    const role =
      req.body.role || "staff";

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters",
      });
    }

    if (
      !["admin", "staff"].includes(
        role
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid user role",
      });
    }

    const existing =
      await userModel.findUserByEmail(
        email
      );

    if (existing) {
      return res.status(409).json({
        message:
          "An account with this email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await userModel.createUser(
        name,
        email,
        hashedPassword,
        role
      );

    res.status(201).json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to create user",
    });
  }
}

module.exports = {
  getCurrentUser,
  getUsers,
  createUser,
};