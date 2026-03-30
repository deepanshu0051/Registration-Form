const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, verifyEmail, resetPassword } = require("../controllers/adminController");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/verify-email", verifyEmail);
router.post("/reset-password", resetPassword);

module.exports = router;
