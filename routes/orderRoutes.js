const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderControllers");

const {
  protect,
  adminOnly,
} = require("../middleware/authmiddleware");

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, adminOnly, getOrderById);

router.get("/", protect, adminOnly, getAllOrders);

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

module.exports = router;
