const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course'); // Needed for population
const AicteInternship = require('../models/AicteInternship');


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

// 👤 GET Student Profile with Enrolled Courses
router.get('/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .populate({
        path: 'enrolledCourses.courseId',
        select: 'title modules'
      });

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Remove broken enrollments
    student.enrolledCourses = student.enrolledCourses.filter(
      e => e.courseId !== null
    );

    res.json(student);
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).send('Server Error');
  }
});

/**
 * =========================================
 * 🎓 STUDENT – SUBMIT AICTE ID (AUTO VERIFY)
 * =========================================
 */
router.post('/submit-aicte-id', async (req, res) => {
  try {
    const { studentId, courseId, aicteInternshipId } = req.body;

    if (!studentId || !courseId || !aicteInternshipId) {
      return res.status(400).json({
        message: 'studentId, courseId and AICTE ID are required'
      });
    }

    // 1️⃣ Get student
    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 2️⃣ Find enrollment
    const enrollment = user.enrolledCourses.find(
      e => e.courseId.toString() === courseId
    );
    // 🔒 Ensure course is completed first
    if (!enrollment.courseCompleted) {
      return res.status(403).json({
        message: 'Complete Modules 1–5 before AICTE verification'
      });
    }


    if (!enrollment) {
      return res.status(404).json({
        message: 'Course enrollment not found'
      });
    }

    // 3️⃣ Find AICTE record entered by admin
    const record = await AicteInternship.findOne({
      aicteInternshipId: aicteInternshipId.trim()
    });

    if (!record) {
      return res.status(400).json({
        message: 'Invalid AICTE Internship ID'
      });
    }

    // 4️⃣ Match email
    if (record.email !== user.email.toLowerCase()) {
      return res.status(400).json({
        message: 'AICTE ID does not match your email'
      });
    }

    // 5️⃣ Match course
    if (record.courseId.toString() !== courseId) {
      return res.status(400).json({
        message: 'AICTE ID not valid for this course'
      });
    }

    // 6️⃣ Check if already used
    if (record.isUsed) {
      return res.status(400).json({
        message: 'This AICTE ID is already used'
      });
    }

    // ✅ SUCCESS: Mark record as used
    record.isUsed = true;
    record.usedByStudentId = user._id;
    await record.save();

    // ✅ Unlock internship in student enrollment
    enrollment.aicteInternshipId = record.aicteInternshipId;
    enrollment.aicteVerified = true;
    enrollment.internshipUnlocked = true;
    enrollment.internshipVerifiedAt = new Date();

    await user.save();

    res.json({
      message: 'AICTE Internship verified. Internship unlocked successfully.'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to verify AICTE Internship ID'
    });
  }
});
/**
 * =========================================
 * 🎓 STUDENT — ENROLL IN COURSE
 * =========================================
 */
router.post('/enroll', async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({
        message: 'userId and courseId are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Prevent duplicate enrollment
    const alreadyEnrolled = user.enrolledCourses.some(
      e => e.courseId.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        message: 'Student already enrolled in this course'
      });
    }

    user.enrolledCourses.push({
      courseId,
      completedTopics: [],
      courseCompleted: false,
      internshipUnlocked: false
    });

    await user.save();

    res.json({
      message: 'Enrollment successful'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to enroll in course'
    });
  }
});

module.exports = router;
