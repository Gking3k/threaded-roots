import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  setupAdmin,
} from "../../services/adminApi";

function AdminSetup() {
  const navigate =
    useNavigate();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    if (
      formData.password.length <
      8
    ) {
      setError(
        "Password must be at least 8 characters."
      );

      return;
    }

    try {
      setLoading(true);

      await setupAdmin(
        formData.name,
        formData.email,
        formData.password
      );

      navigate(
        "/admin/login"
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to create administrator."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-auth-page">

      <form
        className="admin-auth-card"
        onSubmit={
          handleSubmit
        }
      >

        <p className="eyebrow">
          THREADED ROOTS
        </p>

        <h1>
          Create Administrator
        </h1>

        <p>
          Set up the first administrator
          account for this store.
        </p>

        {error && (
          <div className="status-message status-error">
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            Name
          </label>

          <input
            className="form-input"
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
            Password
          </label>

          <input
            className="form-input"
            type="password"
            name="password"
            minLength={8}
            value={
              formData.password
            }
            onChange={
              handleChange
            }
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Confirm Password
          </label>

          <input
            className="form-input"
            type="password"
            name="confirmPassword"
            minLength={8}
            value={
              formData.confirmPassword
            }
            onChange={
              handleChange
            }
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading
            ? "Creating Account..."
            : "Create Administrator"}
        </button>

      </form>

    </main>
  );
}

export default AdminSetup;