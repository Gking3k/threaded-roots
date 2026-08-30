import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  createOrder,
  getStoreSettings,
} from "../services/api";

import { useCart } from "../context/CartContext";

import {
  formatCurrency,
} from "../utils/formatCurrency";

import {
  formatQuantity,
} from "../utils/quantity";

function Checkout() {
  const navigate =
    useNavigate();

  const {
    cartItems,
    subtotal,
    clearCart,
  } = useCart();

  const [settings, setSettings] =
    useState(null);

  const [fulfillmentMethod, setFulfillmentMethod] =
    useState("delivery");

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "Nigeria",
      postalCode: "",
      note: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const data =
          await getStoreSettings();

        setSettings(data);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load store settings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleFulfillmentChange(event) {
    const method =
      event.target.value;

    setFulfillmentMethod(
      method
    );

    // Delivery-specific fields are
    // cleared when the customer chooses pickup.
    if (method === "pickup") {
      setFormData((current) => ({
        ...current,
        address: "",
        city: "",
        state: "",
        postalCode: "",
      }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (cartItems.length === 0) {
      setError(
        "Your cart is empty."
      );

      return;
    }

    if (!settings) {
      setError(
        "Store settings are still loading."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Create the order on the backend.
      //
      // The backend recalculates the real
      // prices, inventory and final total.
      const orderData =
        await createOrder({
          customer: formData,

          fulfillmentMethod,

          items: cartItems.map(
            (item) => ({
              productId:
                item.productId,

              variantId:
                item.variantId,

              quantity:
                item.quantity,
            })
          ),
        });

      const reference =
        orderData.order
          .payment_reference;

      const accessToken =
        orderData.customerAccessToken;

      // Store the private order access token
      // so the customer can view and update
      // their payment status without logging in.
      sessionStorage.setItem(
        `threaded_roots_order_token_${reference}`,
        accessToken
      );

      // The order has now been created,
      // so the cart can safely be cleared.
      clearCart();

      // Send the customer to the order
      // confirmation/payment instructions page.
      navigate(
        `/order/${encodeURIComponent(
          reference
        )}`
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to create your order."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="checkout-page">
        <div className="container checkout-loading">
          <p className="eyebrow">
            CHECKOUT
          </p>

          <h1>
            Loading checkout...
          </h1>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="empty-cart-page">
        <div className="container empty-shop">
          <p className="eyebrow">
            CHECKOUT
          </p>

          <h1>
            Your cart is empty.
          </h1>

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

  const deliveryFee =
    fulfillmentMethod === "delivery"
      ? Number(
          settings?.delivery_fee || 0
        )
      : 0;

  const estimatedTotal =
    Number(
      (
        subtotal +
        deliveryFee
      ).toFixed(2)
    );

  return (
    <main className="checkout-page">
      <div className="container">

        <div className="checkout-page-heading">
          <p className="eyebrow">
            THREADED ROOTS
          </p>

          <h1>
            Checkout
          </h1>
        </div>

        {error && (
          <div className="status-message status-error checkout-error">
            {error}
          </div>
        )}

        <div className="checkout-layout">

          <form
            className="checkout-form"
            onSubmit={handleSubmit}
          >

            {/* =========================================
                FULFILLMENT
            ========================================= */}

            <section className="checkout-block">

              <p className="eyebrow">
                01 — Fulfillment
              </p>

              <h2>
                How would you like to
                receive your order?
              </h2>

              <div className="fulfillment-options">

                {/* DELIVERY */}
                <label
                  className={
                    fulfillmentMethod ===
                    "delivery"
                      ? "fulfillment-option active"
                      : "fulfillment-option"
                  }
                >
                  <input
                    type="radio"
                    name="fulfillmentMethod"
                    value="delivery"
                    checked={
                      fulfillmentMethod ===
                      "delivery"
                    }
                    onChange={
                      handleFulfillmentChange
                    }
                  />

                  <div>
                    <strong>
                      Delivery
                    </strong>

                    <span>
                      {formatCurrency(
                        settings?.delivery_fee ||
                          0
                      )}
                    </span>

                    <small>
                      {settings?.delivery_estimate ||
                        "Delivery estimate will be provided."}
                    </small>
                  </div>
                </label>

                {/* PICKUP */}
                <label
                  className={
                    fulfillmentMethod ===
                    "pickup"
                      ? "fulfillment-option active"
                      : "fulfillment-option"
                  }
                >
                  <input
                    type="radio"
                    name="fulfillmentMethod"
                    value="pickup"
                    checked={
                      fulfillmentMethod ===
                      "pickup"
                    }
                    onChange={
                      handleFulfillmentChange
                    }
                  />

                  <div>
                    <strong>
                      Pickup
                    </strong>

                    <span>
                      Free
                    </span>

                    <small>
                      Collect from our
                      designated pickup
                      location.
                    </small>
                  </div>
                </label>

              </div>
            </section>

            {/* =========================================
                CUSTOMER INFORMATION
            ========================================= */}

            <section className="checkout-block">

              <p className="eyebrow">
                02 — Customer
              </p>

              <h2>
                Your information
              </h2>

              <div className="checkout-form-grid">

                <div className="form-group full-width">
                  <label className="form-label">
                    Full Name
                  </label>

                  <input
                    className="form-input"
                    type="text"
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email
                  </label>

                  <input
                    className="form-input"
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Phone
                  </label>

                  <input
                    className="form-input"
                    type="tel"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

              </div>
            </section>

            {/* =========================================
                DELIVERY INFORMATION
            ========================================= */}

            {fulfillmentMethod ===
              "delivery" && (
              <section className="checkout-block">

                <p className="eyebrow">
                  03 — Delivery Address
                </p>

                <h2>
                  Where should we send it?
                </h2>

                <div className="checkout-form-grid">

                  <div className="form-group full-width">
                    <label className="form-label">
                      Address
                    </label>

                    <input
                      className="form-input"
                      type="text"
                      name="address"
                      value={
                        formData.address
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      City
                    </label>

                    <input
                      className="form-input"
                      type="text"
                      name="city"
                      value={
                        formData.city
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      State
                    </label>

                    <input
                      className="form-input"
                      type="text"
                      name="state"
                      value={
                        formData.state
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Country
                    </label>

                    <input
                      className="form-input"
                      type="text"
                      name="country"
                      value={
                        formData.country
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Postal Code
                    </label>

                    <input
                      className="form-input"
                      type="text"
                      name="postalCode"
                      value={
                        formData.postalCode
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                </div>
              </section>
            )}

            {/* =========================================
                PICKUP INFORMATION
            ========================================= */}

            {fulfillmentMethod ===
              "pickup" && (
              <section className="checkout-block">

                <p className="eyebrow">
                  03 — Pickup
                </p>

                <h2>
                  Collection details
                </h2>

                <div className="pickup-information">

                  <div>
                    <span>
                      Location
                    </span>

                    <strong>
                      {settings?.pickup_location ||
                        "Pickup location will be provided."}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Hours
                    </span>

                    <strong>
                      {settings?.pickup_hours ||
                        "Pickup hours will be provided."}
                    </strong>
                  </div>

                </div>
              </section>
            )}

            {/* =========================================
                ORDER NOTE
            ========================================= */}

            <section className="checkout-block">

              <p className="eyebrow">
                04 — Note
              </p>

              <h2>
                Anything we should know?
              </h2>

              <textarea
                className="form-textarea"
                name="note"
                value={
                  formData.note
                }
                onChange={
                  handleChange
                }
                placeholder="Optional order note"
              />

            </section>

            <button
              type="submit"
              className="btn btn-primary checkout-submit-button"
              disabled={submitting}
            >
              {submitting
                ? "Creating Order..."
                : "Place Order"}
            </button>

          </form>

          {/* =========================================
              ORDER SUMMARY
          ========================================= */}

          <aside className="checkout-summary">

            <p className="eyebrow">
              ORDER SUMMARY
            </p>

            <div className="checkout-summary-items">

              {cartItems.map(
                (item) => (
                  <div
                    className="checkout-summary-item"
                    key={item.id}
                  >
                    <div>
                      <strong>
                        {
                          item.productName
                        }
                      </strong>

                      {item.variantValue && (
                        <span>
                          {
                            item.variantValue
                          }
                        </span>
                      )}

                      <span>
                        {formatQuantity(
                          item.quantity
                        )}{" "}
                        {item.unit}
                      </span>
                    </div>

                    <strong>
                      {formatCurrency(
                        Number(
                          item.price
                        ) *
                          Number(
                            item.quantity
                          )
                      )}
                    </strong>
                  </div>
                )
              )}

            </div>

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

            <div className="summary-row">
              <span>
                {fulfillmentMethod ===
                "delivery"
                  ? "Delivery"
                  : "Pickup"}
              </span>

              <strong>
                {fulfillmentMethod ===
                "delivery"
                  ? formatCurrency(
                      deliveryFee
                    )
                  : "Free"}
              </strong>
            </div>

            <div className="summary-total">
              <span>
                Total
              </span>

              <strong>
                {formatCurrency(
                  estimatedTotal
                )}
              </strong>
            </div>

            <p className="checkout-summary-note">
              Your final order total is
              calculated again by the
              server before the order is
              created.
            </p>

          </aside>

        </div>
      </div>
    </main>
  );
}

export default Checkout;
