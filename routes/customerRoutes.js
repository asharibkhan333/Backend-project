
const express = require("express");
const router = express.Router();

const {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deactivateCustomer,
  activateCustomer,
} = require("../controllers/customerControllers");

const {
  protect,
  adminOnly,
} = require("../middleware/authmiddleware");

// All customer management routes are admin-only
router.use(protect, adminOnly);

router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.patch("/:id/deactivate", deactivateCustomer);
router.patch("/:id/activate", activateCustomer);

module.exports = router;
