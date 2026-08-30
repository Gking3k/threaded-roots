import {
  useEffect,
  useState,
} from "react";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  getProducts,
  getCategories,
} from "../../services/api";

import {
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  deleteVariant,
} from "../../services/adminApi";

import {
  formatCurrency,
} from "../../utils/formatCurrency";

import ProductImageManager from "../../components/admin/ProductImageManager";

function AdminProducts() {
  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState({
      categoryId: "",
      name: "",
      description: "",
      price: "",
      unit: "yard",
      material: "",
      pattern: "",
      color: "",
      width: "",
      brand: "Threaded Roots",
      featured: false,
      active: true,
    });

  const [variantForm, setVariantForm] =
    useState({
      name: "Color",
      value: "",
    });

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  async function loadData() {
    try {
      setLoading(true);

      const [
        productData,
        categoryData,
      ] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      setProducts(productData);
      setCategories(categoryData);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(
    event
  ) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function resetForm() {
    setEditingId(null);

    setForm({
      categoryId: "",
      name: "",
      description: "",
      price: "",
      unit: "yard",
      material: "",
      pattern: "",
      color: "",
      width: "",
      brand: "Threaded Roots",
      featured: false,
      active: true,
    });

    setVariantForm({
      name: "Color",
      value: "",
    });
  }

  function startEditing(
    product
  ) {
    setEditingId(
      product.id
    );

    setForm({
      categoryId:
        product.category_id ||
        "",
      name:
        product.name || "",
      description:
        product.description ||
        "",
      price:
        product.price || "",
      unit:
        product.unit ||
        "yard",
      material:
        product.material ||
        "",
      pattern:
        product.pattern ||
        "",
      color:
        product.color ||
        "",
      width:
        product.width ||
        "",
      brand:
        product.brand ||
        "Threaded Roots",
      featured:
        Boolean(
          product.featured
        ),
      active:
        Boolean(
          product.active
        ),
    });

    setMessage("");
    setError("");
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");

      const data = {
        ...form,
        categoryId:
          form.categoryId ||
          null,
        price:
          Number(
            form.price
          ),
      };

      if (editingId) {
        await updateProduct(
          editingId,
          data
        );

        setMessage(
          "Product updated successfully."
        );
      } else {
        await createProduct(
          data
        );

        setMessage(
          "Product created successfully."
        );
      }

      resetForm();

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to save product."
      );
    }
  }

  async function handleDelete(
    id
  ) {
    const confirmed =
      window.confirm(
        "Delete this product?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(
        id
      );

      setMessage(
        "Product deleted successfully."
      );

      if (
        editingId === id
      ) {
        resetForm();
      }

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to delete product."
      );
    }
  }

  async function handleAddVariant(
    productId
  ) {
    if (
      !variantForm.value.trim()
    ) {
      return;
    }

    try {
      await createVariant(
        productId,
        {
          variantName:
            variantForm.name.trim(),
          variantValue:
            variantForm.value.trim(),
        }
      );

      setVariantForm(
        (current) => ({
          ...current,
          value: "",
        })
      );

      setMessage(
        "Variant added successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to add variant."
      );
    }
  }

  async function handleDeleteVariant(
    id
  ) {
    try {
      await deleteVariant(
        id
      );

      setMessage(
        "Variant removed successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to remove variant."
      );
    }
  }

  return (
    <AdminLayout
      title="Products"
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

       {editingId && (
        <ProductImageManager
          productId={editingId}
        />
      )}

      <section className="admin-panel">

        <div className="admin-panel-heading">
          <div>
            <p className="eyebrow">
              CATALOG
            </p>

            <h2>
              {editingId
                ? "Edit Product"
                : "Add Product"}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              className="admin-button"
              onClick={
                resetForm
              }
            >
              Cancel Editing
            </button>
          )}
        </div>

        <form
          className="admin-form"
          onSubmit={
            handleSubmit
          }
        >

          <div className="admin-form-grid">

            <label>
              Category

              <select
                name="categoryId"
                value={
                  form.categoryId
                }
                onChange={
                  handleChange
                }
                required
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (
                    category
                  ) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Product Name

              <input
                name="name"
                value={
                  form.name
                }
                onChange={
                  handleChange
                }
                required
              />
            </label>

            <label>
              Price

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={
                  form.price
                }
                onChange={
                  handleChange
                }
                required
              />
            </label>

            <label>
              Sold By

              <select
                name="unit"
                value={
                  form.unit
                }
                onChange={
                  handleChange
                }
              >
                <option value="yard">
                  Yard
                </option>

                <option value="meter">
                  Meter
                </option>

                <option value="piece">
                  Piece
                </option>
              </select>
            </label>

            <label>
              Material

              <input
                name="material"
                value={
                  form.material
                }
                onChange={
                  handleChange
                }
              />
            </label>

            <label>
              Pattern

              <input
                name="pattern"
                value={
                  form.pattern
                }
                onChange={
                  handleChange
                }
              />
            </label>

            <label>
              Colour

              <input
                name="color"
                value={
                  form.color
                }
                onChange={
                  handleChange
                }
              />
            </label>

            <label>
              Width

              <input
                name="width"
                placeholder="45 inches"
                value={
                  form.width
                }
                onChange={
                  handleChange
                }
              />
            </label>

            <label className="full-width">
              Description

              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                rows="4"
              />
            </label>

          </div>

          <div className="admin-checkbox-row">

            <label>
              <input
                type="checkbox"
                name="featured"
                checked={
                  form.featured
                }
                onChange={
                  handleChange
                }
              />

              Featured
            </label>

            <label>
              <input
                type="checkbox"
                name="active"
                checked={
                  form.active
                }
                onChange={
                  handleChange
                }
              />

              Active
            </label>

          </div>

          <button
            type="submit"
            className="btn btn-primary admin-submit"
          >
            {editingId
              ? "Update Product"
              : "Create Product"}
          </button>

        </form>

      </section>

      <section className="admin-panel">

        <div className="admin-panel-heading">
          <div>
            <p className="eyebrow">
              INVENTORY CATALOG
            </p>

            <h2>
              Products
            </h2>
          </div>
        </div>

        {loading ? (
          <p>
            Loading products...
          </p>
        ) : (
          <div className="admin-product-list">

            {products.map(
              (product) => (
                <article
                  className="admin-product-card"
                  key={
                    product.id
                  }
                >

                  <div>
                    <p className="admin-card-eyebrow">
                      {
                        product.category
                      }
                    </p>

                    <h3>
                      {
                        product.name
                      }
                    </h3>

                    <p>
                      {formatCurrency(
                        product.price
                      )}{" "}
                      /{" "}
                      {
                        product.unit
                      }
                    </p>
                  </div>

                  <div className="admin-product-actions">

                    <button
                      type="button"
                      className="admin-button"
                      onClick={() =>
                        startEditing(
                          product
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
                          product.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                  {product.variants
                    ?.length >
                    0 && (
                    <div className="admin-variants">

                      <strong>
                        Variants
                      </strong>

                      <div className="variant-admin-list">
                        {product.variants.map(
                          (
                            variant
                          ) => (
                            <span
                              key={
                                variant.id
                              }
                              className="variant-admin-tag"
                            >
                              {
                                variant.variant_value
                              }

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteVariant(
                                    variant.id
                                  )
                                }
                              >
                                ×
                              </button>
                            </span>
                          )
                        )}
                      </div>

                    </div>
                  )}

                  <div className="admin-add-variant">

                    <input
                      value={
                        editingId ===
                        product.id
                          ? variantForm.name
                          : "Color"
                      }
                      onChange={(
                        event
                      ) => {
                        if (
                          editingId !==
                          product.id
                        ) {
                          setEditingId(
                            product.id
                          );
                        }

                        setVariantForm(
                          (current) => ({
                            ...current,
                            name:
                              event.target
                                .value,
                          })
                        );
                      }}
                      placeholder="Variant name"
                    />

                    <input
                      value={
                        editingId ===
                        product.id
                          ? variantForm.value
                          : ""
                      }
                      onChange={(
                        event
                      ) => {
                        if (
                          editingId !==
                          product.id
                        ) {
                          setEditingId(
                            product.id
                          );
                        }

                        setVariantForm(
                          (current) => ({
                            ...current,
                            value:
                              event.target
                                .value,
                          })
                        );
                      }}
                      placeholder="Variant value"
                    />

                    <button
                      type="button"
                      className="admin-button"
                      onClick={() =>
                        handleAddVariant(
                          product.id
                        )
                      }
                    >
                      Add Variant
                    </button>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </section>
    </AdminLayout>
  );
}

export default AdminProducts;