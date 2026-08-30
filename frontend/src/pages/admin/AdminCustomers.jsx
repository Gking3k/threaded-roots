import {
  useEffect,
  useState,
} from "react";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  getAdminCustomers,
  getAdminCustomer,
} from "../../services/adminApi";

import {
  formatCurrency,
} from "../../utils/formatCurrency";

function AdminCustomers() {
  const [customers, setCustomers] =
    useState([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [error, setError] =
    useState("");

  async function loadCustomers() {
    try {
      const data =
        await getAdminCustomers();

      setCustomers(data);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to load customers."
      );
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function openCustomer(
    id
  ) {
    try {
      const data =
        await getAdminCustomer(
          id
        );

      setSelectedCustomer(
        data
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to load customer."
      );
    }
  }

  return (
    <AdminLayout
      title="Customers"
    >
      {error && (
        <div className="status-message status-error">
          {error}
        </div>
      )}

      <section className="admin-panel">

        <p className="eyebrow">
          CUSTOMER DIRECTORY
        </p>

        <h2>
          Customers
        </h2>

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>
                  Name
                </th>

                <th>
                  Email
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Orders
                </th>

                <th>
                  Total Spent
                </th>
              </tr>
            </thead>

            <tbody>

              {customers.map(
                (customer) => (
                  <tr
                    key={
                      customer.id
                    }
                    onClick={() =>
                      openCustomer(
                        customer.id
                      )
                    }
                  >
                    <td>
                      <strong>
                        {
                          customer.name
                        }
                      </strong>
                    </td>

                    <td>
                      {
                        customer.email
                      }
                    </td>

                    <td>
                      {
                        customer.phone
                      }
                    </td>

                    <td>
                      {
                        customer.order_count
                      }
                    </td>

                    <td>
                      {formatCurrency(
                        customer.total_spent
                      )}
                    </td>
                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </section>

      {selectedCustomer && (
        <section className="admin-panel">

          <div className="admin-panel-heading">

            <div>
              <p className="eyebrow">
                CUSTOMER
              </p>

              <h2>
                {
                  selectedCustomer.name
                }
              </h2>
            </div>

            <button
              type="button"
              className="admin-button"
              onClick={() =>
                setSelectedCustomer(
                  null
                )
              }
            >
              Close
            </button>

          </div>

          <div className="customer-detail-grid">

            <div>
              <span>
                Email
              </span>

              <strong>
                {
                  selectedCustomer.email
                }
              </strong>
            </div>

            <div>
              <span>
                Phone
              </span>

              <strong>
                {
                  selectedCustomer.phone
                }
              </strong>
            </div>

          </div>

        </section>
      )}
    </AdminLayout>
  );
}

export default AdminCustomers;