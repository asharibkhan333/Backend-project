const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Get current user data from MongoDB
    const user = await User.findById(decoded.userId).select(
      "_id role isActive"
    );

    if (!user) {
      return res.status(401).json({
        message: "User account not found",
      });
    }

    // Block old tokens belonging to deactivated customers
    if (user.isActive === false) {
      return res.status(403).json({
        message: "Your account has been deactivated",
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Access denied! Admin only",
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
};
