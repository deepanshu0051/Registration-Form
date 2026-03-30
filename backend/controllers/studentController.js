const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sanitizeHtml = require("sanitize-html");
const db = require("../config/db");

function cleanInput(input) {
    if (!input) return null;
    return sanitizeHtml(input.trim(), { allowedTags: [], allowedAttributes: {} });
}

// POST
const registerStudent = async (req, res) => {
    try {
        const { phone, course, year } = req.body;
        
        const cleanName = cleanInput(req.body.name) || "";
        const cleanEmail = cleanInput(req.body.email)?.toLowerCase() || "";
        const cleanPassword = req.body.password ? req.body.password.trim() : "";
        const cleanConfirmPassword = req.body.confirmPassword ? req.body.confirmPassword.trim() : "";
        const cleanCity = cleanInput(req.body.city);

        if (!cleanName || !cleanEmail || !cleanPassword || !cleanConfirmPassword) {
            return res.status(400).json({ success: false, message: "All required fields are mandatory" });
        }
        if (cleanName.length < 4) {
            return res.status(400).json({ success: false, message: "Name must be at least 4 characters" });
        }
        if (cleanPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }
        if (cleanPassword !== cleanConfirmPassword) {
            return res.status(400).json({ success: false, message: "Password and Confirm Password must match" });
        }

        const hashedPassword = await bcrypt.hash(cleanPassword, 10);

        const [checkResult] = await db.query("SELECT * FROM students WHERE email = ?", [cleanEmail]);
        if (checkResult.length > 0) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        const sql = `INSERT INTO students (name, email, phone, city, course, year, password) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [insertResult] = await db.query(sql, [
            cleanName, cleanEmail, phone, cleanCity, course, year, hashedPassword
        ]);

        const token = jwt.sign(
            { id: insertResult.insertId, email: cleanEmail },
            process.env.JWT_SECRET || "super_secret_jwt_key_that_should_be_long_and_random",
            { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        );

        res.status(201).json({ 
            success: true, 
            message: "Student Registered Successfully",
            token,
            student_id: insertResult.insertId,
            user: { id: insertResult.insertId, name: cleanName, email: cleanEmail }
        });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
};

// GET
const getStudents = async (req, res) => {
    try {
        const sql = `SELECT id, name, phone, email, city, course, year, attendance, total_fees, fees_paid, remaining_fees, fine, bus_charge, created_at FROM students`;
        const [result] = await db.query(sql);
        res.json({ success: true, students: result });
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// PUT
const updateStudent = async (req, res) => {
    try {
        const id = req.params.id;
        const cleanName = cleanInput(req.body.name)?.trim();
        const cleanEmail = cleanInput(req.body.email)?.toLowerCase().trim();
        const cleanCity = cleanInput(req.body.city)?.trim();
        const phone = cleanInput(req.body.phone)?.trim();
        const course = cleanInput(req.body.course)?.trim();
        const year = cleanInput(req.body.year)?.trim();
        
        const [existingStudent] = await db.query("SELECT * FROM students WHERE id = ?", [id]);
        if (existingStudent.length === 0) return res.status(404).json({ success: false, message: "Student not found" });

        const attendance = req.body.attendance !== undefined ? parseInt(req.body.attendance, 10) : existingStudent[0].attendance;
        const total_fees = req.body.total_fees !== undefined ? parseInt(req.body.total_fees, 10) : existingStudent[0].total_fees;
        const fees_paid = req.body.fees_paid !== undefined ? parseInt(req.body.fees_paid, 10) : existingStudent[0].fees_paid;
        const bus_charge = req.body.bus_charge !== undefined ? parseInt(req.body.bus_charge, 10) : existingStudent[0].bus_charge;
        const fine = req.body.fine !== undefined ? parseInt(req.body.fine, 10) : existingStudent[0].fine;
        
        const remaining_fees = Math.max(total_fees - fees_paid, 0);
        
        if (!cleanName || !cleanEmail || !cleanCity) {
            return res.status(400).json({ success: false, message: "Name, Email and City are required" });
        }
        if (!/^[A-Za-z ]{4,}$/.test(cleanName)) {
            return res.status(400).json({ success: false, message: "Name must contain only letters & minimum 4 characters" });
        }
        if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(cleanEmail)) {
            return res.status(400).json({ success: false, message: "Only valid Gmail address allowed" });
        }

        const allowedCities = ["Noida", "Delhi", "Mumbai", "Jaipur", "Lucknow", "Indore", "New Delhi", "Amritsar", "Varansi", "Surat", "Banglore", "Srinagar", "Hyderabad", "Bhopal", "Agra"];
        
        const finalCity = (!cleanCity || cleanCity === "" || cleanCity === existingStudent[0].city) ? existingStudent[0].city : cleanCity;

        if (finalCity !== existingStudent[0].city && !allowedCities.includes(finalCity)) {
            return res.status(400).json({ success: false, message: "Invalid city selected" });
        }

        const sql = `UPDATE students SET name = ?, email = ?, phone = ?, city = ?, course = ?, year = ?, attendance = ?, total_fees = ?, fees_paid = ?, remaining_fees = ?, bus_charge = ?, fine = ? WHERE id = ?`;
        await db.query(sql, [
            cleanName || existingStudent[0].name, 
            cleanEmail || existingStudent[0].email, 
            phone || existingStudent[0].phone, 
            finalCity, 
            course || existingStudent[0].course, 
            year || existingStudent[0].year, 
            attendance, total_fees, fees_paid, remaining_fees, bus_charge, fine, id
        ]);

        res.json({ success: true, message: "Student updated successfully" });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ success: false, message: "Update failed" });
    }
};

// DELETE
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

// GET BY ID
const getStudentById = async (req, res) => {
    try {
        const id = req.params.id;
        const sql = `SELECT * FROM students WHERE id = ?`;
        const [result] = await db.query(sql, [id]);
        
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        res.json({ success: true, student: result[0] });
    } catch (err) {
        console.error("Fetch Student Error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = { registerStudent, getStudents, getStudentById, updateStudent, deleteStudent };
