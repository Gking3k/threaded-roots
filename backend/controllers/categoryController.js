const categoryModel = require("../models/categoryModel");

async function getCategories(req, res) {
  try {
    const categories =
      await categoryModel.getCategories();

    res.json(categories);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load categories",
    });
  }
}

async function getCategory(req, res) {
  try {
    const category =
      await categoryModel.getCategoryById(
        req.params.id
      );

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json(category);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load category",
    });
  }
}

async function createCategory(
  req,
  res
) {
  try {
    const name =
      req.body.name?.trim();

    const description =
      req.body.description?.trim();

    if (!name) {
      return res.status(400).json({
        message:
          "Category name is required",
      });
    }

    const category =
      await categoryModel.createCategory(
        name,
        description
      );

    res.status(201).json(category);
  } catch (error) {
    console.error(error);

    if (
      error.code === "23505"
    ) {
      return res.status(409).json({
        message:
          "A category with that name already exists",
      });
    }

    res.status(500).json({
      message:
        "Failed to create category",
    });
  }
}

async function updateCategory(
  req,
  res
) {
  try {
    const name =
      req.body.name?.trim();

    const description =
      req.body.description?.trim();

    if (!name) {
      return res.status(400).json({
        message:
          "Category name is required",
      });
    }

    const category =
      await categoryModel.updateCategory(
        req.params.id,
        name,
        description
      );

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json(category);
  } catch (error) {
    console.error(error);

    if (
      error.code === "23505"
    ) {
      return res.status(409).json({
        message:
          "A category with that name already exists",
      });
    }

    res.status(500).json({
      message:
        "Failed to update category",
    });
  }
}

async function deleteCategory(
  req,
  res
) {
  try {
    const deleted =
      await categoryModel.deleteCategory(
        req.params.id
      );

    if (!deleted) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json({
      message:
        "Category deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to delete category",
    });
  }
}

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};