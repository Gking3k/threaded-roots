const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

require("dotenv").config();

const categoryRoutes =
  require("./routes/categoryRoutes");

const authRoutes =
  require("./routes/authRoutes");

const productRoutes =
  require("./routes/productRoutes");

const userRoutes =
  require("./routes/userRoutes");

const inventoryRoutes =
  require("./routes/inventoryRoutes");

const customerRoutes =
  require("./routes/customerRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const settingsRoutes =
  require("./routes/settingsRoutes");

const paymentRoutes =
  require("./routes/paymentRoutes");

const adminRoutes =
  require("./routes/adminRoutes");

const {
  verifyEmailConnection,
} = require("./utils/email");

const productImageRoutes =
  require(
    "./routes/productImageRoutes"
  );

const pool =
  require("./config/db");

const app = express();

app.set(
  "trust proxy",
  1
);

app.disable(
  "x-powered-by"
);

const PORT =
  process.env.PORT || 5000;


// =========================================================
// CORS
// =========================================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      /*
       * Requests without an Origin header may come from
       * server-to-server tools such as curl/Postman.
       */
      if (!origin) {
        return callback(
          null,
          true
        );
      }

      if (
        allowedOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      return callback(
        new Error(
          "CORS origin not allowed"
        )
      );
    },

    methods: [
      "GET",
      "HEAD",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Order-Token",
    ],
  })
);


// =========================================================
// SECURITY HEADERS
// =========================================================

app.use(
  helmet()
);


// =========================================================
// REQUEST BODY PARSING
// =========================================================

app.use(
  express.json({
    limit: "1mb",
  })
);


// =========================================================
// BASIC ROUTES
// =========================================================

app.get(
  "/",
  (req, res) => {
    res.json({
      message:
        "Threaded Roots API is running",
    });
  }
);


app.get(
  "/health",
  (req, res) => {
    res.json({
      status: "ok",
      service:
        "Threaded Roots API",
    });
  }
);


// =========================================================
// DATABASE TEST
// =========================================================

app.get(
  "/api/test-db",
  async (req, res) => {
    try {
      const result =
        await pool.query(
          "SELECT NOW() AS current_time"
        );

      res.json({
        message:
          "Supabase database connected successfully",

        time:
          result.rows[0]
            .current_time,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Supabase database connection failed",
      });
    }
  }
);


// =========================================================
// API ROUTES
// =========================================================

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/inventory",
  inventoryRoutes
);

app.use(
  "/api/customers",
  customerRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/settings",
  settingsRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/products",
  productImageRoutes
);

// =========================================================
// START SERVER
// =========================================================

app.listen(
  PORT,
  async () => {
    console.log(
      `Threaded Roots API running on port ${PORT}`
    );

    try {
      await verifyEmailConnection();

      console.log(
        "Email server connection verified"
      );
    } catch (error) {
      console.error(
        "Email server verification failed:",
        error.message
      );
    }
  }
);