const bcrypt = require("bcrypt");

const pool =
  require("../config/db");

const userModel =
  require("../models/userModel");

const generateToken =
  require("../utils/generateToken");

async function login(req, res) {
  try {
    const email =
      req.body.email
        ?.trim()
        .toLowerCase();

    const password =
      req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const user =
      await userModel.findUserByEmail(
        email
      );

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    if (
      !["admin", "staff"].includes(
        user.role
      )
    ) {
      return res.status(403).json({
        message:
          "Administrator access required",
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at:
        user.created_at,
    };

    const token =
      generateToken(safeUser);

    res.json({
      message:
        "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to log in",
    });
  }
}

async function setupAdmin(
  req,
  res
) {
  const client =
    await pool.connect();

  try {
    await client.query(
      "BEGIN"
    );

    await client.query(
      "SELECT pg_advisory_xact_lock(918273645)"
    );

    const name =
      req.body.name?.trim();

    const email =
      req.body.email
        ?.trim()
        .toLowerCase();

    const password =
      req.body.password;

    if (
      !name ||
      !email ||
      !password
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    if (
      password.length < 8
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(400).json({
        message:
          "Password must be at least 8 characters",
      });
    }

    const adminResult =
      await client.query(`
        SELECT id
        FROM users
        WHERE role = 'admin'
        LIMIT 1
      `);

    if (
      adminResult.rows.length >
      0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(403).json({
        message:
          "Administrator setup has already been completed.",
      });
    }

    const existingUser =
      await client.query(
        `
          SELECT id
          FROM users
          WHERE email = $1
        `,
        [email]
      );

    if (
      existingUser.rows.length >
      0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const result =
      await client.query(
        `
          INSERT INTO users (
            name,
            email,
            password,
            role
          )
          VALUES (
            $1,
            $2,
            $3,
            'admin'
          )
          RETURNING
            id,
            name,
            email,
            role,
            created_at
        `,
        [
          name,
          email,
          hashedPassword,
        ]
      );

    await client.query(
      "COMMIT"
    );

    res.status(201).json({
      message:
        "Administrator account created successfully.",
      user:
        result.rows[0],
    });
  } catch (error) {
    await client.query(
      "ROLLBACK"
    );

    console.error(
      "Administrator setup error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create administrator account.",
    });
  } finally {
    client.release();
  }
}

module.exports = {
  login,
  setupAdmin,
};