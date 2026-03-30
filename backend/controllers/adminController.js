const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sanitizeHtml = require("sanitize-html");
const db = require("../config/db");
const crypto = require("crypto");

function cleanInput(input) {
    if (!input) return null;
    return sanitizeHtml(input.trim(), { allowedTags: [], allowedAttributes: {} });
}

const registerAdmin = async (req, res) => {
    try {
        const adminSecret = req.body.adminSecret?.trim();
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.status(401).json({ success: false, message: "Invalid Admin Token" });
        }

        const name = cleanInput(req.body.name);
        const email = cleanInput(req.body.email)?.toLowerCase();
        const password = req.body.password?.trim();

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email, and password are required" });
        }

        if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/.test(password)) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 chars, contain 1 number and 1 special character" });
        }

        const [existing] = await db.query("SELECT id FROM admins WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Admin with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO admins (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

        res.status(201).json({ success: true, message: "Admin registered successfully" });
    } catch (err) {
        console.error("Admin Register Error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const email = cleanInput(req.body.email)?.toLowerCase();
        const password = req.body.password?.trim();

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        const [result] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);
        if (result.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid Email or Password" });
        }

        const admin = result[0];
        const match = await bcrypt.compare(password, admin.password);

        if (match) {
            const token = jwt.sign(
                { id: admin.id, email: admin.email, role: 'admin' },
                process.env.JWT_SECRET || "super_secret_jwt_key_that_should_be_long_and_random",
                { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
            );

            res.json({
                success: true,
                message: "Admin Login Successful",
                token,
                user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid Email or Password" });
        }
    } catch (err) {
        console.error("Admin Login Error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const email = cleanInput(req.body.email)?.toLowerCase();
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const [result] = await db.query("SELECT id FROM admins WHERE email = ?", [email]);
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Admin does not exist" });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Expiry in 15 minutes. Create a formatted YYYY-MM-DD HH:MM:SS for MySQL DATETIME
        const expiryDate = new Date(Date.now() + 15 * 60 * 1000);
        const mysqlDatetime = expiryDate.toISOString().slice(0, 19).replace('T', ' ');

        await db.query("UPDATE admins SET reset_token = ?, reset_token_expiry = ? WHERE email = ?", [resetToken, mysqlDatetime, email]);

        // Return token to frontend for the next step 
        res.json({ success: true, message: "Token generated", token: resetToken });
    } catch (err) {
        console.error("Verify Email Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const email = cleanInput(req.body.email)?.toLowerCase();
        const { token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({ success: false, message: "Email, token, and new password are required" });
        }

        if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/.test(newPassword)) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 chars, contain 1 number and 1 special character" });
        }

        const [result] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);
        if (result.length === 0) return res.status(404).json({ success: false, message: "Admin not found" });

        const admin = result[0];
        if (admin.reset_token !== token) {
            return res.status(400).json({ success: false, message: "Invalid reset token" });
        }

        if (new Date() > new Date(admin.reset_token_expiry)) {
            return res.status(400).json({ success: false, message: "Reset token has expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE admins SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?", [hashedPassword, email]);

        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { registerAdmin, loginAdmin, verifyEmail, resetPassword };
