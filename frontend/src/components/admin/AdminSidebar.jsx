import {
  NavLink,
  useNavigate,
} from "react-router-dom";

function AdminSidebar() {
  const navigate =
    useNavigate();

  function logout() {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate(
      "/admin/login"
    );
  }

  return (
    <aside className="admin-sidebar">

      <div className="admin-brand">
        <span>
          THREADED ROOTS
        </span>

        <small>
          ADMINISTRATION
        </small>
      </div>

      <nav className="admin-nav">

        <NavLink to="/admin">
          Dashboard
        </NavLink>

        <NavLink to="/admin/products">
          Products
        </NavLink>

        <NavLink to="/admin/categories">
          Categories
        </NavLink>

        <NavLink to="/admin/inventory">
          Inventory
        </NavLink>

        <NavLink to="/admin/orders">
          Orders
        </NavLink>

        <NavLink to="/admin/customers">
          Customers
        </NavLink>

        <NavLink to="/admin/settings">
          Settings
        </NavLink>

      </nav>

      <button
        type="button"
        className="admin-logout"
        onClick={logout}
      >
        Sign Out
      </button>

    </aside>
  );
}

export default AdminSidebar;