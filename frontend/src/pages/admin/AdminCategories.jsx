import {
  useEffect,
  useState,
} from "react";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  getCategories,
} from "../../services/api";

import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/adminApi";

function AdminCategories() {
  const [categories, setCategories] =
    useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  async function loadCategories() {
    try {
      const data =
        await getCategories();

      setCategories(data);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to load categories."
      );
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
  }

  function startEditing(
    category
  ) {
    setEditingId(
      category.id
    );

    setName(
      category.name
    );

    setDescription(
      category.description ||
        ""
    );
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");

      const data = {
        name:
          name.trim(),
        description:
          description.trim(),
      };

      if (editingId) {
        await updateCategory(
          editingId,
          data
        );

        setMessage(
          "Category updated successfully."
        );
      } else {
        await createCategory(
          data
        );

        setMessage(
          "Category created successfully."
        );
      }

      resetForm();

      await loadCategories();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to save category."
      );
    }
  }

  async function handleDelete(
    id
  ) {
    if (
      !window.confirm(
        "Delete this category?"
      )
    ) {
      return;
    }

    try {
      await deleteCategory(
        id
      );

      setMessage(
        "Category deleted successfully."
      );

      await loadCategories();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to delete category."
      );
    }
  }

  return (
    <AdminLayout
      title="Categories"
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

      <div className="admin-two-column">

        <section className="admin-panel">

          <p className="eyebrow">
            COLLECTIONS
          </p>

          <h2>
            {editingId
              ? "Edit Category"
              : "Add Category"}
          </h2>

          <form
            className="admin-form"
            onSubmit={
              handleSubmit
            }
          >

            <label>
              Name

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target
                      .value
                  )
                }
                required
              />
            </label>

            <label>
              Description

              <textarea
                rows="5"
                value={
                  description
                }
                onChange={(
                  event
                ) =>
                  setDescription(
                    event.target
                      .value
                  )
                }
              />
            </label>

            <div className="admin-action-row">

              <button
                type="submit"
                className="btn btn-primary"
              >
                {editingId
                  ? "Update Category"
                  : "Create Category"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="admin-button"
                  onClick={
                    resetForm
                  }
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>

        <section className="admin-panel">

          <p className="eyebrow">
            CURRENT COLLECTIONS
          </p>

          <div className="admin-list">

            {categories.map(
              (category) => (
                <div
                  className="admin-list-row"
                  key={
                    category.id
                  }
                >
                  <div>
                    <strong>
                      {
                        category.name
                      }
                    </strong>

                    <p>
                      {
                        category.description
                      }
                    </p>
                  </div>

                  <div className="admin-action-row">

                    <button
                      type="button"
                      className="admin-button"
                      onClick={() =>
                        startEditing(
                          category
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="admin-button danger"
                      onClick={() =>
                        handleDelete(
                          category.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>
                </div>
              )
            )}

          </div>

        </section>

      </div>
    </AdminLayout>
  );
}

export default AdminCategories;