const mongoose = require("mongoose");

const mongoConnect = async () => {
  try {
    await mongoose.connect(process.env.MANGO_URL);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = mongoConnect;
