const pool = require("../config/db");


async function getImagesByProductId(
  productId
) {
  const result = await pool.query(
    `
      SELECT
        id,
        product_id,
        image_url,
        storage_path,
        is_primary,
        sort_order,
        created_at
      FROM product_images
      WHERE product_id = $1
      ORDER BY
        sort_order ASC,
        id ASC
    `,
    [productId]
  );

  return result.rows;
}


async function getImageById(
  imageId
) {
  const result = await pool.query(
    `
      SELECT
        id,
        product_id,
        image_url,
        storage_path,
        is_primary,
        sort_order,
        created_at
      FROM product_images
      WHERE id = $1
    `,
    [imageId]
  );

  return result.rows[0];
}


async function countImages(
  productId
) {
  const result = await pool.query(
    `
      SELECT COUNT(*)::int AS count
      FROM product_images
      WHERE product_id = $1
    `,
    [productId]
  );

  return result.rows[0].count;
}


async function getNextSortOrder(
  productId
) {
  const result = await pool.query(
    `
      SELECT COALESCE(
        MAX(sort_order),
        -1
      ) + 1 AS next_sort_order
      FROM product_images
      WHERE product_id = $1
    `,
    [productId]
  );

  return result.rows[0]
    .next_sort_order;
}


async function createImage({
  productId,
  imageUrl,
  storagePath,
  isPrimary,
  sortOrder,
}) {
  const result = await pool.query(
    `
      INSERT INTO product_images (
        product_id,
        image_url,
        storage_path,
        is_primary,
        sort_order
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      RETURNING *
    `,
    [
      productId,
      imageUrl,
      storagePath,
      isPrimary,
      sortOrder,
    ]
  );

  return result.rows[0];
}


async function setPrimaryImage(
  productId,
  imageId
) {
  const client =
    await pool.connect();

  try {
    await client.query(
      "BEGIN"
    );

    const imageResult =
      await client.query(
        `
          SELECT id
          FROM product_images
          WHERE id = $1
            AND product_id = $2
        `,
        [
          imageId,
          productId,
        ]
      );

    if (
      imageResult.rows.length ===
      0
    ) {
      throw new Error(
        "Product image not found"
      );
    }

    await client.query(
      `
        UPDATE product_images
        SET
          is_primary = FALSE
        WHERE product_id = $1
      `,
      [productId]
    );

    const result =
      await client.query(
        `
          UPDATE product_images
          SET
            is_primary = TRUE
          WHERE id = $1
            AND product_id = $2
          RETURNING *
        `,
        [
          imageId,
          productId,
        ]
      );

    await client.query(
      "COMMIT"
    );

    return result.rows[0];
  } catch (error) {
    await client.query(
      "ROLLBACK"
    );

    throw error;
  } finally {
    client.release();
  }
}


async function deleteImage(
  imageId
) {
  const result = await pool.query(
    `
      DELETE FROM product_images
      WHERE id = $1
      RETURNING *
    `,
    [imageId]
  );

  return result.rows[0];
}


async function makeFirstImagePrimary(
  productId
) {
  const result = await pool.query(
    `
      UPDATE product_images
      SET
        is_primary = TRUE
      WHERE id = (
        SELECT id
        FROM product_images
        WHERE product_id = $1
        ORDER BY
          sort_order ASC,
          id ASC
        LIMIT 1
      )
      RETURNING *
    `,
    [productId]
  );

  return result.rows[0];
}


module.exports = {
  getImagesByProductId,
  getImageById,
  countImages,
  getNextSortOrder,
  createImage,
  setPrimaryImage,
  deleteImage,
  makeFirstImagePrimary,
};