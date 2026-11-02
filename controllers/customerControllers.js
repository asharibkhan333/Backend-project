
const mongoose = require("mongoose");
const User = require("../models/user");
const Order = require("../models/order");

// Format customer data for admin frontend
const formatCustomer = (customer, orderStats = {}) => {
  const firstName =
    customer.firstName ||
    customer.name?.split(" ")[0] ||
    "";

  const lastName =
    customer.lastName ||
    customer.name?.split(" ").slice(1).join(" ") ||
    "";

  return {
    id: customer._id.toString(),
    firstName,
    lastName,
    userName: customer.userName || "",
    name: customer.name,
    email: customer.email,
    phone: customer.phone || "",
    countryCode: customer.countryCode || "",
    avatar: customer.avatar || "",
    address: customer.address || "",
    pinCode: customer.pinCode || "",
    city: customer.city || "",
    country: customer.country || "",
    notes: customer.notes || "",

    status: customer.isActive === false ? "Inactive" : "Active",

    joinedDate: customer.createdAt
      ? new Date(customer.createdAt).toLocaleDateString()
      : "",

    totalOrders: orderStats.totalOrders || 0,
    orderValues: orderStats.orderValues || 0,

    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
};


// GET ALL CUSTOMERS
const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer",
    }).sort({ createdAt: -1 });

    // Calculate customer-wise order statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          orderValues: {
            $sum: {
              $cond: [
                { $ne: ["$status", "cancelled"] },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const statsMap = new Map();

    orderStats.forEach((stat) => {
      statsMap.set(stat._id.toString(), {
        totalOrders: stat.totalOrders,
        orderValues: Number(stat.orderValues.toFixed(2)),
      });
    });

    const result = customers.map((customer) =>
      formatCustomer(
        customer,
        statsMap.get(customer._id.toString())
      )
    );

    return res.json({
      success: true,
      count: result.length,
      customers: result,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      message: "Failed to fetch customers",
    });
  }
};


// GET CUSTOMER BY ID
const getCustomerById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const stats = await Order.aggregate([
      {
        $match: {
          user: customer._id,
        },
      },
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          orderValues: {
            $sum: {
              $cond: [
                { $ne: ["$status", "cancelled"] },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    return res.json({
      success: true,
      customer: formatCustomer(customer, stats[0]),
    });
  } catch (error) {
    console.error("Get customer error:", error);

    return res.status(500).json({
      message: "Failed to fetch customer",
    });
  }
};


// UPDATE CUSTOMER
const updateCustomer = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const {
      firstName,
      lastName,
      userName,
      email,
      phone,
      countryCode,
      avatar,
      address,
      pinCode,
      city,
      country,
      notes,
    } = req.body;

    const fields = {
      firstName,
      lastName,
      userName,
      email,
      phone,
      countryCode,
      avatar,
      address,
      pinCode,
      city,
      country,
      notes,
    };

    // Validate supplied fields
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && typeof value !== "string") {
        return res.status(400).json({
          message: `${key} must be a string`,
        });
      }
    }

    if (
      firstName !== undefined &&
      !firstName.trim()
    ) {
      return res.status(400).json({
        message: "First name is required",
      });
    }

    if (
      lastName !== undefined &&
      !lastName.trim()
    ) {
      return res.status(400).json({
        message: "Last name is required",
      });
    }

    if (
      email !== undefined &&
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Check if email belongs to another account
    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: customer._id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email already registered",
        });
      }

      customer.email = normalizedEmail;
    }

    // Update only permitted profile fields
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && key !== "email") {
        customer[key] = value.trim();
      }
    }

    // Keep legacy full name field updated
    if (firstName !== undefined || lastName !== undefined) {
      const finalFirstName =
        firstName ?? customer.firstName ?? "";

      const finalLastName =
        lastName ?? customer.lastName ?? "";

      customer.name =
        `${finalFirstName.trim()} ${finalLastName.trim()}`.trim();
    }

    await customer.save();

    return res.json({
      success: true,
      message: "Customer updated successfully",
      customer: formatCustomer(customer),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    console.error("Update customer error:", error);

    return res.status(500).json({
      message: "Failed to update customer",
    });
  }
};


// DEACTIVATE CUSTOMER
const deactivateCustomer = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    customer.isActive = false;
    await customer.save();

    return res.json({
      success: true,
      message: "Customer deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate customer error:", error);

    return res.status(500).json({
      message: "Failed to deactivate customer",
    });
  }
};


// REACTIVATE CUSTOMER
const activateCustomer = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    customer.isActive = true;
    await customer.save();

    return res.json({
      success: true,
      message: "Customer activated successfully",
    });
  } catch (error) {
    console.error("Activate customer error:", error);

    return res.status(500).json({
      message: "Failed to activate customer",
    });
  }
};


module.exports = {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deactivateCustomer,
  activateCustomer,
};
