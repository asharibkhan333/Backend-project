const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProduct,
  getNewArrivals,
  getTopSelling,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productControllers");

const {
  protect,
  adminOnly,
} = require("../middleware/authmiddleware");

// Public routes
router.get("/", getProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/top-selling", getTopSelling);
router.get("/:id", getProduct);

// Admin-only routes
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;