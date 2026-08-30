import {
  useEffect,
  useState,
} from "react";

import {
  getProductImages,
  uploadProductImages,
  setPrimaryProductImage,
  deleteProductImage,
} from "../../services/adminApi";

function ProductImageManager({
  productId,
}) {
  const [images, setImages] =
    useState([]);

  const [selectedFiles, setSelectedFiles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  async function loadImages() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getProductImages(
          productId
        );

      setImages(data);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to load product images."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    if (productId) {
      loadImages();
    }
  }, [productId]);


  function handleFileChange(
    event
  ) {
    const files = [
      ...event.target.files,
    ];

    setSelectedFiles(
      files
    );

    setMessage("");
    setError("");
  }


  async function handleUpload() {
    if (
      selectedFiles.length ===
      0
    ) {
      setError(
        "Please select at least one image."
      );

      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const data =
        await uploadProductImages(
          productId,
          selectedFiles
        );

      setImages(
        data.images
      );

      setSelectedFiles([]);

      /*
       * Reset the file input visually.
       */
      const input =
        document.getElementById(
          `product-image-input-${productId}`
        );

      if (input) {
        input.value = "";
      }

      setMessage(
        "Product images uploaded successfully."
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to upload images."
      );
    } finally {
      setUploading(false);
    }
  }


  async function handleSetPrimary(
    imageId
  ) {
    try {
      setError("");
      setMessage("");

      await setPrimaryProductImage(
        productId,
        imageId
      );

      setMessage(
        "Primary image updated."
      );

      await loadImages();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to update primary image."
      );
    }
  }


  async function handleDelete(
    image
  ) {
    const confirmed =
      window.confirm(
        "Delete this product image?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const data =
        await deleteProductImage(
          productId,
          image.id
        );

      setImages(
        data.images
      );

      setMessage(
        "Product image deleted."
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to delete product image."
      );
    }
  }


  return (
    <section className="admin-panel product-image-manager">

      <div className="admin-panel-heading">
        <div>
          <p className="eyebrow">
            PRODUCT PHOTOGRAPHY
          </p>

          <h2>
            Product Images
          </h2>
        </div>

        <span className="image-count">
          {images.length}/8
        </span>
      </div>


      {message && (
        <div className="status-message status-success">
          {message}
        </div>
      )}

      {error && (
        <div className="status-message status-error">
          {error}
        </div>
      )}


      <div className="image-upload-area">

        <label
          htmlFor={`product-image-input-${productId}`}
          className="image-upload-label"
        >
          Select Images
        </label>

        <input
          id={`product-image-input-${productId}`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={
            handleFileChange
          }
          disabled={
            uploading ||
            images.length >= 8
          }
        />

        <p>
          Maximum 8 images per
          product, 5 MB each.
        </p>

        {selectedFiles.length >
          0 && (
          <p className="selected-file-count">
            {
              selectedFiles.length
            }{" "}
            image
            {selectedFiles.length ===
            1
              ? ""
              : "s"}{" "}
            selected.
          </p>
        )}

        <button
          type="button"
          className="btn btn-primary"
          onClick={
            handleUpload
          }
          disabled={
            uploading ||
            selectedFiles.length ===
              0 ||
            images.length >= 8
          }
        >
          {uploading
            ? "Uploading..."
            : "Upload Images"}
        </button>

      </div>


      {loading ? (
        <p className="admin-loading">
          Loading images...
        </p>
      ) : images.length ===
        0 ? (
        <div className="image-manager-empty">
          <p className="eyebrow">
            NO IMAGES
          </p>

          <p>
            Upload product photographs
            to display this fabric in
            the storefront.
          </p>
        </div>
      ) : (
        <div className="admin-image-grid">

          {images.map(
            (image) => (
              <article
                className={
                  image.is_primary
                    ? "admin-image-card primary"
                    : "admin-image-card"
                }
                key={image.id}
              >

                <div className="admin-image-preview">

                  <img
                    src={
                      image.image_url
                    }
                    alt="Product"
                  />

                  {image.is_primary && (
                    <span className="primary-image-badge">
                      Primary
                    </span>
                  )}

                </div>

                <div className="admin-image-actions">

                  {!image.is_primary && (
                    <button
                      type="button"
                      className="admin-button"
                      onClick={() =>
                        handleSetPrimary(
                          image.id
                        )
                      }
                    >
                      Set Primary
                    </button>
                  )}

                  <button
                    type="button"
                    className="admin-button danger"
                    onClick={() =>
                      handleDelete(
                        image
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </article>
            )
          )}

        </div>
      )}

    </section>
  );
}

export default ProductImageManager;