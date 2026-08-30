const inventoryModel =
  require("../models/inventoryModel");

const pool = require("../config/db");

async function getInventory(req, res) {
  try {
    const inventory =
      await inventoryModel.getInventory();

    res.json(inventory);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load inventory",
    });
  }
}

async function getProductInventory(
  req,
  res
) {
  try {
    const inventory =
      await inventoryModel.getProductInventory(
        req.params.productId
      );

    res.json(inventory);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load product inventory",
    });
  }
}

async function createInventory(
  req,
  res
) {
  try {
    const productId =
      req.body.productId;

    const variantId =
      req.body.variantId || null;

    const quantity =
      Number(req.body.quantity);

    const lowStockThreshold =
      req.body.lowStockThreshold ===
      undefined
        ? 5
        : Number(
            req.body.lowStockThreshold
          );

    if (
      !productId ||
      !Number.isFinite(quantity) ||
      quantity < 0 ||
      !Number.isFinite(
        lowStockThreshold
      ) ||
      lowStockThreshold < 0
    ) {
      return res.status(400).json({
        message:
          "Valid product, quantity and low-stock threshold are required",
      });
    }

    const productResult =
      await pool.query(
        `
          SELECT id
          FROM products
          WHERE id = $1
        `,
        [productId]
      );

    if (
      productResult.rows.length === 0
    ) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (variantId) {
      const variantResult =
        await pool.query(
          `
            SELECT id
            FROM product_variants
            WHERE id = $1
              AND product_id = $2
          `,
          [
            variantId,
            productId,
          ]
        );

      if (
        variantResult.rows.length === 0
      ) {
        return res.status(400).json({
          message:
            "Variant does not belong to this product",
        });
      }
    }

    const inventory =
      await inventoryModel.createInventory(
        productId,
        variantId,
        quantity,
        lowStockThreshold
      );

    res.status(201).json(inventory);
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        message:
          "An inventory record already exists for this product and variant",
      });
    }

    res.status(500).json({
      message:
        "Failed to create inventory record",
    });
  }
}

async function updateInventory(
  req,
  res
) {
  try {
    const quantity =
      Number(req.body.quantity);

    const lowStockThreshold =
      req.body.lowStockThreshold ===
      undefined
        ? undefined
        : Number(
            req.body.lowStockThreshold
          );

    if (
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      return res.status(400).json({
        message:
          "Quantity must be zero or greater",
      });
    }

    if (
      lowStockThreshold !==
        undefined &&
      (
        !Number.isFinite(
          lowStockThreshold
        ) ||
        lowStockThreshold < 0
      )
    ) {
      return res.status(400).json({
        message:
          "Low-stock threshold must be zero or greater",
      });
    }

    const inventory =
      await inventoryModel.updateInventory(
        req.params.id,
        quantity,
        lowStockThreshold
      );

    if (!inventory) {
      return res.status(404).json({
        message:
          "Inventory record not found",
      });
    }

    res.json(inventory);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to update inventory",
    });
  }
}

module.exports = {
  getInventory,
  getProductInventory,
  createInventory,
  updateInventory,
};