const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sanitizeHtml = require("sanitize-html");
const db = require("../config/db");

function cleanInput(input) {
    if (!input) return null;
    return sanitizeHtml(input.trim(), { allowedTags: [], allowedAttributes: {} });
}

// @desc    Register new student
// @route   POST /api/students/register
// @access  Public
const registerStudent = async (req, res) => {
    try {
        const { isd, pincode, dob } = req.body;
        
        const cleanName = cleanInput(req.body.name) || "";
        const cleanEmail = cleanInput(req.body.email)?.toLowerCase() || "";
        const cleanUsername = cleanInput(req.body.username) || "";
        const cleanPassword = req.body.password ? req.body.password.trim() : "";
        const cleanConfirmPassword = req.body.confirmPassword ? req.body.confirmPassword.trim() : "";
        const cleanAddress = cleanInput(req.body.address);
        const cleanCity = cleanInput(req.body.city);
        const cleanState = cleanInput(req.body.state);
        const cleanCountry = cleanInput(req.body.country);

        if (!cleanName || !cleanEmail || !cleanUsername || !cleanPassword || !cleanConfirmPassword) {
            return res.status(400).json({ success: false, message: "All required fields are mandatory" });
        }
        if (cleanName.length < 4) {
            return res.status(400).json({ success: false, message: "Name must be at least 4 characters" });
        }
        if (cleanUsername.includes(" ")) {
            return res.status(400).json({ success: false, message: "Username cannot contain spaces" });
        }
        if (cleanPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }
        if (cleanPassword !== cleanConfirmPassword) {
            return res.status(400).json({ success: false, message: "Password and Confirm Password must match" });
        }

        const hashedPassword = await bcrypt.hash(cleanPassword, 10);

        const [checkResult] = await db.query("SELECT * FROM students WHERE email = ? OR username = ?", [cleanEmail, cleanUsername]);
        if (checkResult.length > 0) {
            return res.status(400).json({ success: false, message: "Email or Username already exists" });
        }

        const sql = `INSERT INTO students (name, isd, email, address, pincode, city, state, country, dob, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [insertResult] = await db.query(sql, [
            cleanName, isd, cleanEmail, cleanAddress, pincode, cleanCity, cleanState, cleanCountry, dob, cleanUsername, hashedPassword
        ]);

        const token = jwt.sign(
            { id: insertResult.insertId, username: cleanUsername },
            process.env.JWT_SECRET || "super_secret_jwt_key_that_should_be_long_and_random",
            { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        );

        res.status(201).json({ 
            success: true, 
            message: "Student Registered Successfully",
            token,
            user: { id: insertResult.insertId, name: cleanName, email: cleanEmail, username: cleanUsername }
        });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
    try {
        const sql = `SELECT id, name, isd, email, address, pincode, city, state, country, dob, username, created_at FROM students`;
        const [result] = await db.query(sql);
        res.json({ success: true, students: result });
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = async (req, res) => {
    try {
        const id = req.params.id;
        const cleanName = cleanInput(req.body.name)?.trim();
        const cleanEmail = cleanInput(req.body.email)?.toLowerCase().trim();
        const cleanCity = cleanInput(req.body.city)?.trim();
        const cleanUsername = cleanInput(req.body.username)?.trim();
        
        if (!cleanName || !cleanEmail || !cleanCity || !cleanUsername) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        if (!/^[A-Za-z ]{4,}$/.test(cleanName)) {
            return res.status(400).json({ success: false, message: "Name must contain only letters & minimum 4 characters" });
        }
        if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(cleanEmail)) {
            return res.status(400).json({ success: false, message: "Only valid Gmail address allowed" });
        }
        if (!/^[A-Za-z0-9]{4,}$/.test(cleanUsername)) {
            return res.status(400).json({ success: false, message: "Username must be letters & numbers only (min 4 chars)" });
        }
        if (cleanUsername.includes("@")) {
            return res.status(400).json({ success: false, message: "Username cannot contain @" });
        }

        const allowedCities = ["Noida", "Delhi", "Mumbai", "Jaipur", "Lucknow", "Indore", "New Delhi", "Amritsar", "Varansi", "Surat", "Banglore", "Srinagar", "Hyderabad", "Bhopal", "Agra"];
        if (!allowedCities.includes(cleanCity)) {
            return res.status(400).json({ success: false, message: "Invalid city selected" });
        }

        const sql = `UPDATE students SET name = ?, email = ?, city = ?, username = ? WHERE id = ?`;
        await db.query(sql, [cleanName, cleanEmail, cleanCity, cleanUsername, id]);

        res.json({ success: true, message: "Student updated successfully" });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ success: false, message: "Update failed" });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = async (req, res) => {
    try {
        const id = req.params.id;
        await db.query(`DELETE FROM students WHERE id = ?`, [id]);
        res.json({ success: true, message: "Student deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ success: false, message: "Delete failed" });
    }
};

module.exports = { registerStudent, getStudents, updateStudent, deleteStudent };
