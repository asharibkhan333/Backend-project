const User = require("../models/user");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

// Cloudinary upload helper
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

// GET LOGGED-IN CUSTOMER PROFILE
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.id,
      role: "customer",
    });

    if (!user) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      customer: {
        id: user._id,
        name: user.name,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        userName: user.userName || "",
        email: user.email,
        phone: user.phone || "",
        countryCode: user.countryCode || "",
        avatar: user.avatar || "",
        address: user.address || "",
        pinCode: user.pinCode || "",
        city: user.city || "",
        country: user.country || "",
        notes: user.notes || "",
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Failed to load profile",
    });
  }
};

// UPDATE LOGGED-IN CUSTOMER PROFILE
const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.id,
      role: "customer",
    });

    if (!user) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "userName",
      "phone",
      "countryCode",
      "address",
      "pinCode",
      "city",
      "country",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            message: `${field} must be a string`,
          });
        }

        user[field] = req.body[field].trim();
      }
    }

    if (
      req.body.firstName !== undefined ||
      req.body.lastName !== undefined
    ) {
      if (!user.firstName || !user.lastName) {
        return res.status(400).json({
          message: "First name and last name are required",
        });
      }

      user.name = `${user.firstName} ${user.lastName}`.trim();
    }

    // New profile image upload
    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file);

      user.avatar = uploadedImage.secure_url;
    }

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      customer: {
        id: user._id,
        name: user.name,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        userName: user.userName || "",
        email: user.email,
        phone: user.phone || "",
        countryCode: user.countryCode || "",
        avatar: user.avatar || "",
        address: user.address || "",
        pinCode: user.pinCode || "",
        city: user.city || "",
        country: user.country || "",
        notes: user.notes || "",
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};
