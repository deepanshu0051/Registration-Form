const express = require("express");
const app = express();
const path = require("path");
const db = require("./db");
const cors = require("cors");
const bcrypt = require("bcrypt");
const sanitizeHtml = require("sanitize-html");

// JSON data allow karna
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// public folder ko access dena
app.use(express.static(path.join(__dirname, "public")));

// home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

function cleanInput(input) {
    if (!input) return null;

    return sanitizeHtml(input.trim(), {
        allowedTags: [],       // koi HTML tag allow nahi
        allowedAttributes: {}  // koi attribute allow nahi
    });
}

// ================= REGISTER API =================
app.post("/register", async (req, res) => {

    const {
        name,
        isd,
        email,
        address,
        pincode,
        city,
        state,
        country,
        dob,
        username,
        password,
        confirmPassword
    } = req.body;

// ===== SANITIZATION =====
const cleanName = cleanInput(name) || "";
const cleanEmail = cleanInput(email)?.toLowerCase() || "";
const cleanUsername = cleanInput(username) || "";

const cleanPassword = password ? password.trim() : "";
const cleanConfirmPassword = confirmPassword ? confirmPassword.trim() : "";

const cleanAddress = cleanInput(address);
const cleanCity = cleanInput(city);
const cleanState = cleanInput(state);
const cleanCountry = cleanInput(country);

// ===== REQUIRED FIELD CHECK =====
if (!cleanName || !cleanEmail || !cleanUsername || !cleanPassword || !cleanConfirmPassword) {
    return res.status(400).json({
        success: false,
        message: "All required fields are mandatory ❌"
    });
}
    // ===== LENGTH VALIDATION =====
    if (cleanName.length < 4) {
        return res.status(400).json({
            success: false,
            message: "Name must be at least 4 characters ❌"
        });
    }

    if (cleanUsername.includes(" ")) {
    return res.status(400).json({
        success: false,
        message: "Username cannot contain spaces ❌"
    });
}

    if (cleanPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters ❌"
        });
    }

    if (cleanPassword !== cleanConfirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Password and Confirm Password must match ❌"
        });
    }

    // ===== HASH PASSWORD (VALIDATION KE BAAD) =====
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    // ===== DUPLICATE CHECK =====
    const checkSql = `
        SELECT * FROM students 
        WHERE email = ? OR username = ?
    `;

    db.query(checkSql, [cleanEmail, cleanUsername], (err, result) => {

        if (err) {
            console.log("DB Error ", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email or Username already exists"
            });
        }

        // ===== INSERT =====
        const sql = `
            INSERT INTO students 
            (name, isd, email, address, pincode, city, state, country, dob, username, password)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            cleanName,
            isd,
            cleanEmail,
            cleanAddress,
            pincode,
            cleanCity,
            cleanState,
            cleanCountry,
            dob,
            cleanUsername,
            hashedPassword
        ], (err, result) => {

            if (err) {
                console.log("DB Error ❌", err);
                return res.status(500).json({ message: "Database error" });
            }

            res.json({
                success: true,
                message: "Student Registered Successfully"
            });

        });
    });
});

// ===== UPDATE STUDENT WITH VALIDATION =====
app.put("/student/:id", (req, res) => {
   
    const id = req.params.id;
    const { name, email, city, username } = req.body;

    const cleanName = cleanInput(name)?.trim();
    const cleanEmail = cleanInput(email)?.toLowerCase().trim();
    const cleanCity = cleanInput(city)?.trim();
    const cleanUsername = cleanInput(username)?.trim();

    // ===== REQUIRED CHECK =====
    if (!cleanName || !cleanEmail || !cleanCity || !cleanUsername) {
        return res.status(400).json({
            success: false,
            message: "All fields are required ❌"
        });
    }

    // ===== NAME VALIDATION =====
    if (!/^[A-Za-z ]{4,}$/.test(cleanName)) {
        return res.status(400).json({
            success: false,
            message: "Name must contain only letters & minimum 4 characters ❌"
        });
    }

    // ===== EMAIL VALIDATION =====
    if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(cleanEmail)) {
        return res.status(400).json({
            success: false,
            message: "Only valid Gmail address allowed ❌"
        });
    }

    // ===== CITY VALIDATION =====
    const allowedCities = [
    "Noida",
    "Delhi",
    "Mumbai",
    "Jaipur",
    "Lucknow",
    "Indore",
    "New Delhi",
    "Amritsar",
    "Varansi",
    "Surat",
    "Banglore",
    "Srinagar",
    "Hyderabad",
    "Bhopal",
    "Agra"
];

if (!allowedCities.includes(cleanCity)) {
    return res.status(400).json({
        success: false,
        message: "Invalid city selected ❌"
    });
}

    // ===== USERNAME VALIDATION =====
    if (!/^[A-Za-z0-9]{4,}$/.test(cleanUsername)) {
        return res.status(400).json({
            success: false,
            message: "Username must be letters & numbers only (min 4 chars) ❌"
        });
    }

    if (cleanUsername.includes("@")) {
        return res.status(400).json({
            success: false,
            message: "Username cannot contain @ ❌"
        });
    }

    const sql = `
        UPDATE students
        SET name = ?, email = ?, city = ?, username = ?
        WHERE id = ?
    `;

    db.query(sql, [cleanName, cleanEmail, cleanCity, cleanUsername, id], (err) => {
        if(err){
            return res.status(500).json({
                success:false,
                message:"Update failed"
            });
        }

        res.json({
            success:true,
            message:"Student updated successfully ✅"
        });
    });
});

// ===== GET ALL STUDENTS (SECURE VERSION) =====
app.get("/students", (req, res) => {

    const sql = `
    SELECT id, name, isd, email, address, pincode, city, state, country, dob, username, created_at
    FROM students
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log("Fetch Error ❌", err);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }

        res.json({
            success: true,
            students: result
        });

    });

});
// ===== DELETE STUDENT =====
app.delete("/student/:id", (req, res) => {

    const id = req.params.id;

    const sql = `DELETE FROM students WHERE id = ?`;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log("Delete Error ❌", err);
            return res.status(500).json({
                success: false,
                message: "Delete failed"
            });
        }

        res.json({
            success: true,
            message: "Student deleted successfully"
        });
    });

});

