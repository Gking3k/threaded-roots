const crypto =
  require("crypto");

const supabase =
  require("../config/supabase");

const BUCKET =
  "product-images";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

function getExtension(
  originalName
) {
  const parts =
    originalName
      .split(".");

  return (
    parts[
      parts.length - 1
    ] || "jpg"
  ).toLowerCase();
}

function validateImage(
  file
) {
  if (!file) {
    throw new Error(
      "Image file is required."
    );
  }

  if (
    !ALLOWED_MIME_TYPES.includes(
      file.mimetype
    )
  ) {
    throw new Error(
      "Only JPEG, PNG, WebP and GIF images are allowed."
    );
  }

  if (
    file.size > MAX_FILE_SIZE
  ) {
    throw new Error(
      "Image must be 5 MB or smaller."
    );
  }
}

async function uploadProductImage(
  productId,
  file
) {
  validateImage(file);

  const extension =
    getExtension(
      file.originalname
    );

  const filename =
    `${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")}.${extension}`;

  const path =
    `products/${productId}/${filename}`;

  const {
    error,
  } =
    await supabase.storage
      .from(BUCKET)
      .upload(
        path,
        file.buffer,
        {
          contentType:
            file.mimetype,

          cacheControl:
            "3600",

          upsert:
            false,
        }
      );

  if (error) {
    console.error(
      "Supabase image upload error:",
      error
    );

    throw new Error(
      "Failed to upload product image."
    );
  }

  const {
    data,
  } =
    supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

  return {
    path,
    publicUrl:
      data.publicUrl,
  };
}

async function deleteProductImage(
  path
) {
  if (!path) {
    return;
  }

  const {
    error,
  } =
    await supabase.storage
      .from(BUCKET)
      .remove([
        path,
      ]);

  if (error) {
    console.error(
      "Supabase image deletion error:",
      error
    );

    throw new Error(
      "Failed to delete product image."
    );
  }
}

module.exports = {
  uploadProductImage,
  deleteProductImage,
};