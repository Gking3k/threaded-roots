import {
  useEffect,
  useState,
} from "react";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  getAdminOrders,
  getAdminOrder,
  updateOrderStatus,
  confirmPayment,
} from "../../services/adminApi";

import {
  formatCurrency,
} from "../../utils/formatCurrency";

const orderStatuses = [
  "pending",
  "processing",
  "ready",
  "dispatched",
  "delivered",
  "ready_for_pickup",
  "collected",
  "cancelled",
];

function AdminOrders() {
  const [orders, setOrders] =
    useState([]);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  async function loadOrders() {
    try {
      setLoading(true);

      const data =
        await getAdminOrders();

      setOrders(data);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function openOrder(
    id
  ) {
    try {
      const data =
        await getAdminOrder(
          id
        );

      setSelectedOrder(
        data
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to load order."
      );
    }
  }

  async function handleStatusChange(
    id,
    status
  ) {
    try {
      await updateOrderStatus(
        id,
        status
      );

      setMessage(
        "Order status updated successfully."
      );

      await loadOrders();

      if (
        selectedOrder?.id ===
        id
      ) {
        await openOrder(
          id
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to update order."
      );
    }
  }

  async function handleConfirmPayment(
    reference
  ) {
    const note =
      window.prompt(
        "Optional payment note:"
      ) || "";

    try {
      await confirmPayment(
        reference,
        note
      );

      setMessage(
        "Payment confirmed successfully."
      );

      await loadOrders();

      if (
        selectedOrder
      ) {
        await openOrder(
          selectedOrder.id
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to confirm payment."
      );
    }
  }

  return (
    <AdminLayout
      title="Orders"
    >
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

      <div className="admin-orders-layout">

        <section className="admin-panel">

          <p className="eyebrow">
            STORE ORDERS
          </p>

          <h2>
            Recent Orders
          </h2>

          {loading ? (
            <p>
              Loading orders...
            </p>
          ) : (
            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>
                      Order
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Fulfillment
                    </th>

                    <th>
                      Payment
                    </th>

                    <th>
                      Total
                    </th>

                    <th>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {orders.map(
                    (order) => (
                      <tr
                        key={
                          order.id
                        }
                        className={
                          selectedOrder?.id ===
                          order.id
                            ? "selected-row"
                            : ""
                        }
                        onClick={() =>
                          openOrder(
                            order.id
                          )
                        }
                      >
                        <td>
                          <strong>
                            #
                            {
                              order.id
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            order.customer_name
                          }
                        </td>

                        <td>
                          {order.fulfillment_method ===
                          "delivery"
                            ? "Delivery"
                            : "Pickup"}
                        </td>

                        <td>
                          <span
                            className={
                              order.payment_status ===
                              "confirmed"
                                ? "status-badge success"
                                : "status-badge pending"
                            }
                          >
                            {
                              order.payment_status
                            }
                          </span>
                        </td>

                        <td>
                          {formatCurrency(
                            order.total_amount
                          )}
                        </td>

                        <td>
                          <select
                            value={
                              order.status
                            }
                            onClick={(
                              event
                            ) =>
                              event.stopPropagation()
                            }
                            onChange={(
                              event
                            ) =>
                              handleStatusChange(
                                order.id,
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            {orderStatuses.map(
                              (
                                status
                              ) => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {
                                    status
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {selectedOrder && (
          <aside className="admin-panel order-detail-panel">

            <div className="admin-panel-heading">
              <div>
                <p className="eyebrow">
                  ORDER #
                  {
                    selectedOrder.id
                  }
                </p>

                <h2>
                  {
                    selectedOrder.customer_name
                  }
                </h2>
              </div>

              <button
                type="button"
                className="admin-button"
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
              >
                Close
              </button>
            </div>

            <div className="order-detail-section">

              <h3>
                Items
              </h3>

              {selectedOrder.items.map(
                (item) => (
                  <div
                    className="order-detail-item"
                    key={
                      item.id
                    }
                  >
                    <div>
                      <strong>
                        {
                          item.product_name
                        }
                      </strong>

                      <span>
                        {item.quantity}{" "}
                        {
                          item.unit
                        }

                        {item.variant_value &&
                          ` · ${item.variant_value}`}
                      </span>
                    </div>

                    <strong>
                      {formatCurrency(
                        item.line_total
                      )}
                    </strong>
                  </div>
                )
              )}

            </div>

            <div className="order-detail-section">

              <h3>
                Payment
              </h3>

              <p>
                Status:
                {" "}
                <strong>
                  {
                    selectedOrder.payment_status
                  }
                </strong>
              </p>

              <p>
                Reference:
                {" "}
                <strong>
                  {
                    selectedOrder.payment_reference
                  }
                </strong>
              </p>

              {selectedOrder.payment_status !==
                "confirmed" && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    handleConfirmPayment(
                      selectedOrder.payment_reference
                    )
                  }
                >
                  Confirm Payment
                </button>
              )}

            </div>

            <div className="order-detail-section">

              <h3>
                Fulfillment
              </h3>

              {selectedOrder.fulfillment_method ===
              "delivery" ? (
                <>
                  <p>
                    {
                      selectedOrder.delivery_address
                    }
                  </p>

                  <p>
                    {
                      selectedOrder.delivery_city
                    }
                    ,{" "}
                    {
                      selectedOrder.delivery_state
                    }
                  </p>

                  <p>
                    Estimated delivery:
                    {" "}
                    <strong>
                      {
                        selectedOrder.delivery_estimate
                      }
                    </strong>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Location:
                    {" "}
                    <strong>
                      {
                        selectedOrder.pickup_location
                      }
                    </strong>
                  </p>

                  <p>
                    Hours:
                    {" "}
                    <strong>
                      {
                        selectedOrder.pickup_hours
                      }
                    </strong>
                  </p>
                </>
              )}

            </div>

            <div className="order-detail-total">
              <span>
                Total
              </span>

              <strong>
                {formatCurrency(
                  selectedOrder.total_amount
                )}
              </strong>
            </div>

          </aside>
        )}

      </div>
    </AdminLayout>
  );
}

export default AdminOrders;