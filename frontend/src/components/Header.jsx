import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import storeConfig from "../config/storeConfig";

function Header() {
  const { itemCount } =
    useCart();

  return (
    <header className="site-header">
      <div className="nav-container">

        <Link
          to="/"
          className="brand"
          aria-label={
            storeConfig.name
          }
        >
          {storeConfig.logoText}

          <span>
            {storeConfig.logoSubtext}
          </span>
        </Link>

        <nav className="site-nav">
          <Link to="/">
            Home
          </Link>

          <Link to="/shop">
            Shop
          </Link>

          <Link to="/shop">
            Collections
          </Link>

          <a href="/#about">
            Our Story
          </a>

          <a href="/#contact">
            Contact
          </a>
        </nav>

        <div className="nav-actions">
          <Link
            to="/cart"
            className="nav-action cart-nav-action"
            aria-label="Shopping cart"
          >
            Cart ({itemCount})
          </Link>
        </div>

      </div>
    </header>
  );
}

export default Header;