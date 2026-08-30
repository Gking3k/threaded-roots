import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard";

import {
  getProducts,
  getCategories,
  getStoreSettings,
} from "../services/api";

import storeConfig from "../config/storeConfig";

function Home() {
  const [featuredProducts, setFeaturedProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [settings, setSettings] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [
          products,
          categoryData,
          storeSettings,
        ] = await Promise.all([
          getProducts({
            featured: true,
          }),
          getCategories(),
          getStoreSettings(),
        ]);

        setFeaturedProducts(products);
        setCategories(categoryData);
        setSettings(storeSettings);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load the collection."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <main>

      {/* HERO */}
      <section className="home-hero">
        <div className="hero-pattern"></div>

        <div className="home-hero-content">
          <p className="eyebrow">
            {storeConfig.logoSubtext}
          </p>

          <h1>
            Woven from heritage.
          </h1>

          <p>
            Discover textiles rooted in
            tradition, thoughtfully selected
            for contemporary expression.
          </p>

          <Link
            to="/shop"
            className="btn btn-primary"
          >
            Explore Fabrics
          </Link>
        </div>

        <div className="hero-art">
          <div className="woven-panel">
            <span>
              THREAD
            </span>

            <span>
              ROOTS
            </span>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="section collections-section">
        <div className="container">

          <div className="section-heading">
            <p className="eyebrow">
              Our Collections
            </p>

            <h2>
              Woven traditions,
              thoughtfully selected.
            </h2>

            <p>
              Explore textiles inspired by
              craftsmanship, culture and
              everyday creativity.
            </p>
          </div>

          {categories.length > 0 && (
            <div className="collection-grid">
              {categories.map(
                (category, index) => (
                  <Link
                    key={category.id}
                    to={`/shop?categoryId=${category.id}`}
                    className="collection-card"
                  >
                    <span>
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </span>

                    <h3>
                      {category.name}
                    </h3>

                    <p>
                      {category.description}
                    </p>

                    <strong>
                      Explore →
                    </strong>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section featured-section">
        <div className="container">

          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">
                Featured Fabrics
              </p>

              <h2>
                Selected with intention.
              </h2>
            </div>

            <Link
              to="/shop"
              className="text-link"
            >
              View all fabrics →
            </Link>
          </div>

          {loading ? (
            <p className="store-message">
              Loading collection...
            </p>
          ) : error ? (
            <p className="store-message error">
              {error}
            </p>
          ) : featuredProducts.length ===
            0 ? (
            <p className="store-message">
              Our featured collection
              is being prepared.
            </p>
          ) : (
            <div className="product-grid">
              {featuredProducts
                .slice(0, 6)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
            </div>
          )}

        </div>
      </section>

      {/* ABOUT */}
      <section
        className="story-section"
        id="about"
      >
        <div className="container story-grid">

          <div className="story-decoration">
            <div className="thread-circle">
              <span>
                ROOTED
              </span>
            </div>
          </div>

          <div className="story-content">
            <p className="eyebrow">
              Our Story
            </p>

            <h2>
              Where heritage meets
              the present.
            </h2>

            <p>
              {settings?.description ||
                "Threaded Roots brings together traditional textile character and modern appreciation for quality, colour and craftsmanship."}
            </p>

            <Link
              to="/shop"
              className="btn btn-outline"
            >
              Discover the Collection
            </Link>
          </div>

        </div>
      </section>

      {/* CONTACT */}
      <section className="section contact-section">
        <div className="container contact-card">
          <p className="eyebrow">
            Visit & Connect
          </p>

          <h2>
            Let's talk textiles.
          </h2>

          <p>
            Have a question about a fabric,
            availability or placing an order?
            We'd be happy to help.
          </p>

          <div className="contact-actions">
            <a
              href={`mailto:${settings?.email || storeConfig.email}`}
              className="btn btn-primary"
            >
              Email Us
            </a>

            <a
              href={`https://wa.me/${(
                settings?.whatsapp ||
                storeConfig.whatsapp
              ).replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}

export default Home;