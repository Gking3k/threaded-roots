import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import CartProvider from "./context/CartContext";

import Header from "./components/Header";
import Footer from "./components/Footer";

import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";

import AdminSetup from "./pages/admin/AdminSetup";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminSettings from "./pages/admin/AdminSettings";

function AppContent() {
  const location =
    useLocation();

  const isAdmin =
    location.pathname.startsWith(
      "/admin"
    );

  return (
    <>
      {!isAdmin && (
        <Header />
      )}

      <Routes>

        {/* =========================
            PUBLIC STORE
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/shop"
          element={<Shop />}
        />

        <Route
          path="/product/:id"
          element={
            <ProductDetails />
          }
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/order/:reference"
          element={
            <OrderConfirmation />
          }
        />


        {/* =========================
            ADMIN AUTH
        ========================= */}

        <Route
          path="/admin/setup"
          element={<AdminSetup />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* =========================
            PROTECTED ADMIN
        ========================= */}

        <Route
          element={
            <AdminProtectedRoute />
          }
        >

          <Route
            path="/admin"
            element={
              <AdminDashboard />
            }
          />

          <Route
            path="/admin/products"
            element={
              <AdminProducts />
            }
          />

          <Route
            path="/admin/categories"
            element={
              <AdminCategories />
            }
          />

          <Route
            path="/admin/inventory"
            element={
              <AdminInventory />
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminOrders />
            }
          />

          <Route
            path="/admin/customers"
            element={
              <AdminCustomers />
            }
          />

          <Route
            path="/admin/settings"
            element={
              <AdminSettings />
            }
          />

        </Route>

      </Routes>

      {!isAdmin && (
        <Footer />
      )}
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;