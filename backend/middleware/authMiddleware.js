const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            console.error("JWT Verification Error:", error.message);
            return res.status(401).json({ success: false, message: "Not authorized. Token failed." });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized. No token provided." });
    }
};

module.exports = { protect };
