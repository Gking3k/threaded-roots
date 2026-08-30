const pool = require("../config/db");

async function getProducts({
  categoryId,
  search,
  featured,
} = {}) {
  const values = [];
  const conditions = ["p.active = TRUE"];

  if (categoryId) {
    values.push(categoryId);
    conditions.push(
      `p.category_id = $${values.length}`
    );
  }

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(
        p.name ILIKE $${values.length}
        OR p.description ILIKE $${values.length}
        OR p.material ILIKE $${values.length}
        OR p.pattern ILIKE $${values.length}
        OR p.color ILIKE $${values.length}
      )`
    );
  }

  if (featured !== undefined) {
    values.push(featured);
    conditions.push(
      `p.featured = $${values.length}`
    );
  }

  const result = await pool.query(
    `
      SELECT
        p.id,
        p.category_id,
        p.name,
        p.description,
        p.price,
        p.unit,
        p.material,
        p.pattern,
        p.color,
        p.width,
        p.brand,
        p.featured,
        p.active,
        p.created_at,
        p.updated_at,

        c.name AS category,

        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', pi.id,
                'image_url', pi.image_url,
                'storage_path', pi.storage_path,
                'is_primary', pi.is_primary,
                'sort_order', pi.sort_order
              )
              ORDER BY pi.sort_order, pi.id
            )
            FROM product_images pi
            WHERE pi.product_id = p.id
          ),
          '[]'::jsonb
        ) AS images,

        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', pv.id,
                'variant_name', pv.variant_name,
                'variant_value', pv.variant_value
              )
              ORDER BY pv.id
            )
            FROM product_variants pv
            WHERE pv.product_id = p.id
          ),
          '[]'::jsonb
        ) AS variants,

        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', i.id,
                'variant_id', i.variant_id,
                'quantity', i.quantity,
                'low_stock_threshold',
                  i.low_stock_threshold
              )
              ORDER BY i.id
            )
            FROM inventory i
            WHERE i.product_id = p.id
          ),
          '[]'::jsonb
        ) AS inventory,

        COALESCE(
          (
            SELECT SUM(i.quantity)
            FROM inventory i
            WHERE i.product_id = p.id
          ),
          0
        ) AS total_stock

      FROM products p

      LEFT JOIN categories c
        ON c.id = p.category_id

      WHERE ${conditions.join(" AND ")}

      ORDER BY p.created_at DESC
    `,
    values
  );

  return result.rows;
}

async function getProductById(id) {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.category_id,
        p.name,
        p.description,
        p.price,
        p.unit,
        p.material,
        p.pattern,
        p.color,
        p.width,
        p.brand,
        p.featured,
        p.active,
        p.created_at,
        p.updated_at,

        c.name AS category,

        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', pi.id,
                'image_url', pi.image_url,
                'storage_path', pi.storage_path,
                'is_primary', pi.is_primary,
                'sort_order', pi.sort_order
              )
              ORDER BY pi.sort_order, pi.id
            )
            FROM product_images pi
            WHERE pi.product_id = p.id
          ),
          '[]'::jsonb
        ) AS images,

        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', pv.id,
                'variant_name', pv.variant_name,
                'variant_value', pv.variant_value
              )
              ORDER BY pv.id
            )
            FROM product_variants pv
            WHERE pv.product_id = p.id
          ),
          '[]'::jsonb
        ) AS variants,

        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', i.id,
                'variant_id', i.variant_id,
                'quantity', i.quantity,
                'low_stock_threshold',
                  i.low_stock_threshold
              )
              ORDER BY i.id
            )
            FROM inventory i
            WHERE i.product_id = p.id
          ),
          '[]'::jsonb
        ) AS inventory,

        COALESCE(
          (
            SELECT SUM(i.quantity)
            FROM inventory i
            WHERE i.product_id = p.id
          ),
          0
        ) AS total_stock

      FROM products p

      LEFT JOIN categories c
        ON c.id = p.category_id

      WHERE p.id = $1
    `,
    [id]
  );

  return result.rows[0];
}

async function createProduct(data) {
  const result = await pool.query(
    `
      INSERT INTO products (
        category_id,
        name,
        description,
        price,
        unit,
        material,
        pattern,
        color,
        width,
        brand,
        featured,
        active
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12
      )
      RETURNING *
    `,
    [
      data.categoryId || null,
      data.name,
      data.description || null,
      data.price,
      data.unit,
      data.material || null,
      data.pattern || null,
      data.color || null,
      data.width || null,
      data.brand || "Threaded Roots",
      data.featured ?? false,
      data.active ?? true,
    ]
  );

  return result.rows[0];
}

async function updateProduct(id, data) {
  const result = await pool.query(
    `
      UPDATE products
      SET
        category_id = $1,
        name = $2,
        description = $3,
        price = $4,
        unit = $5,
        material = $6,
        pattern = $7,
        color = $8,
        width = $9,
        brand = $10,
        featured = $11,
        active = $12
      WHERE id = $13
      RETURNING *
    `,
    [
      data.categoryId || null,
      data.name,
      data.description || null,
      data.price,
      data.unit,
      data.material || null,
      data.pattern || null,
      data.color || null,
      data.width || null,
      data.brand || "Threaded Roots",
      data.featured ?? false,
      data.active ?? true,
      id,
    ]
  );

  return result.rows[0];
}

async function deleteProduct(id) {
  const result = await pool.query(
    `
      DELETE FROM products
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );

  return result.rows[0];
}

/*
 * Product variants
 */

async function createVariant(
  productId,
  variantName,
  variantValue
) {
  const result = await pool.query(
    `
      INSERT INTO product_variants (
        product_id,
        variant_name,
        variant_value
      )
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [
      productId,
      variantName,
      variantValue,
    ]
  );

  return result.rows[0];
}

async function updateVariant(
  id,
  variantName,
  variantValue
) {
  const result = await pool.query(
    `
      UPDATE product_variants
      SET
        variant_name = $1,
        variant_value = $2
      WHERE id = $3
      RETURNING *
    `,
    [
      variantName,
      variantValue,
      id,
    ]
  );

  return result.rows[0];
}

async function deleteVariant(id) {
  const result = await pool.query(
    `
      DELETE FROM product_variants
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );

  return result.rows[0];
}

async function getVariantById(id) {
  const result = await pool.query(
    `
      SELECT *
      FROM product_variants
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  getVariantById,
};