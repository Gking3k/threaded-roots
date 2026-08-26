const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use(helmet());

app.use(
  express.json({
    limit: "1mb",
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "Threaded Roots API is running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Threaded Roots API",
  });
});

app.listen(PORT, () => {
  console.log(
    `Threaded Roots API running on port ${PORT}`
  );
});