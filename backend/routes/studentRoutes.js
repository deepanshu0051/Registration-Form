const express = require("express");
const router = express.Router();
const { registerStudent, getStudents, getStudentById, updateStudent, deleteStudent } = require("../controllers/studentController");
const { protect, protectAdmin } = require("../middleware/authMiddleware");

// Public route for student registration
router.post("/register", registerStudent);

// Protected routes for Admin Dashboard
router.route("/")
    .get(protectAdmin, getStudents);

router.route("/:id")
    .get(protect, getStudentById)
    .put(protectAdmin, updateStudent)
    .delete(protectAdmin, deleteStudent);

module.exports = router;
