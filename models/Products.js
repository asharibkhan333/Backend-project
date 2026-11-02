const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    oldPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    image: {
      type: String,
      default: "",
    },

    gallery: {
      type: [String],
      default: [],
    },

    imagesByColor: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    category: {
      type: String,
      required: true,
      enum: ["T-Shirts", "Shorts", "Shirts", "Hoodie", "Jeans"],
    },

    dressStyle: {
      type: String,
      enum: ["Casual", "Formal", "Party", "Gym"],
      default: "Casual",
    },

    color: {
      type: String,
      default: "",
    },

    colors: {
      type: [String],
      default: [],
    },

    sizes: {
      type: [String],
      default: ["Small", "Medium", "Large", "X-Large"],
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviews_count: {
      type: Number,
      default: 0,
      min: 0,
    },

    reviews: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    faqs: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },

    isTopSelling: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Products ||
  mongoose.model("Products", productSchema);
