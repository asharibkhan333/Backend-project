const express = require("express");
const cors = require("cors");
const mongoConnect = require("./config/db");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  "https://shop-co-website-izht.vercel.app",
  "https://e-commerce-deshboard-one.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const isAllowedReactPreview = (origin) => {
  return /^https:\/\/shop-co-website-vg69(?:-[a-z0-9-]+)?-asharibkhans-projects\.vercel\.app$/i.test(origin);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isAllowedReactPreview(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-commerce API is running",
  });
});

// Database connection for API requests
app.use(async (req, res, next) => {
  try {
    if (!process.env.MANGO_URL || !process.env.JWT_SECRET) {
      throw new Error("MANGO_URL and JWT_SECRET must be configured");
    }

    await mongoConnect();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));

// 404
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      message: "Origin not allowed",
    });
  }

  res.status(500).json({
    message: "Internal server error",
  });
});

// Local development only
if (require.main === module) {
  const PORT = process.env.PORT || 4000;

  mongoConnect()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Database connection failed:", error.message);
      process.exit(1);
    });
}

module.exports = app;
