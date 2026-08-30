const pool = require("../config/db");

async function getInventory() {
  const result = await pool.query(`
    SELECT
      i.id,
      i.product_id,
      i.variant_id,
      i.quantity,
      i.low_stock_threshold,
      i.updated_at,

      p.name AS product_name,

      pv.variant_name,
      pv.variant_value

    FROM inventory i

    JOIN products p
      ON p.id = i.product_id

    LEFT JOIN product_variants pv
      ON pv.id = i.variant_id

    ORDER BY
      p.name ASC,
      i.id ASC
  `);

  return result.rows;
}

async function getProductInventory(
  productId
) {
  const result = await pool.query(
    `
      SELECT
        i.id,
        i.product_id,
        i.variant_id,
        i.quantity,
        i.low_stock_threshold,
        i.updated_at,

        pv.variant_name,
        pv.variant_value

      FROM inventory i

      LEFT JOIN product_variants pv
        ON pv.id = i.variant_id

      WHERE i.product_id = $1

      ORDER BY i.id ASC
    `,
    [productId]
  );

  return result.rows;
}

async function getInventoryById(id) {
  const result = await pool.query(
    `
      SELECT *
      FROM inventory
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
}

async function createInventory(
  productId,
  variantId,
  quantity,
  lowStockThreshold
) {
  const result = await pool.query(
    `
      INSERT INTO inventory (
        product_id,
        variant_id,
        quantity,
        low_stock_threshold
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [
      productId,
      variantId || null,
      quantity,
      lowStockThreshold ?? 5,
    ]
  );

  return result.rows[0];
}

async function updateInventory(
  id,
  quantity,
  lowStockThreshold
) {
  const result = await pool.query(
    `
      UPDATE inventory
      SET
        quantity = $1,
        low_stock_threshold =
          COALESCE($2, low_stock_threshold)
      WHERE id = $3
      RETURNING *
    `,
    [
      quantity,
      lowStockThreshold,
      id,
    ]
  );

  return result.rows[0];
}

module.exports = {
  getInventory,
  getProductInventory,
  getInventoryById,
  createInventory,
  updateInventory,
};