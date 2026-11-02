// const express = require("express");
// const cors = require("cors");
// const mongoConnect = require("./config/db");
// const dotenv = require("dotenv");
// const app = express();
// dotenv.config();

// const allowedOrigins = [
//   process.env.CLIENT_URL,
//   process.env.ADMIN_URL,
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }

//       return callback(new Error("Origin not allowed by CORS"));
//     },
//   })
// );

// app.use(express.json({ limit: "1mb" }));
// app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => {
//   res.json({
//     message: "E-commerce API is running",
//   });
// });

// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/products", require("./routes/productRoutes"));
// app.use("/api/orders", require("./routes/orderRoutes"));

// app.use("/api/customers", require("./routes/customerRoutes"));

// app.use("/api/profile", require("./routes/profileRoutes"));

// app.use((req, res) => {
//   res.status(404).json({
//     message: "API route not found",
//   });
// });

// app.use((err, req, res, next) => {
//   if (err.message === "Origin not allowed by CORS") {
//     return res.status(403).json({
//       message: "Origin not allowed",
//     });
//   }

//   console.error("Server error:", err.message);

//   return res.status(500).json({
//     message: "Internal server error",
//   });
// });

// const startServer = async () => {
//   try {
//     if (!process.env.JWT_SECRET || !process.env.MANGO_URL) {
//       throw new Error("MONGO_URI and JWT_SECRET must be configured");
//     }

//     await mongoConnect();

//     const PORT = process.env.PORT || 4000;

//     app.listen(PORT, () => {
//       console.log(`Server running at http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error("Server startup failed:", error.message);
//     process.exit(1);
//   }
// };

// startServer();


const express = require("express");
const cors = require("cors");
const mongoConnect = require("./config/db");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
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
