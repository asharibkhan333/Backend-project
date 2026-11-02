const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/profileControllers");

const { protect } = require("../middleware/authmiddleware");
const upload = require("../middleware/upload");

router.use(protect);

router.get("/me", getMyProfile);

router.put(
  "/me",
  upload.single("avatar"),
  updateMyProfile
);

module.exports = router;
