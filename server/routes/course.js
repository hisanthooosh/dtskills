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

// --- 4. MARK TOPIC AS COMPLETE (FIXED & SAFER) ---
router.post('/complete-topic', async (req, res) => {
  const { userId, courseId, topicId } = req.body;

  if (!userId || !courseId || !topicId) {
    return res.status(400).json({ msg: "Missing Data" });
  }

  try {
    // 1. Try to find the user and specific enrollment
    const user = await User.findOne({ _id: userId, "enrolledCourses.courseId": courseId });

    if (user) {
      // SCENARIO A: User is already enrolled. Add topic to completedTopics.
      // $addToSet ensures we don't add the same topicId twice
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, "enrolledCourses.courseId": courseId },
        {
          $addToSet: {
            "enrolledCourses.$.completedTopics": topicId
          }
        },
        { new: true } // Return the updated document
      );
      return res.json({ msg: "Progress saved", progress: updatedUser.enrolledCourses });
    } else {
      // SCENARIO B: User is NOT enrolled yet. Enroll them + Add topic.
      const newUserUpdate = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            enrolledCourses: {
              courseId: courseId,
              completedTopics: [topicId],
              enrolledAt: new Date()
            }
          }
        },
        { new: true }
      );
      return res.json({ msg: "Enrolled & Progress saved", progress: newUserUpdate.enrolledCourses });
    }

  } catch (err) {
    console.error("Complete Topic Error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;