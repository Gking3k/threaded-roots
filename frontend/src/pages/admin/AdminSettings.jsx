import {
  useEffect,
  useState,
} from "react";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  getStoreSettings,
} from "../../services/api";

import {
  getPaymentInfo,
  updateSettings,
  updatePaymentInfo,
} from "../../services/adminApi";

function AdminSettings() {
  const [settings, setSettings] =
    useState({
      storeName: "",
      tagline: "",
      description: "",
      email: "",
      phone: "",
      whatsapp: "",
      address: "",
      deliveryFee: 0,
      deliveryEstimate: "",
      pickupLocation: "",
      pickupHours: "",
    });

  const [paymentInfo, setPaymentInfo] =
    useState({
      bankName: "",
      accountName: "",
      accountNumber: "",
      paymentInstructions: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [savingStore, setSavingStore] =
    useState(false);

  const [savingPayment, setSavingPayment] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [
        storeData,
        paymentData,
      ] = await Promise.all([
        getStoreSettings(),
        getPaymentInfo(),

        fetch(
          `${
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000/api"
          }/settings/payment-info`
        ).then(
          async (response) => {
            const data =
              await response.json();

            if (!response.ok) {
              throw new Error(
                data.message
              );
            }

            return data;
          }
        ),
      ]);

      setSettings({
        storeName:
          storeData.store_name ||
          "",
        tagline:
          storeData.tagline ||
          "",
        description:
          storeData.description ||
          "",
        email:
          storeData.email ||
          "",
        phone:
          storeData.phone ||
          "",
        whatsapp:
          storeData.whatsapp ||
          "",
        address:
          storeData.address ||
          "",
        deliveryFee:
          storeData.delivery_fee ||
          0,
        deliveryEstimate:
          storeData.delivery_estimate ||
          "",
        pickupLocation:
          storeData.pickup_location ||
          "",
        pickupHours:
          storeData.pickup_hours ||
          "",
      });

      setPaymentInfo({
        bankName:
          paymentData.bank_name ||
          "",
        accountName:
          paymentData.account_name ||
          "",
        accountNumber:
          paymentData.account_number ||
          "",
        paymentInstructions:
          paymentData.payment_instructions ||
          "",
      });
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to load settings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleSettingsChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setSettings((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handlePaymentChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setPaymentInfo((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleStoreSubmit(
    event
  ) {
    event.preventDefault();

    try {
      setSavingStore(true);
      setError("");
      setMessage("");

      await updateSettings(
        {
          ...settings,
          deliveryFee:
            Number(
              settings.deliveryFee
            ),
        }
      );

      setMessage(
        "Store settings updated successfully."
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to update store settings."
      );
    } finally {
      setSavingStore(false);
    }
  }

  async function handlePaymentSubmit(
    event
  ) {
    event.preventDefault();

    try {
      setSavingPayment(true);
      setError("");
      setMessage("");

      await updatePaymentInfo(
        paymentInfo
      );

      setMessage(
        "Payment information updated successfully."
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to update payment information."
      );
    } finally {
      setSavingPayment(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout
        title="Settings"
      >
        <p>
          Loading settings...
        </p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Settings"
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

      <div className="admin-settings-grid">

        <section className="admin-panel">

          <p className="eyebrow">
            STORE
          </p>

          <h2>
            Store Configuration
          </h2>

          <form
            className="admin-form"
            onSubmit={
              handleStoreSubmit
            }
          >

            <div className="admin-form-grid">

              <label>
                Store Name

                <input
                  name="storeName"
                  value={
                    settings.storeName
                  }
                  onChange={
                    handleSettingsChange
                  }
                  required
                />
              </label>

              <label>
                Tagline

                <input
                  name="tagline"
                  value={
                    settings.tagline
                  }
                  onChange={
                    handleSettingsChange
                  }
                />
              </label>

              <label className="full-width">
                Description

                <textarea
                  name="description"
                  rows="4"
                  value={
                    settings.description
                  }
                  onChange={
                    handleSettingsChange
                  }
                />
              </label>

              <label>
                Email

                <input
                  type="email"
                  name="email"
                  value={
                    settings.email
                  }
                  onChange={
                    handleSettingsChange
                  }
                />
              </label>

              <label>
                Phone

                <input
                  name="phone"
                  value={
                    settings.phone
                  }
                  onChange={
                    handleSettingsChange
                  }
                />
              </label>

              <label>
                WhatsApp

                <input
                  name="whatsapp"
                  value={
                    settings.whatsapp
                  }
                  onChange={
                    handleSettingsChange
                  }
                />
              </label>

              <label>
                Address

                <input
                  name="address"
                  value={
                    settings.address
                  }
                  onChange={
                    handleSettingsChange
                  }
                />
              </label>

              <label>
                Delivery Fee

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="deliveryFee"
                  value={
                    settings.deliveryFee
                  }
                  onChange={
                    handleSettingsChange
                  }
                  required
                />
              </label>

              <label>
                Delivery Estimate

                <input
                  name="deliveryEstimate"
                  placeholder="2–4 business days"
                  value={
                    settings.deliveryEstimate
                  }
                  onChange={
                    handleSettingsChange
                  }
                />
              </label>

              <label>
                Pickup Location

                <input
                  name="pickupLocation"
                  value={
                    settings.pickupLocation
                  }
                  onChange={
                    handleSettingsChange
                  }
                />
              </label>

              <label>
                Pickup Hours

                <input
                  name="pickupHours"
                  value={
                    settings.pickupHours
                  }
                  onChange={
                    handleSettingsChange
                  }
                />
              </label>

            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                savingStore
              }
            >
              {savingStore
                ? "Saving..."
                : "Save Store Settings"}
            </button>

          </form>

        </section>

        <section className="admin-panel">

          <p className="eyebrow">
            PAYMENT
          </p>

          <h2>
            Bank Transfer Details
          </h2>

          <form
            className="admin-form"
            onSubmit={
              handlePaymentSubmit
            }
          >

            <label>
              Bank Name

              <input
                name="bankName"
                value={
                  paymentInfo.bankName
                }
                onChange={
                  handlePaymentChange
                }
                required
              />
            </label>

            <label>
              Account Name

              <input
                name="accountName"
                value={
                  paymentInfo.accountName
                }
                onChange={
                  handlePaymentChange
                }
                required
              />
            </label>

            <label>
              Account Number

              <input
                name="accountNumber"
                value={
                  paymentInfo.accountNumber
                }
                onChange={
                  handlePaymentChange
                }
                required
              />
            </label>

            <label>
              Payment Instructions

              <textarea
                name="paymentInstructions"
                rows="7"
                value={
                  paymentInfo.paymentInstructions
                }
                onChange={
                  handlePaymentChange
                }
              />
            </label>

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={
                savingPayment
              }
            >
              {savingPayment
                ? "Saving..."
                : "Save Payment Details"}
            </button>

          </form>

        </section>

      </div>
    </AdminLayout>
  );
}

export default AdminSettings;