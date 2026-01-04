const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');

// --- 1. GET Single Course ---
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 2. GET All Courses (Catalog) ---
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/publish', async (req, res) => {
  try {
    const { _id, title, description, price, modules, isPublished, adminSecret } = req.body;

    // Security check (Keep your existing check)
    if (adminSecret !== process.env.ADMIN_SECRET && adminSecret !== "doneswari_admin_2025") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (_id) {
      // IF ID EXISTS -> UPDATE THE DRAFT
      const updated = await Course.findByIdAndUpdate(_id, {
        title, description, price, modules, isPublished
      }, { new: true });
      return res.json(updated);
    } else {
      // IF NO ID -> CREATE NEW COURSE
      const newCourse = new Course({ title, description, price, modules, isPublished });
      await newCourse.save();
      return res.json(newCourse);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

    // ✅ SAFE enrollment lookup
    const enrollment = user.enrolledCourses.find(
      e =>
        e.courseId &&
        e.courseId._id.toString() === courseId.toString()
    );

    if (!enrollment) {
      return res.status(404).json({ msg: "Enrollment not found" });
    }

    // ✅ Add topic only once
    if (!enrollment.completedTopics.includes(topicId)) {
      enrollment.completedTopics.push(topicId);
    }

    const course = enrollment.courseId;

    // 🔢 Count ONLY modules 1–5
    let totalCourseTopics = 0;
    course.modules.slice(0, 5).forEach(module => {
      totalCourseTopics += module.topics.length;
    });

    // ✅ Auto-complete course
    if (
      enrollment.completedTopics.length >= totalCourseTopics &&
      !enrollment.courseCompleted
    ) {
      enrollment.courseCompleted = true;
      enrollment.courseCertificateIssued = true;
      enrollment.internshipUnlocked = true; // optional
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
    console.error("Complete Topic Error:", err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;