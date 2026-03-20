const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Security Middleware
app.use(helmet());

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use("/api/", apiLimiter);

// Parse JSON explicitly and configure CORS
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // VITE default port
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
    console.log(`Server running securely on http://localhost:${PORT}`);
});
