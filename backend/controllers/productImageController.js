const pool =
  require("../config/db");

const productImageModel =
  require("../models/productImageModel");

const {
  uploadProductImage,
  deleteProductImage,
} = require(
  "../services/storageService"
);


const MAX_PRODUCT_IMAGES = 8;


async function ensureProductExists(
  productId
) {
  const result =
    await pool.query(
      `
        SELECT id
        FROM products
        WHERE id = $1
      `,
      [productId]
    );

  return result.rows.length > 0;
}


/*
 * GET /api/products/:productId/images
 */
async function getProductImages(
  req,
  res
) {
  try {
    const { productId } =
      req.params;

    const exists =
      await ensureProductExists(
        productId
      );

    if (!exists) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    const images =
      await productImageModel
        .getImagesByProductId(
          productId
        );

    res.json(images);
  } catch (error) {
    console.error(
      "Get product images error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load product images",
    });
  }
}


/*
 * POST /api/products/:productId/images
 *
 * Accepts multiple files using:
 *
 * FormData:
 * images = file
 */
async function uploadImages(
  req,
  res
) {
  const {
    productId,
  } = req.params;

  try {
    const exists =
      await ensureProductExists(
        productId
      );

    if (!exists) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    const files =
      req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        message:
          "At least one image is required",
      });
    }

    const existingCount =
      await productImageModel
        .countImages(
          productId
        );

    const remaining =
      MAX_PRODUCT_IMAGES -
      existingCount;

    if (remaining <= 0) {
      return res.status(400).json({
        message:
          `A product can have a maximum of ${MAX_PRODUCT_IMAGES} images.`,
      });
    }

    if (
      files.length >
      remaining
    ) {
      return res.status(400).json({
        message:
          `Only ${remaining} more image${
            remaining === 1
              ? ""
              : "s"
          } can be added.`,
      });
    }

    let nextSortOrder =
      await productImageModel
        .getNextSortOrder(
          productId
        );

    const uploadedPaths = [];

    const savedImages = [];

    try {
      for (
        const [
          index,
          file,
        ] of files.entries()
      ) {
        const uploaded =
          await uploadProductImage(
            productId,
            file
          );

        uploadedPaths.push(
          uploaded.path
        );

        const isPrimary =
          existingCount ===
            0 &&
          index === 0;

        const image =
          await productImageModel
            .createImage({
              productId,
              imageUrl:
                uploaded.publicUrl,
              storagePath:
                uploaded.path,
              isPrimary,
              sortOrder:
                nextSortOrder,
            });

        savedImages.push(
          image
        );

        nextSortOrder += 1;
      }
    } catch (error) {
      /*
       * If the database insert fails after
       * files have been uploaded, clean up
       * those Storage objects.
       */
      await Promise.all(
        uploadedPaths.map(
          (path) =>
            deleteProductImage(
              path
            ).catch(
              (cleanupError) =>
                console.error(
                  "Storage cleanup failed:",
                  cleanupError
                )
            )
        )
      );

      throw error;
    }

    const images =
      await productImageModel
        .getImagesByProductId(
          productId
        );

    res.status(201).json({
      message:
        "Product images uploaded successfully",

      images,

      uploaded:
        savedImages.length,
    });
  } catch (error) {
    console.error(
      "Upload product images error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to upload product images",
    });
  }
}


/*
 * PATCH /api/products/:productId/images/:imageId/primary
 */
async function setPrimaryImage(
  req,
  res
) {
  try {
    const {
      productId,
      imageId,
    } = req.params;

    const image =
      await productImageModel
        .setPrimaryImage(
          productId,
          imageId
        );

    res.json({
      message:
        "Primary image updated successfully",

      image,
    });
  } catch (error) {
    console.error(
      "Set primary image error:",
      error
    );

    res.status(404).json({
      message:
        error.message ||
        "Failed to set primary image",
    });
  }
}


/*
 * DELETE /api/products/:productId/images/:imageId
 */
async function removeImage(
  req,
  res
) {
  try {
    const {
      productId,
      imageId,
    } = req.params;

    const image =
      await productImageModel
        .getImageById(
          imageId
        );

    if (
      !image ||
      String(
        image.product_id
      ) !== String(productId)
    ) {
      return res.status(404).json({
        message:
          "Product image not found",
      });
    }

    /*
     * Remove the Storage object first.
     */
    await deleteProductImage(
      image.storage_path
    );

    await productImageModel
      .deleteImage(
        imageId
      );

    /*
     * If the deleted image was
     * primary, promote the next image.
     */
    if (image.is_primary) {
      await productImageModel
        .makeFirstImagePrimary(
          productId
        );
    }

    const images =
      await productImageModel
        .getImagesByProductId(
          productId
        );

    res.json({
      message:
        "Product image deleted successfully",

      images,
    });
  } catch (error) {
    console.error(
      "Delete product image error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to delete product image",
    });
  }
}


module.exports = {
  getProductImages,
  uploadImages,
  setPrimaryImage,
  removeImage,
};