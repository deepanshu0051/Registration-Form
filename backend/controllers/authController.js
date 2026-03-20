const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sanitizeHtml = require("sanitize-html");
const db = require("../config/db");

function cleanInput(input) {
    if (!input) return null;
    return sanitizeHtml(input.trim(), { allowedTags: [], allowedAttributes: {} });
}

// @desc    Login user / Admin
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const email = cleanInput(req.body.email)?.toLowerCase();
        const password = req.body.password?.trim();

        const gmailRegex = /^[a-z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Only Gmail address allowed" });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: "Password required" });
        }

        const [result] = await db.query("SELECT * FROM students WHERE email=?", [email]);
        
        if (result.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid Email or Password" });
        }

        const user = result[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const token = jwt.sign(
                { id: user.id, username: user.username }, 
                process.env.JWT_SECRET || "super_secret_jwt_key_that_should_be_long_and_random", 
                { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
            );
            
            res.json({
                success: true,
                message: "Login Successful",
                token,
                user: { id: user.id, name: user.name, email: user.email, username: user.username }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid Email or Password" });
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const email = cleanInput(req.body.email)?.toLowerCase();
        const password = req.body.password?.trim();
        const confirmPassword = req.body.confirmPassword?.trim();

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: "Email and passwords are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query("UPDATE students SET password=? WHERE email=?", [hashedPassword, email]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Email not found" });
        }

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Verify Email before Reset Password
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const email = cleanInput(req.body.email)?.toLowerCase();

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const [result] = await db.query("SELECT id FROM students WHERE email = ?", [email]);

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "User does not exist" });
        }

        res.json({ success: true, message: "User exists" });
    } catch (err) {
        console.error("Verify Email Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { login, resetPassword, verifyEmail };
