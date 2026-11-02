const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    // Customer personal information
    firstName: {
      type: String,
      trim: true,
      default: "",
    },

    lastName: {
      type: String,
      trim: true,
      default: "",
    },

    userName: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    countryCode: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    // Customer address
    address: {
      type: String,
      trim: true,
      default: "",
    },

    pinCode: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    country: {
      type: String,
      trim: true,
      default: "",
    },

    // Additional information
    notes: {
      type: String,
      default: "",
    },

    // Account activation/deactivation
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);
