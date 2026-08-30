const pool = require("../config/db");

async function getSettings() {
  const result = await pool.query(`
    SELECT *
    FROM store_settings
    WHERE id = 1
  `);

  return result.rows[0];
}

async function updateSettings(data) {
  const result = await pool.query(
    `
      UPDATE store_settings
      SET
        store_name = $1,
        tagline = $2,
        description = $3,
        email = $4,
        phone = $5,
        whatsapp = $6,
        address = $7,
        delivery_fee = $8,
        delivery_estimate = $9,
        pickup_location = $10,
        pickup_hours = $11
      WHERE id = 1
      RETURNING *
    `,
    [
      data.storeName,
      data.tagline || null,
      data.description || null,
      data.email || null,
      data.phone || null,
      data.whatsapp || null,
      data.address || null,
      data.deliveryFee,
      data.deliveryEstimate || null,
      data.pickupLocation || null,
      data.pickupHours || null,
    ]
  );

  return result.rows[0];
}

async function getPaymentInfo() {
  const result =
    await pool.query(`
      SELECT
        id,
        store_settings_id,
        bank_name,
        account_name,
        account_number,
        payment_instructions,
        updated_at
      FROM store_payment_info
      WHERE store_settings_id = 1
    `);

  return result.rows[0];
}

async function updatePaymentInfo(
  data
) {
  const result =
    await pool.query(
      `
        UPDATE store_payment_info
        SET
          bank_name = $1,
          account_name = $2,
          account_number = $3,
          payment_instructions = $4
        WHERE store_settings_id = 1
        RETURNING
          id,
          store_settings_id,
          bank_name,
          account_name,
          account_number,
          payment_instructions,
          updated_at
      `,
      [
        data.bankName,
        data.accountName,
        data.accountNumber,
        data.paymentInstructions ||
          null,
      ]
    );

  return result.rows[0];
}

module.exports = {
  getSettings,
  updateSettings,
  getPaymentInfo,
  updatePaymentInfo,
};