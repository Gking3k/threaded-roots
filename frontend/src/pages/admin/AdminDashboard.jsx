import {
  useEffect,
  useState,
} from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/admin/StatCard";

import {
  getAdminStats,
} from "../../services/adminApi";

function AdminDashboard() {
  const [stats, setStats] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const data =
          await getAdminStats();

        setStats(data);
      } catch (error) {
        console.error(error);

        setError(
          error.message ||
            "Failed to load dashboard."
        );
      }
    }

    loadStats();
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
    >
      {error && (
        <div className="status-message status-error">
          {error}
        </div>
      )}

      {!stats ? (
        <p className="admin-loading">
          Loading dashboard...
        </p>
      ) : (
        <div className="stats-grid">

          <StatCard
            label="Products"
            value={
              stats.products
            }
          />

          <StatCard
            label="Customers"
            value={
              stats.customers
            }
          />

          <StatCard
            label="Orders"
            value={
              stats.orders
            }
          />

          <StatCard
            label="Revenue"
            prefix="₦"
            value={Number(
              stats.revenue
            ).toLocaleString(
              "en-NG"
            )}
          />

          <StatCard
            label="Pending Payments"
            value={
              stats.pendingPayments
            }
          />

        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;