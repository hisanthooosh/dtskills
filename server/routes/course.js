const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');

const adminAuth = require('../middleware/adminAuth');
const requireRole = require('../middleware/adminRole');

/**
 * =========================================
 * ADMIN — GET ALL COURSES (DRAFT + PUBLISHED)
 * =========================================
 * USED BY: AdminDashboard → Manage Courses
 */
router.get(
  '/admin/all',
  adminAuth,
  requireRole(['super_admin', 'course_admin']),
  async (req, res) => {
    try {
      const courses = await Course.find().sort({ createdAt: -1 });
      res.json(courses);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * =========================================
 * PUBLIC — GET ALL COURSES (CATALOG)
 * =========================================
 */
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ status: 'published' }).lean();

    // 🔥 NORMALIZE QUIZ DATA FOR ALL COURSES
    const normalizedCourses = courses.map(course => ({
      ...course,
      modules: (course.modules || []).map(module => ({
        ...module,
        topics: (module.topics || []).map(topic => ({
          ...topic,
          quiz: Array.isArray(topic.quiz)
            ? topic.quiz
            : Array.isArray(topic.quizzes)
              ? topic.quizzes
              : []
        }))
      }))
    }));

    res.json(normalizedCourses);
  } catch (err) {
    console.error('GET /courses error:', err);
    res.status(500).json({ error: err.message });
  }
});


// @route   GET api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // 1. Use .lean() so we can modify the object before sending it
    const course = await Course.findById(req.params.id).lean();

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // 2. FIX: Normalize 'quiz' vs 'quizzes' fields safely
    if (course.modules) {
      course.modules.forEach(module => {
        if (module.topics) {
          module.topics.forEach(topic => {
            // Check if the NEW field 'quiz' exists and actually has questions
            // ✅ SAFE NORMALIZATION — DO NOT ERASE DATA
            if (Array.isArray(topic.quiz)) {
              // keep as-is
            } else if (Array.isArray(topic.quizzes)) {
              topic.quiz = topic.quizzes;
            } else {
              topic.quiz = [];
            }

          });
        }
      });
    }

    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * =========================================
 * ADMIN — CREATE / UPDATE COURSE (PUBLISH)
 * =========================================
 */

router.post(
  '/draft',
  adminAuth,
  requireRole(['super_admin', 'course_admin']),
  async (req, res) => {
    try {
      const course = new Course({
        ...req.body,
        status: 'draft',
        isPublished: false
      });

      await course.save();
      res.json(course);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);
router.put(
  '/:id/draft',
  adminAuth,
  requireRole(['super_admin', 'course_admin']),
  async (req, res) => {
    try {
      const course = await Course.findByIdAndUpdate(
        req.params.id,
        { ...req.body, status: 'draft', isPublished: false },
        { new: true }
      );

      res.json(course);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);
router.put(
  '/:id/publish',
  adminAuth,
  requireRole(['super_admin', 'course_admin']),
  async (req, res) => {
    try {
      const course = await Course.findByIdAndUpdate(
        req.params.id,
        {
          status: 'published',
          isPublished: true
        },
        { new: true }
      );

      res.json(course);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * =========================================
 * STUDENT — COMPLETE TOPIC
 * =========================================
 */
router.post('/complete-topic', async (req, res) => {
  const { userId, courseId, topicId } = req.body;

  if (!userId || !courseId || !topicId) {
    return res.status(400).json({ msg: "Missing Data" });
  }

  try {
    const user = await User.findById(userId).populate(
      'enrolledCourses.courseId'
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const enrollment = user.enrolledCourses.find(
      e =>
        e.courseId &&
        e.courseId._id.toString() === courseId.toString()
    );

    if (!enrollment) {
      return res.status(404).json({ msg: "Enrollment not found" });
    }

    if (!Array.isArray(enrollment.completedTopics)) {
      enrollment.completedTopics = [];
    }

    if (!enrollment.completedTopics.includes(topicId)) {
      enrollment.completedTopics.push(topicId);
    }

    const course = enrollment.courseId;

    let totalCourseTopics = 0;
    course.modules.slice(0, 5).forEach(module => {
      totalCourseTopics += module.topics.length;
    });

    const completedCourseTopics = enrollment.completedTopics.filter(tid =>
      course.modules
        .slice(0, 5)
        .some(m =>
          m.topics.some(t => t._id.toString() === tid)
        )
    );

    if (
      completedCourseTopics.length >= totalCourseTopics &&
      !enrollment.courseCompleted
    ) {
      enrollment.courseCompleted = true;
      enrollment.courseCertificateIssued = true;
      enrollment.offerLetterIssued = true;
    }

    await user.save();

    res.json({
      success: true,
      completedCount: enrollment.completedTopics.length,
      totalCourseTopics,
      courseCompleted: enrollment.courseCompleted,
      certificateIssued: enrollment.courseCertificateIssued
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * =========================================
 * ADMIN — DELETE COURSE
 * =========================================
 */
router.delete(
  '/:id',
  adminAuth,
  requireRole(['super_admin', 'course_admin']),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      await course.deleteOne();
      res.json({ message: 'Course deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
