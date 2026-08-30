import { useEffect, useState } from "react";
import {
  useSearchParams,
} from "react-router-dom";

import ProductCard from "../components/ProductCard";

import {
  getProducts,
  getCategories,
} from "../services/api";

function Shop() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [searchInput, setSearchInput] =
    useState(
      searchParams.get("search") || ""
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const selectedCategory =
    searchParams.get(
      "categoryId"
    ) || "";

  const search =
    searchParams.get("search") || "";

  useEffect(() => {
    async function loadCategories() {
      try {
        const data =
          await getCategories();

        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getProducts({
            categoryId:
              selectedCategory ||
              undefined,

            search:
              search || undefined,
          });

        setProducts(data);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [
    selectedCategory,
    search,
  ]);

  function handleSearch(event) {
    event.preventDefault();

    const nextParams =
      new URLSearchParams(
        searchParams
      );

    if (searchInput.trim()) {
      nextParams.set(
        "search",
        searchInput.trim()
      );
    } else {
      nextParams.delete("search");
    }

    setSearchParams(nextParams);
  }

  function selectCategory(
    categoryId
  ) {
    const nextParams =
      new URLSearchParams(
        searchParams
      );

    if (categoryId) {
      nextParams.set(
        "categoryId",
        categoryId
      );
    } else {
      nextParams.delete(
        "categoryId"
      );
    }

    setSearchParams(nextParams);
  }

  function clearFilters() {
    setSearchInput("");
    setSearchParams({});
  }

  return (
    <main className="shop-page">

      <section className="shop-intro">
        <div className="container">
          <p className="eyebrow">
            The Collection
          </p>

          <h1>
            Textiles with roots.
          </h1>

          <p>
            Explore our collection of fabrics
            shaped by tradition and selected
            for modern expression.
          </p>
        </div>
      </section>

      <section className="shop-content section">
        <div className="container">

          <form
            className="shop-search"
            onSubmit={handleSearch}
          >
            <label htmlFor="search">
              Search fabrics
            </label>

            <div className="search-row">
              <input
                id="search"
                type="search"
                placeholder="Search by name, material, colour..."
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value
                  )
                }
              />

              <button
                type="submit"
                className="btn btn-primary"
              >
                Search
              </button>
            </div>
          </form>

          <div className="shop-toolbar">

            <div className="category-filters">
              <button
                type="button"
                className={
                  !selectedCategory
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() =>
                  selectCategory("")
                }
              >
                All
              </button>

              {categories.map(
                (category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={
                      String(
                        category.id
                      ) ===
                      String(
                        selectedCategory
                      )
                        ? "filter-button active"
                        : "filter-button"
                    }
                    onClick={() =>
                      selectCategory(
                        category.id
                      )
                    }
                  >
                    {category.name}
                  </button>
                )
              )}
            </div>

            {(selectedCategory ||
              search) && (
              <button
                type="button"
                className="clear-filters"
                onClick={
                  clearFilters
                }
              >
                Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="store-message">
              Loading fabrics...
            </div>
          ) : error ? (
            <div className="store-message error">
              {error}
            </div>
          ) : products.length ===
            0 ? (
            <div className="empty-shop">
              <p className="eyebrow">
                No Results
              </p>

              <h2>
                Nothing matched your search.
              </h2>

              <p>
                Try another search or browse
                all of our collections.
              </p>

              <button
                type="button"
                className="btn btn-outline"
                onClick={
                  clearFilters
                }
              >
                View All Fabrics
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}
            </div>
          )}

        </div>
      </section>

    </main>
  );
}

export default Shop;