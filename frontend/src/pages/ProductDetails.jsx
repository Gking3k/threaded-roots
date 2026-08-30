import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { getProduct } from "../services/api";
import { useCart } from "../context/CartContext";

import {
  formatCurrency,
} from "../utils/formatCurrency";

import {
  getQuantityStep,
  formatQuantity,
} from "../utils/quantity";

function ProductDetails() {
  const { id } =
    useParams();

  const {
    addToCart,
  } = useCart();

  const [product, setProduct] =
    useState(null);

  const [selectedVariant, setSelectedVariant] =
    useState(null);

  const [quantity, setQuantity] =
    useState(0.5);

  const [activeImage, setActiveImage] =
    useState(0);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getProduct(id);

        setProduct(data);

        if (
          data.variants?.length
        ) {
          setSelectedVariant(
            data.variants[0]
          );
        }

        const step =
          getQuantityStep(
            data.unit
          );

        setQuantity(step);
      } catch (error) {
        console.error(error);

        setError(
          error.message ||
            "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="product-page-state">
        <p className="eyebrow">
          THREADED ROOTS
        </p>

        <h1>
          Loading fabric...
        </h1>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-page-state">
        <p className="eyebrow">
          PRODUCT
        </p>

        <h1>
          We couldn't find that fabric.
        </h1>

        <p>
          {error ||
            "The product may have been removed."}
        </p>

        <Link
          to="/shop"
          className="btn btn-outline"
        >
          Back to Shop
        </Link>
      </main>
    );
  }

  const images =
    product.images || [];

  const step =
    getQuantityStep(
      product.unit
    );

  let availableStock =
    Number(
      product.total_stock || 0
    );

  if (selectedVariant) {
    const inventory =
      product.inventory?.find(
        (item) =>
          String(
            item.variant_id
          ) ===
          String(
            selectedVariant.id
          )
      );

    availableStock =
      Number(
        inventory?.quantity || 0
      );
  }

  const currentImage =
    images[activeImage];

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(
        step,
        Number(
          (
            current - step
          ).toFixed(2)
        )
      )
    );
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(
        availableStock,
        Number(
          (
            current + step
          ).toFixed(2)
        )
      )
    );
  }

  function handleVariantChange(
    variant
  ) {
    setSelectedVariant(
      variant
    );

    const variantInventory =
      product.inventory?.find(
        (item) =>
          String(
            item.variant_id
          ) ===
          String(
            variant.id
          )
      );

    const variantStock =
      Number(
        variantInventory?.quantity ||
          0
      );

    setQuantity(
      variantStock > 0
        ? Math.min(
            step,
            variantStock
          )
        : 0
    );

    setMessage("");
  }

  function handleAddToCart() {
    setMessage("");

    if (
      availableStock <= 0
    ) {
      setMessage(
        "This fabric is currently out of stock."
      );

      return;
    }

    if (
      product.variants?.length &&
      !selectedVariant
    ) {
      setMessage(
        "Please select an option."
      );

      return;
    }

    const cartItem = {
      id: `${product.id}-${
        selectedVariant?.id ||
        "default"
      }`,

      productId:
        product.id,

      variantId:
        selectedVariant?.id ||
        null,

      productName:
        product.name,

      variantName:
        selectedVariant?.variant_name ||
        null,

      variantValue:
        selectedVariant?.variant_value ||
        null,

      price:
        Number(product.price),

      unit:
        product.unit,

      imageUrl:
        currentImage?.image_url ||
        null,

      maxStock:
        availableStock,

      quantity:
        Number(quantity),
    };

    const result =
      addToCart(
        cartItem
      );

    if (!result.success) {
      setMessage(
        result.message
      );

      return;
    }

    setMessage(
      "Added to your collection."
    );
  }

  return (
    <main className="product-details-page">
      <div className="container">

        <Link
          to="/shop"
          className="back-link"
        >
          ← Back to Collection
        </Link>

        <div className="product-details-layout">

          <div className="product-gallery">

            <div className="product-main-image">
              {currentImage?.image_url ? (
                <img
                  src={
                    currentImage.image_url
                  }
                  alt={
                    product.name
                  }
                />
              ) : (
                <div className="image-placeholder">
                  Threaded Roots
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map(
                  (image, index) => (
                    <button
                      type="button"
                      key={image.id}
                      className={
                        index ===
                        activeImage
                          ? "product-thumbnail active"
                          : "product-thumbnail"
                      }
                      onClick={() =>
                        setActiveImage(
                          index
                        )
                      }
                    >
                      <img
                        src={
                          image.image_url
                        }
                        alt={`${product.name} view ${
                          index + 1
                        }`}
                      />
                    </button>
                  )
                )}
              </div>
            )}

          </div>

          <div className="product-information">

            <p className="eyebrow">
              {product.category ||
                "Textile"}
            </p>

            <h1>
              {product.name}
            </h1>

            <p className="product-price-large">
              {formatCurrency(
                product.price
              )}{" "}
              <span>
                / {product.unit}
              </span>
            </p>

            {product.description && (
              <p className="product-description-text">
                {product.description}
              </p>
            )}

            <div className="product-facts">

              {product.material && (
                <div>
                  <span>
                    Material
                  </span>

                  <strong>
                    {product.material}
                  </strong>
                </div>
              )}

              {product.pattern && (
                <div>
                  <span>
                    Pattern
                  </span>

                  <strong>
                    {product.pattern}
                  </strong>
                </div>
              )}

              {product.color && (
                <div>
                  <span>
                    Colour
                  </span>

                  <strong>
                    {product.color}
                  </strong>
                </div>
              )}

              {product.width && (
                <div>
                  <span>
                    Width
                  </span>

                  <strong>
                    {product.width}
                  </strong>
                </div>
              )}

              <div>
                <span>
                  Sold by
                </span>

                <strong>
                  {product.unit}
                </strong>
              </div>

            </div>

            {product.variants?.length >
              0 && (
              <div className="product-variants">
                <p className="variant-label">
                  Available options
                </p>

                <div className="variant-list">
                  {product.variants.map(
                    (variant) => {
                      const inventory =
                        product.inventory?.find(
                          (item) =>
                            String(
                              item.variant_id
                            ) ===
                            String(
                              variant.id
                            )
                        );

                      const stock =
                        Number(
                          inventory?.quantity ||
                            0
                        );

                      return (
                        <button
                          type="button"
                          key={variant.id}
                          className={
                            selectedVariant?.id ===
                            variant.id
                              ? "variant-tag selected"
                              : "variant-tag"
                          }
                          disabled={
                            stock <= 0
                          }
                          onClick={() =>
                            handleVariantChange(
                              variant
                            )
                          }
                        >
                          {
                            variant.variant_value
                          }
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            <div className="stock-status">
              <span>
                Availability
              </span>

              <strong
                className={
                  availableStock > 0
                    ? "in-stock"
                    : "out-of-stock"
                }
              >
                {availableStock > 0
                  ? `${formatQuantity(
                      availableStock
                    )} ${product.unit}${
                      availableStock === 1
                        ? ""
                        : "s"
                    } available`
                  : "Currently unavailable"}
              </strong>
            </div>

            <div className="product-purchase">

              <div className="quantity-control">
                <button
                  type="button"
                  onClick={
                    decreaseQuantity
                  }
                  disabled={
                    quantity <= step ||
                    availableStock <= 0
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>
                  {formatQuantity(
                    quantity
                  )}{" "}
                  {product.unit}
                </span>

                <button
                  type="button"
                  onClick={
                    increaseQuantity
                  }
                  disabled={
                    quantity >=
                      availableStock ||
                    availableStock <= 0
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary add-cart-button"
                onClick={
                  handleAddToCart
                }
                disabled={
                  availableStock <= 0 ||
                  quantity <= 0
                }
              >
                Add to Cart
              </button>

            </div>

            {message && (
              <p className="cart-feedback">
                {message}
              </p>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}

export default ProductDetails;