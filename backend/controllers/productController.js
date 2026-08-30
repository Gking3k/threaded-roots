const productModel = require("../models/productModel");

function validateProduct(data) {
  const name = data.name?.trim();
  const price = Number(data.price);
  const unit = data.unit;

  if (!name) {
    return "Product name is required";
  }

  if (!Number.isFinite(price) || price < 0) {
    return "A valid product price is required";
  }

  if (
    !["yard", "meter", "piece"].includes(
      unit
    )
  ) {
    return "Unit must be yard, meter, or piece";
  }

  return null;
}

async function getProducts(req, res) {
  try {
    const featured =
      req.query.featured === undefined
        ? undefined
        : req.query.featured === "true";

    const products =
      await productModel.getProducts({
        categoryId:
          req.query.categoryId,
        search:
          req.query.search,
        featured,
      });

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load products",
    });
  }
}

async function getProduct(req, res) {
  try {
    const product =
      await productModel.getProductById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load product",
    });
  }
}

async function createProduct(req, res) {
  try {
    const error = validateProduct(
      req.body
    );

    if (error) {
      return res.status(400).json({
        message: error,
      });
    }

    const product =
      await productModel.createProduct({
        ...req.body,
        name: req.body.name.trim(),
        price: Number(req.body.price),
      });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create product",
    });
  }
}

async function updateProduct(req, res) {
  try {
    const error = validateProduct(
      req.body
    );

    if (error) {
      return res.status(400).json({
        message: error,
      });
    }

    const product =
      await productModel.updateProduct(
        req.params.id,
        {
          ...req.body,
          name: req.body.name.trim(),
          price: Number(req.body.price),
        }
      );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update product",
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const deleted =
      await productModel.deleteProduct(
        req.params.id
      );

    if (!deleted) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete product",
    });
  }
}

async function createVariant(req, res) {
  try {
    // Safely handle requests where a body wasn't parsed.
    const body = req.body || {};

    const variantName =
      body.variantName?.trim();

    const variantValue =
      body.variantValue?.trim();

    if (!variantName || !variantValue) {
      return res.status(400).json({
        message:
          "Variant name and value are required",
      });
    }

    const product =
      await productModel.getProductById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const variant =
      await productModel.createVariant(
        req.params.id,
        variantName,
        variantValue
      );

    res.status(201).json(variant);
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        message:
          "That variant already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create variant",
    });
  }
}

async function updateVariant(req, res) {
  try {
    const variantName =
      req.body.variantName?.trim();

    const variantValue =
      req.body.variantValue?.trim();

    if (!variantName || !variantValue) {
      return res.status(400).json({
        message:
          "Variant name and value are required",
      });
    }

    const variant =
      await productModel.updateVariant(
        req.params.variantId,
        variantName,
        variantValue
      );

    if (!variant) {
      return res.status(404).json({
        message: "Variant not found",
      });
    }

    res.json(variant);
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        message:
          "That variant already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update variant",
    });
  }
}

async function deleteVariant(req, res) {
  try {
    const deleted =
      await productModel.deleteVariant(
        req.params.variantId
      );

    if (!deleted) {
      return res.status(404).json({
        message: "Variant not found",
      });
    }

    res.json({
      message:
        "Variant deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete variant",
    });
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
};