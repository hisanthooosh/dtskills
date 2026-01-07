const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course'); // Needed for population
// 🔒 ADMIN: Get all students
router.get('/', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .populate('enrolledCourses.courseId');

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Student Profile with Enrolled Courses Populated
router.get('/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .populate({
        path: 'enrolledCourses.courseId',
        select: 'title modules' // We need title and modules to calculate progress
      });

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Filter out any enrollments where the course might have been deleted from DB
    student.enrolledCourses = student.enrolledCourses.filter(e => e.courseId !== null);

    res.json(student);
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;