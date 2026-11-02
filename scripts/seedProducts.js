require("dotenv").config();

const mongoose = require("mongoose");
const Product = require(".././models/Products");

// Product options
const COLORS = ["#4F4631", "#314F4A", "#31344F"];

const SIZES = ["Small", "Medium", "Large", "X-Large"];

// Default customer reviews
const defaultReviews = [
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

// Default FAQs
const defaultFaqs = [
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

// Create color-wise image galleries
function makeProduct(product) {
  const { image, altA, altB } = product;

  return {
    ...product,

    colors: COLORS,
    sizes: SIZES,

    description:
      product.description ||
      "This premium piece is crafted from soft and breathable fabric for everyday comfort. Its modern design and quality finish make it a great addition to your wardrobe.",

    gallery: [image, altA, altB],

    imagesByColor: {
      [COLORS[0]]: [image, altA, altB],
      [COLORS[1]]: [altA, image, altB],
      [COLORS[2]]: [altB, altA, image],
    },

    reviews: defaultReviews,
    faqs: defaultFaqs,

    stock: 50,
    isActive: true,
  };
}

// All 15 SHOP.CO products
const products = [
  // NEW ARRIVALS

  makeProduct({
    name: "T-shirt with Tape Details",
    image: "Arrivals/T-4-png.png",
    altA: "Arrivals/product-1-png.png",
    altB: "Arrivals/T-3-png.png",
    price: 120,
    rating: 4.5,
    reviews_count: 120,
    category: "T-Shirts",
    dressStyle: "Casual",
    color: "#000000",
    isTopSelling: false,
  }),

  makeProduct({
    name: "Skinny Fit Jeans",
    image: "Arrivals/product-2-png.png",
    altA: "Arrivals/product-8-jpg.jpg",
    altB: "Arrivals/product-7-jpg.jpg",
    price: 240,
    oldPrice: 260,
    discount: 20,
    rating: 3.5,
    reviews_count: 84,
    category: "Jeans",
    dressStyle: "Casual",
    color: "#1E4AE9",
    isTopSelling: false,
  }),

  makeProduct({
    name: "Checkered Shirt",
    image: "Arrivals/product-3-png.png",
    altA: "Arrivals/product-5-jpg.jpg",
    altB: "Arrivals/product-1-png.png",
    price: 180,
    rating: 4.5,
    reviews_count: 76,
    category: "Shirts",
    dressStyle: "Formal",
    color: "#FF0000",
    isTopSelling: false,
  }),

  makeProduct({
    name: "Sleeve Striped T-shirt",
    image: "Arrivals/product-4-png.png",
    altA: "Arrivals/product-1-png.png",
    altB: "Arrivals/product-6-jpg.jpg",
    price: 130,
    oldPrice: 160,
    discount: 30,
    rating: 4.5,
    reviews_count: 145,
    category: "T-Shirts",
    dressStyle: "Gym",
    color: "#000000",
    isTopSelling: false,
  }),

  makeProduct({
    name: "Vertical Striped Shirt",
    image: "Arrivals/product-5-jpg.jpg",
    altA: "Arrivals/product-3-png.png",
    altB: "Arrivals/product-6-jpg.jpg",
    price: 212,
    oldPrice: 232,
    discount: 20,
    rating: 5,
    reviews_count: 210,
    category: "Shirts",
    dressStyle: "Formal",
    color: "#22C55E",
    isTopSelling: true,
  }),

  makeProduct({
    name: "Courage Graphic T-shirt",
    image: "Arrivals/product-6-jpg.jpg",
    altA: "Arrivals/product-1-png.png",
    altB: "Arrivals/product-4-png.png",
    price: 145,
    rating: 4,
    reviews_count: 98,
    category: "T-Shirts",
    dressStyle: "Party",
    color: "#FFD400",
    isTopSelling: true,
  }),

  makeProduct({
    name: "Loose Fit Bermuda Shorts",
    image: "Arrivals/product-7-jpg.jpg",
    altA: "Arrivals/product-2-png.png",
    altB: "Arrivals/product-8-jpg.jpg",
    price: 80,
    rating: 3,
    reviews_count: 52,
    category: "Shorts",
    dressStyle: "Gym",
    color: "#4F4631",
    isTopSelling: true,
  }),

  makeProduct({
    name: "Faded Skinny Jeans",
    image: "Arrivals/product-8-jpg.jpg",
    altA: "Arrivals/product-2-png.png",
    altB: "Arrivals/product-7-jpg.jpg",
    price: 210,
    oldPrice: 260,
    discount: 20,
    rating: 4.5,
    reviews_count: 167,
    category: "Jeans",
    dressStyle: "Casual",
    color: "#1E4AE9",
    isTopSelling: true,
  }),

  // TOP SELLING / MORE PRODUCTS

  makeProduct({
    name: "Classic Black Tee",
    image: "Arrivals/product-1-png.png",
    altA: "Arrivals/product-6-jpg.jpg",
    altB: "Arrivals/product-4-png.png",
    price: 95,
    oldPrice: 120,
    discount: 20,
    rating: 4.5,
    reviews_count: 402,
    category: "T-Shirts",
    dressStyle: "Casual",
    color: "#000000",
    isTopSelling: true,
  }),

  makeProduct({
    name: "Mid Blue Slim Jeans",
    image: "Arrivals/product-2-png.png",
    altA: "Arrivals/product-7-jpg.jpg",
    altB: "Arrivals/product-8-jpg.jpg",
    price: 195,
    rating: 4,
    reviews_count: 155,
    category: "Jeans",
    dressStyle: "Formal",
    color: "#1E4AE9",
    isTopSelling: true,
  }),

  makeProduct({
    name: "Buffalo Check Flannel",
    image: "Arrivals/product-3-png.png",
    altA: "Arrivals/product-5-jpg.jpg",
    altB: "Arrivals/product-6-jpg.jpg",
    price: 168,
    oldPrice: 210,
    discount: 20,
    rating: 5,
    reviews_count: 289,
    category: "Shirts",
    dressStyle: "Casual",
    color: "#FF0000",
    isTopSelling: true,
  }),

  makeProduct({
    name: "Colorblock Sleeve Tee",
    image: "Arrivals/product-4-png.png",
    altA: "Arrivals/product-1-png.png",
    altB: "Arrivals/product-3-png.png",
    price: 110,
    rating: 3.5,
    reviews_count: 73,
    category: "T-Shirts",
    dressStyle: "Party",
    color: "#8B15C9",
    isTopSelling: true,
  }),

  makeProduct({
    name: "Oversized Pullover Hoodie",
    image: "Arrivals/T-3-png.png",
    altA: "Arrivals/product-1-png.png",
    altB: "Arrivals/product-4-png.png",
    price: 175,
    rating: 4.5,
    reviews_count: 64,
    category: "Hoodie",
    dressStyle: "Gym",
    color: "#22C55E",
    isTopSelling: true,
  }),

  makeProduct({
    name: "Zip-Up Fleece Hoodie",
    image: "Arrivals/product-6-jpg.jpg",
    altA: "Arrivals/product-3-png.png",
    altB: "Arrivals/product-5-jpg.jpg",
    price: 190,
    oldPrice: 220,
    discount: 15,
    rating: 4,
    reviews_count: 41,
    category: "Hoodie",
    dressStyle: "Casual",
    color: "#FFFFFF",
    isTopSelling: true,
  }),

  makeProduct({
    name: "Cargo Utility Shorts",
    image: "Arrivals/product-5-jpg.jpg",
    altA: "Arrivals/product-7-jpg.jpg",
    altB: "Arrivals/product-2-png.png",
    price: 95,
    rating: 3.5,
    reviews_count: 37,
    category: "Shorts",
    dressStyle: "Gym",
    color: "#8B15C9",
    isTopSelling: true,
  }),
];

// Seed function
const seedProducts = async () => {
  try {
    if (!process.env.MANGO_URL) {
      throw new Error("MANGO_URL .env file mein missing hai.");
    }

    await mongoose.connect(process.env.MANGO_URL);

    console.log("MongoDB connected successfully!");

    for (const product of products) {
      await Product.updateOne(
        { name: product.name },
        { $set: product },
        {
          upsert: true,
          runValidators: true,
        }
      );

      console.log(`Saved: ${product.name}`);
    }

    console.log("--------------------------------");
    console.log("15 SHOP.CO products added/updated!");
    console.log("New Arrivals: 8 products");
    console.log("Top Selling: 8 products");
    console.log("--------------------------------");

  } catch (error) {
    console.error("Seed Error:", error);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
};

seedProducts();
