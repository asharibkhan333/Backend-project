const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

// Cloudinary par image upload
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "shopco/customer-profiles",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
};

// ================= SIGNUP =================
const signup = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    name = name.trim();
    email = email.trim().toLowerCase();

    if (!name || !email || password.length < 8) {
      return res.status(400).json({
        message: "Enter valid details and a password of at least 8 characters",
      });
    }

    if (name.length > 100 || email.length > 254) {
      return res.status(400).json({
        message: "Input is too long",
      });
    }

    const nameParts = name.split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ");

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Agar signup par image select ki hai to Cloudinary upload karo
    let avatar = "";

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file);
      avatar = uploadedImage.secure_url;
    }

    const user = await User.create({
      name,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      avatar,
      role: "customer",
      isActive: true,
    });

    return res.status(201).json({
      message: "Signup successful. Please login.",
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    console.error("Signup error:", error);

    return res.status(500).json({
      message: "Signup failed",
    });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message:
          "Your account has been deactivated. Please contact support.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

module.exports = {
  signup,
  login,
};
