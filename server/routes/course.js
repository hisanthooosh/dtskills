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
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * =========================================
 * PUBLIC — GET SINGLE COURSE
 * ⚠️ MUST BE LAST (VERY IMPORTANT)
 * =========================================
 */
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * =========================================
 * ADMIN — CREATE / UPDATE COURSE (PUBLISH)
 * =========================================
 */
router.post(
  '/publish',
  adminAuth,
  requireRole(['super_admin', 'course_admin']),
  async (req, res) => {
    try {
      const {
        _id,
        title,
        description,
        price,
        modules,
        isPublished,
        adminSecret
      } = req.body;

      if (
        adminSecret !== process.env.ADMIN_SECRET &&
        adminSecret !== "doneswari_admin_2025"
      ) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (_id) {
        const updated = await Course.findByIdAndUpdate(
          _id,
          { title, description, price, modules, isPublished },
          { new: true }
        );
        return res.json(updated);
      } else {
        const newCourse = new Course({
          title,
          description,
          price,
          modules,
          isPublished
        });
        await newCourse.save();
        return res.json(newCourse);
      }
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
