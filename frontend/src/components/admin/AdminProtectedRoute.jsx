import {
  Navigate,
  Outlet,
} from "react-router-dom";

function AdminProtectedRoute() {
  const token =
    localStorage.getItem(
      "token"
    );

  const user =
    JSON.parse(
      localStorage.getItem(
        "user"
      ) || "null"
    );

  const isAuthorized =
    token &&
    user &&
    ["admin", "staff"].includes(
      user.role
    );

  if (!isAuthorized) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return <Outlet />;
}

export default AdminProtectedRoute;