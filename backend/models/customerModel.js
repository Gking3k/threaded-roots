const pool = require("../config/db");

async function getCustomers() {
  const result = await pool.query(`
    SELECT
      c.id,
      c.name,
      c.email,
      c.phone,
      c.created_at,
      c.updated_at,

      COUNT(o.id)::INTEGER AS order_count,

      COALESCE(
        SUM(
          CASE
            WHEN o.payment_status = 'confirmed'
            THEN o.total_amount
            ELSE 0
          END
        ),
        0
      ) AS total_spent

    FROM customers c

    LEFT JOIN orders o
      ON o.customer_id = c.id

    GROUP BY c.id

    ORDER BY c.created_at DESC
  `);

  return result.rows;
}

async function getCustomerById(id) {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        phone,
        created_at,
        updated_at
      FROM customers
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
}

module.exports = {
  getCustomers,
  getCustomerById,
};