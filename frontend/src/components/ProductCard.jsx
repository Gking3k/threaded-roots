import { Link } from "react-router-dom";

import { formatCurrency } from "../utils/formatCurrency";

function ProductCard({ product }) {
  const primaryImage =
    product.images?.find(
      (image) =>
        image.is_primary
    ) ||
    product.images?.[0];

  return (
    <article className="product-card">
      <Link
        to={`/product/${product.id}`}
        className="product-card-image"
      >
        {primaryImage?.image_url ? (
          <img
            src={primaryImage.image_url}
            alt={product.name}
          />
        ) : (
          <div className="image-placeholder">
            <span>
              Threaded Roots
            </span>
          </div>
        )}
      </Link>

      <div className="product-card-content">
        <p className="product-card-category">
          {product.category ||
            "Textile"}
        </p>

        <h3>
          <Link
            to={`/product/${product.id}`}
          >
            {product.name}
          </Link>
        </h3>

        <div className="product-card-meta">
          <span>
            {formatCurrency(
              product.price
            )}{" "}
            / {product.unit}
          </span>

          <span>
            {Number(
              product.total_stock
            ) > 0
              ? "Available"
              : "Out of stock"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;