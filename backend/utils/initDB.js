const db = require("../config/db");

const initDB = async () => {
    try {
        console.log("Verifying database schema...");
        
        // 1. Verify students table and add missing columns
        const [studentTableCheck] = await db.query("SHOW TABLES LIKE 'students'");
        
        if (studentTableCheck.length > 0) {
            const columnsToAdd = [
                { name: 'course', type: 'VARCHAR(255) DEFAULT NULL' },
                { name: 'year', type: 'VARCHAR(20) DEFAULT NULL' },
                { name: 'attendance', type: 'INT DEFAULT 0' },
                { name: 'total_fees', type: 'INT DEFAULT 0' },
                { name: 'fees_paid', type: 'INT DEFAULT 0' },
                { name: 'remaining_fees', type: 'INT DEFAULT 0' },
                { name: 'bus_charge', type: 'INT DEFAULT 0' },
                { name: 'fine', type: 'INT DEFAULT 0' }
            ];

            for (const col of columnsToAdd) {
                try {
                    const [rows] = await db.query(`SHOW COLUMNS FROM students LIKE '${col.name}'`);
                    if (rows.length === 0) {
                        await db.query(`ALTER TABLE students ADD COLUMN ${col.name} ${col.type}`);
                        console.log(`Added missing column '${col.name}' to students table.`);
                    }
                } catch (err) {
                    console.error(`Error verifying/adding column '${col.name}':`, err.message);
                }
            }
        } else {
            console.log("Note: 'students' table does not exist yet. Please create it first.");
        }

        // 2. Create Admins table if it doesn't exist
        const createAdminsTable = `
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                reset_token VARCHAR(255) DEFAULT NULL,
                reset_token_expiry DATETIME DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(createAdminsTable);
        
        const adminColumnsToAdd = [
            { name: 'reset_token', type: 'VARCHAR(255) DEFAULT NULL' },
            { name: 'reset_token_expiry', type: 'DATETIME DEFAULT NULL' }
        ];

        for (const col of adminColumnsToAdd) {
            try {
                const [rows] = await db.query(`SHOW COLUMNS FROM admins LIKE '${col.name}'`);
                if (rows.length === 0) {
                    await db.query(`ALTER TABLE admins ADD COLUMN ${col.name} ${col.type}`);
                    console.log(`Added missing column '${col.name}' to admins table.`);
                }
            } catch (err) {
                console.error(`Error verifying/adding column '${col.name}':`, err.message);
            }
        }
        
        console.log("Verified 'admins' table structure.");
        
        console.log("Database schema validation completed successfully.");
    } catch (error) {
        console.error("Database schema verification failed:", error);
    }
};

module.exports = initDB;
