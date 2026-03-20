const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "@51harmandeep",
    database: process.env.DB_NAME || "student_app_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("MySQL Connected Successfully");
        connection.release();
    } catch (error) {
        console.error("DB connection failed", error);
    }
})();

module.exports = pool;
