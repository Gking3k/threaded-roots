const pool =
  require("../config/db");

async function getPaymentByReference(
  reference
) {
  const result =
    await pool.query(
      `
        SELECT
          p.*,
          o.id AS order_id,
          o.customer_email,
          o.customer_name,
          o.payment_status
        FROM payments p
        JOIN orders o
          ON o.id = p.order_id
        WHERE p.reference = $1
      `,
      [reference]
    );

  return result.rows[0];
}

async function markCustomerPaid(
  reference,
  accessToken
) {
  const result =
    await pool.query(
      `
        UPDATE payments p
        SET
          status =
            CASE
              WHEN p.status = 'pending'
              THEN 'awaiting_confirmation'
              ELSE p.status
            END,

          customer_marked_paid_at =
            CASE
              WHEN p.status = 'pending'
              THEN CURRENT_TIMESTAMP
              ELSE p.customer_marked_paid_at
            END,

          updated_at =
            CURRENT_TIMESTAMP

        FROM orders o

        WHERE p.order_id = o.id
          AND p.reference = $1
          AND o.customer_access_token = $2

        RETURNING
          p.*,
          o.payment_status,
          o.id AS order_id
      `,
      [
        reference,
        accessToken,
      ]
    );

  return result.rows[0];
}

module.exports = {
  getPaymentByReference,
  markCustomerPaid,
};