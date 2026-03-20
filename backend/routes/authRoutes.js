const express = require("express");
const router = express.Router();
const { login, resetPassword, verifyEmail } = require("../controllers/authController");

router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/reset-password", resetPassword);

module.exports = router;
