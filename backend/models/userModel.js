const pool = require("../config/db");

async function findUserByEmail(
  email
) {
  const result = await pool.query(
    `
      SELECT *
      FROM users
      WHERE email = $1
    `,
    [email]
  );

  return result.rows[0];
}

async function findUserById(id) {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        role,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
}

async function getUsers() {
  const result = await pool.query(`
    SELECT
      id,
      name,
      email,
      role,
      created_at,
      updated_at
    FROM users
    ORDER BY created_at DESC
  `);

  return result.rows;
}

async function createUser(
  name,
  email,
  password,
  role = "staff"
) {
  const result = await pool.query(
    `
      INSERT INTO users (
        name,
        email,
        password,
        role
      )
      VALUES ($1, $2, $3, $4)
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
      password,
      role,
    ]
  );

  return result.rows[0];
}

module.exports = {
  findUserByEmail,
  findUserById,
  getUsers,
  createUser,
};