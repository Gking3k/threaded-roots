const pool = require("../config/db");

async function getStats(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM products
          WHERE active = TRUE
        ) AS products,

        (
          SELECT COUNT(*)
          FROM customers
        ) AS customers,

        (
          SELECT COUNT(*)
          FROM orders
        ) AS orders,

        (
          SELECT COALESCE(
            SUM(total_amount),
            0
          )
          FROM orders
          WHERE payment_status = 'confirmed'
        ) AS revenue,

        (
          SELECT COUNT(*)
          FROM orders
          WHERE payment_status = 'pending_verification'
        ) AS pending_payments
    `);

    const stats = result.rows[0];

    res.json({
      products: Number(
        stats.products
      ),

      customers: Number(
        stats.customers
      ),

      orders: Number(
        stats.orders
      ),

      revenue: Number(
        stats.revenue
      ),

      pendingPayments: Number(
        stats.pending_payments
      ),
    });
  } catch (error) {
    console.error(
      "Admin stats error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load dashboard statistics",
    });
  }
}

module.exports = {
  getStats,
};