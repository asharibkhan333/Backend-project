const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/Products");

const DISCOUNT_RATE = 0.2;
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 15;

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { items, shippingAddress } = req.body;

    // Validate cart
    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return res.status(400).json({
        message: "Cart must contain 1 to 50 items",
      });
    }

    // Validate shipping address
    const { fullName, phone, address } = shippingAddress || {};

    if (
      typeof fullName !== "string" ||
      typeof phone !== "string" ||
      typeof address !== "string" ||
      !fullName.trim() ||
      !phone.trim() ||
      !address.trim()
    ) {
      return res.status(400).json({
        message: "Valid shipping details are required",
      });
    }

    // Validate each cart item
    for (const item of items) {
      if (
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 1000
      ) {
        return res.status(400).json({
          message: "Invalid product ID or quantity",
        });
      }

      if (
        (item.color !== undefined &&
          typeof item.color !== "string") ||
        (item.size !== undefined &&
          typeof item.size !== "string")
      ) {
        return res.status(400).json({
          message: "Invalid product color or size",
        });
      }
    }

    /*
      Aggregate quantities by product ID for stock validation.
      Example:
      Product A, Small, quantity 2
      Product A, Large, quantity 3
      Total stock required for Product A = 5
    */
    const quantitiesByProduct = new Map();

    for (const item of items) {
      const productId = item.productId.toString();

      const previousQuantity =
        quantitiesByProduct.get(productId) || 0;

      const newQuantity = previousQuantity + item.quantity;

      if (newQuantity > 1000) {
        return res.status(400).json({
          message: "Requested quantity is too large",
        });
      }

      quantitiesByProduct.set(productId, newQuantity);
    }

    let createdOrder;

    await session.withTransaction(async () => {
      const productMap = new Map();

      // Reserve stock for each unique product
      for (const [productId, quantity] of quantitiesByProduct) {
        const product = await Product.findOneAndUpdate(
          {
            _id: productId,
            stock: { $gte: quantity },
          },
          {
            $inc: { stock: -quantity },
          },
          {
            new: true,
            session,
          }
        );

        if (!product) {
          throw new Error("PRODUCT_UNAVAILABLE");
        }

        productMap.set(productId, product);
      }

      // Keep separate cart lines for different colors and sizes
      const orderItems = items.map((item) => {
        const product = productMap.get(
          item.productId.toString()
        );

        return {
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.image || "",
          quantity: item.quantity,
          color: item.color || "",
          size: item.size || "",
        };
      });

      // Always calculate prices from database products
      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const discountAmount = Number(
        (subtotal * DISCOUNT_RATE).toFixed(2)
      );

      const deliveryFee =
        subtotal > FREE_DELIVERY_THRESHOLD
          ? 0
          : DELIVERY_FEE;

      const totalAmount = Number(
        (subtotal - discountAmount + deliveryFee).toFixed(2)
      );

      const orders = await Order.create(
        [
          {
            user: req.user.id,
            items: orderItems,
            subtotal,
            discountAmount,
            deliveryFee,
            totalAmount,
            shippingAddress: {
              fullName: fullName.trim(),
              phone: phone.trim(),
              address: address.trim(),
            },
            status: "pending",
            paymentStatus: "pending",
          },
        ],
        { session }
      );

      createdOrder = orders[0];
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order: createdOrder,
    });
  } catch (error) {
    if (error.message === "PRODUCT_UNAVAILABLE") {
      return res.status(409).json({
        message:
          "A product is unavailable or has insufficient stock",
      });
    }

    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Failed to place order",
    });
  } finally {
    await session.endSession();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      message: "Failed to fetch your orders",
    });
  }
};


const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name image");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);

    return res.status(500).json({
      message: "Failed to fetch order",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    let updatedOrder;

    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (
        order.status === "cancelled" ||
        order.status === "delivered"
      ) {
        throw new Error("ORDER_CANNOT_BE_UPDATED");
      }

      // Restore reserved stock when cancelling an order
      if (status === "cancelled") {
        const quantitiesByProduct = new Map();

        for (const item of order.items) {
          const productId = item.product.toString();

          const previous =
            quantitiesByProduct.get(productId) || 0;

          quantitiesByProduct.set(
            productId,
            previous + item.quantity
          );
        }

        for (const [productId, quantity] of quantitiesByProduct) {
          const result = await Product.updateOne(
            { _id: productId },
            { $inc: { stock: quantity } },
            { session }
          );

          if (result.matchedCount !== 1) {
            throw new Error("PRODUCT_NOT_FOUND");
          }
        }
      }

      order.status = status;
      await order.save({ session });

      updatedOrder = order;
    });

    return res.json({
      message:
        status === "cancelled"
          ? "Order cancelled and stock restored successfully"
          : "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    if (error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (error.message === "ORDER_CANNOT_BE_UPDATED") {
      return res.status(400).json({
        message: "This order can no longer be updated",
      });
    }

    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(409).json({
        message:
          "A product in this order no longer exists. Cancellation could not be completed.",
      });
    }

    console.error("Update order status error:", error);

    return res.status(500).json({
      message: "Failed to update order status",
    });
  } finally {
    await session.endSession();
  }
};


module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};