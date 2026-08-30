const express = require("express");

const multer =
  require("multer");

const {
  getProductImages,
  uploadImages,
  setPrimaryImage,
  removeImage,
} = require(
  "../controllers/productImageController"
);

const {
  requireAuth,
  requireAdmin,
} = require(
  "../middleware/authMiddleware"
);

const router =
  express.Router();


/*
 * Store uploads in memory temporarily.
 * They are sent directly to Supabase Storage.
 */
const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        5 * 1024 * 1024,

      files: 8,
    },

    fileFilter: (
      req,
      file,
      callback
    ) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      if (
        !allowedTypes.includes(
          file.mimetype
        )
      ) {
        return callback(
          new Error(
            "Only JPEG, PNG, WebP and GIF images are allowed."
          )
        );
      }

      callback(
        null,
        true
      );
    },
  });


/*
 * Public storefront image access.
 */
router.get(
  "/:productId/images",
  getProductImages
);


/*
 * Admin-only image management.
 */
router.post(
  "/:productId/images",
  requireAuth,
  requireAdmin,
  upload.array(
    "images",
    8
  ),
  uploadImages
);


router.patch(
  "/:productId/images/:imageId/primary",
  requireAuth,
  requireAdmin,
  setPrimaryImage
);


router.delete(
  "/:productId/images/:imageId",
  requireAuth,
  requireAdmin,
  removeImage
);


module.exports = router;