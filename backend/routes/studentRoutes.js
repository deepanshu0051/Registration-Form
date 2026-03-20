const express = require("express");
const router = express.Router();
const { registerStudent, getStudents, updateStudent, deleteStudent } = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");

// Public route for student registration
router.post("/register", registerStudent);

// Protected routes for Admin Dashboard
router.route("/")
    .get(protect, getStudents);

router.route("/:id")
    .put(protect, updateStudent)
    .delete(protect, deleteStudent);

module.exports = router;
