const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course'); // Ensure Course model is loaded

// GET Student Profile with Enrolled Courses Populated
router.get('/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .populate({
        path: 'enrolledCourses.courseId',
        select: 'title modules' // We need title and modules for progress calc
      });

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Filter out any enrollments where the course was deleted (null courseId)
    student.enrolledCourses = student.enrolledCourses.filter(e => e.courseId !== null);

    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;