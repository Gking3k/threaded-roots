import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getCustomerOrder,
  markPaymentAsMade,
} from "../services/api";

import {
  formatCurrency,
} from "../utils/formatCurrency";

import {
  formatQuantity,
} from "../utils/quantity";

function OrderConfirmation() {
  const { reference } =
    useParams();

  const [
    order,
    setOrder,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submittingPayment,
    setSubmittingPayment,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const storageKey =
    `threaded_roots_order_token_${reference}`;

  async function loadOrder() {
    const accessToken =
      sessionStorage.getItem(
        storageKey
      );

    if (!accessToken) {
      setError(
        "This order session could not be found. Please use the order information sent to your email."
      );

      setLoading(false);

      return;
    }

    try {
      const data =
        await getCustomerOrder(
          reference,
          accessToken
        );

      setOrder(data);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to load your order."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [reference]);

  async function handlePaymentSubmitted() {
    const accessToken =
      sessionStorage.getItem(
        storageKey
      );

    if (!accessToken) {
      setError(
        "Your order session has expired."
      );

      return;
    }

    try {
      setSubmittingPayment(true);
      setError("");
      setMessage("");

      const data =
        await markPaymentAsMade(
          reference,
          accessToken
        );

      setOrder(
        data.order
      );

      setMessage(
        "Your payment notification has been received and is awaiting verification."
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to submit payment notification."
      );
    } finally {
      setSubmittingPayment(false);
    }
  }

  if (loading) {
    return (
      <main className="order-confirmation-page">
        <div className="container order-confirmation">
          <p className="eyebrow">
            THREADED ROOTS
          </p>

          <h1>
            Loading your order...
          </h1>
        </div>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="order-confirmation-page">
        <div className="container order-confirmation">
          <p className="eyebrow">
            ORDER
          </p>

          <h1>
            We couldn't load your order.
          </h1>

          <p>
            {error}
          </p>

          <Link
            to="/shop"
            className="btn btn-primary"
          >
            Return to Shop
          </Link>
        </div>
      </main>
    );
  }

  const paymentConfirmed =
    order.payment_status ===
    "confirmed";

  const paymentAwaiting =
    order.payment_record_status ===
    "awaiting_confirmation";

  return (
    <main className="order-confirmation-page">
      <div className="container">

        <div className="order-confirmation-header">

          <p className="eyebrow">
            {paymentConfirmed
              ? "PAYMENT CONFIRMED"
              : "ORDER RECEIVED"}
          </p>

          <h1>
            Order #{order.id}
          </h1>

          <p>
            {paymentConfirmed
              ? "Thank you. Your payment has been confirmed and your order is now being processed."
              : "Your order has been received. Please complete the payment and notify us so we can verify it."}
          </p>

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

        <div className="order-confirmation-layout">

          <section>

            <div className="order-card">

              <div className="order-card-heading">
                <p className="eyebrow">
                  ORDER DETAILS
                </p>

                <span>
                  {order.payment_status ===
                  "confirmed"
                    ? "Paid"
                    : "Awaiting Payment"}
                </span>
              </div>

              {order.items.map(
                (item) => (
                  <div
                    className="order-item"
                    key={item.id}
                  >
                    <div>
                      <strong>
                        {
                          item.product_name
                        }
                      </strong>

                      {item.variant_value && (
                        <span>
                          {
                            item.variant_value
                          }
                        </span>
                      )}

                      <small>
                        {formatQuantity(
                          item.quantity
                        )}{" "}
                        {item.unit}
                      </small>
                    </div>

                    <strong>
                      {formatCurrency(
                        item.line_total
                      )}
                    </strong>
                  </div>
                )
              )}

              <div className="summary-row">
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatCurrency(
                    order.subtotal
                  )}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  {order.fulfillment_method ===
                  "delivery"
                    ? "Delivery"
                    : "Pickup"}
                </span>

                <strong>
                  {order.fulfillment_method ===
                  "delivery"
                    ? formatCurrency(
                        order.delivery_fee
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
                    order.total_amount
                  )}
                </strong>
              </div>

            </div>

            <div className="order-card">

              <p className="eyebrow">
                FULFILLMENT
              </p>

              <h2>
                {order.fulfillment_method ===
                "delivery"
                  ? "Delivery"
                  : "Pickup"}
              </h2>

              {order.fulfillment_method ===
              "delivery" ? (
                <>
                  <p>
                    {order.delivery_address}
                  </p>

                  <p>
                    {order.delivery_city},{" "}
                    {order.delivery_state}
                  </p>

                  <p>
                    Estimated delivery:
                    {" "}
                    <strong>
                      {
                        order.delivery_estimate
                      }
                    </strong>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>
                      Pickup Location
                    </strong>
                  </p>

                  <p>
                    {
                      order.pickup_location
                    }
                  </p>

                  <p>
                    <strong>
                      Pickup Hours
                    </strong>
                  </p>

                  <p>
                    {
                      order.pickup_hours
                    }
                  </p>
                </>
              )}

            </div>

          </section>

          {!paymentConfirmed && (
            <aside className="payment-card">

              <p className="eyebrow">
                COMPLETE PAYMENT
              </p>

              <h2>
                Bank Transfer
              </h2>

              <p>
                Transfer the exact amount
                below using these details.
              </p>

              <div className="payment-detail">
                <span>
                  Amount
                </span>

                <strong>
                  {formatCurrency(
                    order.total_amount
                  )}
                </strong>
              </div>

              <div className="payment-detail">
                <span>
                  Bank
                </span>

                <strong>
                  {order.bank_name}
                </strong>
              </div>

              <div className="payment-detail">
                <span>
                  Account Name
                </span>

                <strong>
                  {order.account_name}
                </strong>
              </div>

              <div className="payment-detail">
                <span>
                  Account Number
                </span>

                <strong>
                  {order.account_number}
                </strong>
              </div>

              <p className="payment-instructions">
                {
                  order.payment_instructions
                }
              </p>

              {!paymentAwaiting && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    handlePaymentSubmitted
                  }
                  disabled={
                    submittingPayment
                  }
                >
                  {submittingPayment
                    ? "Submitting..."
                    : "I've Made Payment"}
                </button>
              )}

              {paymentAwaiting && (
                <div className="status-message status-success">
                  Payment notification received.
                  We are verifying your transfer.
                </div>
              )}

            </aside>
          )}

        </div>

        <div className="order-confirmation-footer">

          <Link
            to="/shop"
            className="btn btn-outline"
          >
            Continue Shopping
          </Link>

        </div>

      </div>
    </main>
  );
}

export default OrderConfirmation;