const dotenv = require("dotenv");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const mongoConnect = require("../config/db");
dotenv.config();

const createAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password || password.length < 12) {
      throw new Error(
        "Set ADMIN_NAME, ADMIN_EMAIL and a strong ADMIN_PASSWORD (at least 12 characters) in .env"
      );
    }

    await mongoConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.role = "admin";
      await existingUser.save();

      console.log("Existing account promoted to admin:", email);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created:", email);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();