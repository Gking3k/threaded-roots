import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

import { formatCurrency } from "../utils/formatCurrency";

import {
  getQuantityStep,
  formatQuantity,
} from "../utils/quantity";

function Cart() {
  const {
    cartItems,
    subtotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="empty-cart-page">
        <div className="container empty-shop">
          <p className="eyebrow">
            YOUR COLLECTION
          </p>

          <h1>
            Your cart is empty.
          </h1>

          <p>
            Discover fabrics rooted in
            tradition and selected for
            modern expression.
          </p>

          <Link
            to="/shop"
            className="btn btn-primary"
          >
            Explore Fabrics
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="container">

        <div className="cart-page-heading">
          <p className="eyebrow">
            YOUR COLLECTION
          </p>

          <h1>
            Shopping Cart
          </h1>
        </div>

        <div className="cart-layout">

          <section className="cart-items">
            {cartItems.map(
              (item) => {
                const step =
                  getQuantityStep(
                    item.unit
                  );

                return (
                  <article
                    className="cart-item"
                    key={item.id}
                  >
                    <div className="cart-item-image">
                      {item.imageUrl ? (
                        <img
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.productName
                          }
                        />
                      ) : (
                        <div className="image-placeholder">
                          Threaded Roots
                        </div>
                      )}
                    </div>

                    <div className="cart-item-details">

                      <p className="product-card-category">
                        Textile
                      </p>

                      <h2>
                        {item.productName}
                      </h2>

                      {item.variantValue && (
                        <p className="cart-variant">
                          {item.variantName}:
                          {" "}
                          {item.variantValue}
                        </p>
                      )}

                      <p className="cart-unit-price">
                        {formatCurrency(
                          item.price
                        )}{" "}
                        / {item.unit}
                      </p>

                      <div className="cart-item-actions">

                        <div className="quantity-control">

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity -
                                  step
                              )
                            }
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <span>
                            {formatQuantity(
                              item.quantity
                            )}{" "}
                            {item.unit}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity +
                                  step
                              )
                            }
                            disabled={
                              item.quantity >=
                              Number(
                                item.maxStock
                              )
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>

                        </div>

                        <button
                          type="button"
                          className="remove-cart-button"
                          onClick={() =>
                            removeFromCart(
                              item.id
                            )
                          }
                        >
                          Remove
                        </button>

                      </div>
                    </div>

                    <strong className="cart-item-total">
                      {formatCurrency(
                        Number(
                          item.price
                        ) *
                          Number(
                            item.quantity
                          )
                      )}
                    </strong>

                  </article>
                );
              }
            )}
          </section>

          <aside className="cart-summary">

            <p className="eyebrow">
              ORDER SUMMARY
            </p>

            <div className="summary-row">
              <span>
                Subtotal
              </span>

              <strong>
                {formatCurrency(
                  subtotal
                )}
              </strong>
            </div>

            <p className="cart-summary-note">
              Delivery or pickup options
              will be selected at checkout.
            </p>

            <Link
              to="/checkout"
              className="btn btn-primary cart-checkout-button"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/shop"
              className="continue-shopping"
            >
              Continue Shopping
            </Link>

          </aside>

        </div>
      </div>
    </main>
  );
}

export default Cart;