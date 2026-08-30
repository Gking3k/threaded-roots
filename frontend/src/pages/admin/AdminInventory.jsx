import {
  useEffect,
  useState,
} from "react";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  getInventory,
  updateInventory,
  createInventory,
} from "../../services/adminApi";

import {
  getProducts,
} from "../../services/api";

import {
  formatQuantity,
} from "../../utils/quantity";

function AdminInventory() {
  const [inventory, setInventory] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [quantities, setQuantities] =
    useState({});

  const [newInventory, setNewInventory] =
    useState({
      productId: "",
      variantId: "",
      quantity: "",
      lowStockThreshold: 5,
    });

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function loadData() {
    try {
      const [
        inventoryData,
        productData,
      ] = await Promise.all([
        getInventory(),
        getProducts(),
      ]);

      setInventory(
        inventoryData
      );

      setProducts(
        productData
      );

      const nextQuantities = {};

      inventoryData.forEach(
        (item) => {
          nextQuantities[
            item.id
          ] = item.quantity;
        }
      );

      setQuantities(
        nextQuantities
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to load inventory."
      );
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveInventory(
    id
  ) {
    try {
      setError("");
      setMessage("");

      await updateInventory(
        id,
        {
          quantity:
            Number(
              quantities[id]
            ),
        }
      );

      setMessage(
        "Inventory updated successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to update inventory."
      );
    }
  }

  async function handleCreateInventory(
    event
  ) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");

      await createInventory({
        productId:
          Number(
            newInventory.productId
          ),

        variantId:
          newInventory.variantId
            ? Number(
                newInventory.variantId
              )
            : null,

        quantity:
          Number(
            newInventory.quantity
          ),

        lowStockThreshold:
          Number(
            newInventory.lowStockThreshold
          ),
      });

      setMessage(
        "Inventory record created successfully."
      );

      setNewInventory({
        productId: "",
        variantId: "",
        quantity: "",
        lowStockThreshold: 5,
      });

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to create inventory."
      );
    }
  }

  const selectedProduct =
    products.find(
      (product) =>
        String(
          product.id
        ) ===
        String(
          newInventory.productId
        )
    );

  return (
    <AdminLayout
      title="Inventory"
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

      <section className="admin-panel">

        <p className="eyebrow">
          STOCK MANAGEMENT
        </p>

        <h2>
          Add Inventory Record
        </h2>

        <form
          className="admin-form"
          onSubmit={
            handleCreateInventory
          }
        >

          <div className="admin-form-grid">

            <label>
              Product

              <select
                value={
                  newInventory.productId
                }
                onChange={(event) =>
                  setNewInventory(
                    (current) => ({
                      ...current,
                      productId:
                        event.target
                          .value,
                      variantId:
                        "",
                    })
                  )
                }
                required
              >
                <option value="">
                  Select product
                </option>

                {products.map(
                  (product) => (
                    <option
                      key={
                        product.id
                      }
                      value={
                        product.id
                      }
                    >
                      {
                        product.name
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Variant

              <select
                value={
                  newInventory.variantId
                }
                onChange={(event) =>
                  setNewInventory(
                    (current) => ({
                      ...current,
                      variantId:
                        event.target
                          .value,
                    })
                  )
                }
              >
                <option value="">
                  No variant
                </option>

                {selectedProduct?.variants?.map(
                  (variant) => (
                    <option
                      key={
                        variant.id
                      }
                      value={
                        variant.id
                      }
                    >
                      {
                        variant.variant_value
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Quantity

              <input
                type="number"
                min="0"
                step="0.5"
                value={
                  newInventory.quantity
                }
                onChange={(event) =>
                  setNewInventory(
                    (current) => ({
                      ...current,
                      quantity:
                        event.target
                          .value,
                    })
                  )
                }
                required
              />
            </label>

            <label>
              Low Stock Threshold

              <input
                type="number"
                min="0"
                step="0.5"
                value={
                  newInventory.lowStockThreshold
                }
                onChange={(event) =>
                  setNewInventory(
                    (current) => ({
                      ...current,
                      lowStockThreshold:
                        event.target
                          .value,
                    })
                  )
                }
                required
              />
            </label>

          </div>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Add Inventory
          </button>

        </form>

      </section>

      <section className="admin-panel">

        <p className="eyebrow">
          CURRENT STOCK
        </p>

        <h2>
          Inventory
        </h2>

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>
                  Product
                </th>

                <th>
                  Variant
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Threshold
                </th>

                <th>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {inventory.map(
                (item) => (
                  <tr
                    key={
                      item.id
                    }
                  >
                    <td>
                      {
                        item.product_name
                      }
                    </td>

                    <td>
                      {
                        item.variant_value ||
                        "—"
                      }
                    </td>

                    <td>
                      <input
                        className="inventory-input"
                        type="number"
                        min="0"
                        step="0.5"
                        value={
                          quantities[
                            item.id
                          ] ?? ""
                        }
                        onChange={(
                          event
                        ) =>
                          setQuantities(
                            (
                              current
                            ) => ({
                              ...current,
                              [item.id]:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                      />
                    </td>

                    <td>
                      {formatQuantity(
                        item.low_stock_threshold
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-button"
                        onClick={() =>
                          saveInventory(
                            item.id
                          )
                        }
                      >
                        Save
                      </button>
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </section>
    </AdminLayout>
  );
}

export default AdminInventory;