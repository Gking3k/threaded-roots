import { Link } from "react-router-dom";

import storeConfig from "../config/storeConfig";

function Footer() {
  return (
    <footer
      className="site-footer"
      id="contact"
    >
      <div className="footer-container">

        <div className="footer-brand">
          <p className="footer-eyebrow">
            {storeConfig.logoSubtext}
          </p>

          <h2>
            {storeConfig.name}
          </h2>

          <p>
            {storeConfig.description}
          </p>
        </div>

        <div className="footer-column">
          <h3>Explore</h3>

          <Link to="/">
            Home
          </Link>

          <Link to="/shop">
            Shop
          </Link>

          <a href="/#about">
            Our Story
          </a>
        </div>

        <div className="footer-column">
          <h3>Contact</h3>

          <a
            href={`mailto:${storeConfig.email}`}
          >
            {storeConfig.email}
          </a>

          <a
            href={`tel:${storeConfig.phone}`}
          >
            {storeConfig.phone}
          </a>

          <span>
            {storeConfig.address}
          </span>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()}{" "}
          {storeConfig.name}. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;