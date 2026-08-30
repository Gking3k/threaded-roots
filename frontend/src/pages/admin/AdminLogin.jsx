import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  loginAdmin,
} from "../../services/adminApi";

function AdminLogin() {
  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data =
        await loginAdmin(
          email,
          password
        );

      if (
        !["admin", "staff"].includes(
          data.user.role
        )
      ) {
        throw new Error(
          "You do not have administrator access."
        );
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user
        )
      );

      navigate("/admin");
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to log in."
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
          Administrator Login
        </h1>

        <p>
          Sign in to manage your
          textile store.
        </p>

        {error && (
          <div className="status-message status-error">
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            Email
          </label>

          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
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
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
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
            ? "Signing In..."
            : "Sign In"}
        </button>

      </form>

    </main>
  );
}

export default AdminLogin;