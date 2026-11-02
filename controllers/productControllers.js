const mongoose = require("mongoose");
const Product = require("../models/Products");

const DEFAULT_COLORS = ["#4F4631", "#314F4A", "#31344F"];

const DEFAULT_REVIEWS = [
  {
    name: "Samantha D.",
    rating: 4.5,
    date: "August 14, 2023",
    message: "Really good quality and comfortable fabric. I love the fitting.",
  },
  {
    name: "Alex M.",
    rating: 4,
    date: "August 15, 2023",
    message: "Good product with nice quality. The delivery was also quick.",
  },
  {
    name: "Ethan R.",
    rating: 3.5,
    date: "August 16, 2023",
    message: "The product is good. The fitting could be a little better.",
  },
  {
    name: "Olivia P.",
    rating: 4,
    date: "August 17, 2023",
    message: "Nice material and exactly what I expected.",
  },
  {
    name: "Liam K.",
    rating: 4,
    date: "August 18, 2023",
    message: "Comfortable to wear and good value for money.",
  },
  {
    name: "Ava H.",
    rating: 4.5,
    date: "August 19, 2023",
    message: "Amazing quality. I would definitely recommend it.",
  },
];

const DEFAULT_FAQS = [
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 3-5 business days. Express delivery takes 1-2 business days.",
  },
  {
    question: "What is your return policy?",
    answer:
      "You can return an unused product within 30 days of receiving your order.",
  },
  {
    question: "Can I exchange the product?",
    answer:
      "Yes, you can exchange the size or color within 30 days, subject to availability.",
  },
  {
    question: "How should I care for this product?",
    answer:
      "Wash with cold water and similar colors. Follow the care instructions on the product label.",
  },
];

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

// New Arrivals: Sirf woh products jo Top Selling mein nahi hain
const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.json(products);
  } catch (error) {
    console.error("New Arrivals Error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch new arrivals",
    });
  }
};

// Top Selling: Sirf isTopSelling true wale products
const getTopSelling = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      isTopSelling: true,
    }).sort({ createdAt: -1 });

    return res.json(products);
  } catch (error) {
    console.error("Top Selling Error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch top selling products",
    });
  }
};

const getProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      oldPrice,
      discount,
      image,
      gallery,
      category,
      dressStyle,
      color,
      colors,
      sizes,
      stock,
      rating,
      isActive,
      isTopSelling,
    } = req.body;

    const allowedCategories = [
      "T-Shirts",
      "Shorts",
      "Shirts",
      "Hoodie",
      "Jeans",
    ];

    // Validate required fields
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return res.status(400).json({
        message: "Valid name, price and stock are required",
      });
    }

    // Validate category
    const finalCategory = category || "T-Shirts";

    if (!allowedCategories.includes(finalCategory)) {
      return res.status(400).json({
        message: "Invalid product category",
      });
    }

    // Validate rating
    const finalRating = rating === undefined ? 4.5 : rating;

    if (
      typeof finalRating !== "number" ||
      !Number.isFinite(finalRating) ||
      finalRating < 0 ||
      finalRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 0 and 5",
      });
    }

    // Validate old price
    if (
      oldPrice !== undefined &&
      oldPrice !== null &&
      (typeof oldPrice !== "number" ||
        !Number.isFinite(oldPrice) ||
        oldPrice < 0)
    ) {
      return res.status(400).json({
        message: "Invalid old price",
      });
    }

    // Validate discount
    if (
      discount !== undefined &&
      (typeof discount !== "number" ||
        !Number.isFinite(discount) ||
        discount < 0 ||
        discount > 100)
    ) {
      return res.status(400).json({
        message: "Discount must be between 0 and 100",
      });
    }

    // Validate gallery
    if (
      gallery !== undefined &&
      (!Array.isArray(gallery) ||
        !gallery.every((item) => typeof item === "string"))
    ) {
      return res.status(400).json({
        message: "Gallery must be an array of image paths",
      });
    }

    // Validate colors
    if (
      colors !== undefined &&
      (!Array.isArray(colors) ||
        !colors.every((item) => typeof item === "string"))
    ) {
      return res.status(400).json({
        message: "Colors must be an array of strings",
      });
    }

    // Validate sizes
    if (
      sizes !== undefined &&
      (!Array.isArray(sizes) ||
        !sizes.every((item) => typeof item === "string"))
    ) {
      return res.status(400).json({
        message: "Sizes must be an array of strings",
      });
    }

    // Every new product gets the standard colors.
    // If the admin enters additional colors, include those too.
    const finalColors = [
      ...new Set([
        ...DEFAULT_COLORS,
        ...(colors || []),
      ]),
    ];

    // Create product
    const product = await Product.create({
      name: name.trim(),
      description: description || "",
      price,
      oldPrice: oldPrice ?? null,
      discount: discount ?? 0,
      image: image || "",
      gallery: gallery || [],
      category: finalCategory,
      dressStyle: dressStyle || "Casual",
      color: color || finalColors[0],
      colors: finalColors,
      sizes: sizes || ["Small", "Medium", "Large", "X-Large"],
      stock,
      rating: finalRating,
      reviews_count: DEFAULT_REVIEWS.length,
      reviews: DEFAULT_REVIEWS,
      faqs: DEFAULT_FAQS,
      isActive: isActive ?? true,
      isTopSelling: isTopSelling ?? false,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    return res.status(400).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "oldPrice",
      "discount",
      "image",
      "gallery",
      "category",
      "dressStyle",
      "color",
      "colors",
      "sizes",
      "stock",
      "isActive",
      "isTopSelling",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const allowedCategories = [
      "T-Shirts",
      "Shorts",
      "Shirts",
      "Hoodie",
      "Jeans",
    ];

    if (
      "name" in updates &&
      (typeof updates.name !== "string" || !updates.name.trim())
    ) {
      return res.status(400).json({
        message: "Invalid product name",
      });
    }

    if (
      "price" in updates &&
      (typeof updates.price !== "number" ||
        !Number.isFinite(updates.price) ||
        updates.price < 0)
    ) {
      return res.status(400).json({
        message: "Invalid price",
      });
    }

    if (
      "oldPrice" in updates &&
      updates.oldPrice !== null &&
      (typeof updates.oldPrice !== "number" ||
        !Number.isFinite(updates.oldPrice) ||
        updates.oldPrice < 0)
    ) {
      return res.status(400).json({
        message: "Invalid old price",
      });
    }

    if (
      "discount" in updates &&
      (typeof updates.discount !== "number" ||
        !Number.isFinite(updates.discount) ||
        updates.discount < 0 ||
        updates.discount > 100)
    ) {
      return res.status(400).json({
        message: "Discount must be between 0 and 100",
      });
    }

    if (
      "stock" in updates &&
      (!Number.isInteger(updates.stock) || updates.stock < 0)
    ) {
      return res.status(400).json({
        message: "Invalid stock",
      });
    }

    if (
      "category" in updates &&
      !allowedCategories.includes(updates.category)
    ) {
      return res.status(400).json({
        message: "Invalid product category",
      });
    }

    if (
      "gallery" in updates &&
      (!Array.isArray(updates.gallery) ||
        !updates.gallery.every((item) => typeof item === "string"))
    ) {
      return res.status(400).json({
        message: "Gallery must be an array of image paths",
      });
    }

    if (
      "colors" in updates &&
      (!Array.isArray(updates.colors) ||
        !updates.colors.every((item) => typeof item === "string"))
    ) {
      return res.status(400).json({
        message: "Colors must be an array of strings",
      });
    }

    if (
      "sizes" in updates &&
      (!Array.isArray(updates.sizes) ||
        !updates.sizes.every((item) => typeof item === "string"))
    ) {
      return res.status(400).json({
        message: "Sizes must be an array of strings",
      });
    }

    for (const field of ["isActive", "isTopSelling"]) {
      if (
        field in updates &&
        typeof updates[field] !== "boolean"
      ) {
        return res.status(400).json({
          message: `${field} must be true or false`,
        });
      }
    }

    if ("name" in updates) {
      updates.name = updates.name.trim();
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    return res.status(400).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getNewArrivals,
  getTopSelling,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};