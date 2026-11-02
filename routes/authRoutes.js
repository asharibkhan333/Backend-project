const express = require("express");
const router = express.Router();

const {
  signup,
  login,
} = require("../controllers/authControllers");

const upload = require("../middleware/upload");

router.post("/signup", upload.single("avatar"), signup);

router.post("/login", login);

module.exports = router;