//================LOGIN PAGE=========

// ===== LOGIN API WITH BCRYPT =====

app.post("/login",(req,res)=>{

const {email,password} = req.body;

const sql = "SELECT * FROM students WHERE email=?";

db.query(sql,[email],async(err,result)=>{

if(err){
return res.json({success:false,message:"Server error"});
}

if(result.length === 0){
return res.json({success:false,message:"Invalid Email or Password ❌"});
}

const user = result[0];

const match = await bcrypt.compare(password,user.password);

if(match){

res.json({
success:true,
message:"Login Successful ✅"
});

}else{

res.json({
success:false,
message:"Invalid Email or Password ❌"
});

}

});

});
// ===== RESET PASSWORD API =====

app.post("/reset-password", async (req, res) => {

const { email, newPassword } = req.body;

if(!email || !newPassword){
return res.json({
success:false,
message:"Email and New Password required ❌"
});
}

try{

// password hash
const hashedPassword = await bcrypt.hash(newPassword,10);

const sql = "UPDATE students SET password=? WHERE email=?";

db.query(sql,[hashedPassword,email],(err,result)=>{

if(err){
return res.json({
success:false,
message:"Database error"
});
}

if(result.affectedRows === 0){
return res.json({
success:false,
message:"Email not found ❌"
});
}

res.json({
success:true,
message:"Password updated successfully ✅"
});

});

}catch(error){

res.json({
success:false,
message:"Server error"
});

}

});


    // server start
app.listen(1000, () => {
    console.log("Server running on http://localhost:1000");
});
