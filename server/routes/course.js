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

// --- 3. PUBLISH COURSE (THE FIX IS HERE) ---
// We map the incoming data (video, content) to the schema (youtubeLinks, textContent)
router.post('/publish', async (req, res) => {
  const { title, description, price, modules, adminSecret } = req.body;

  if (adminSecret !== "doneswari_admin_2025") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    // DATA TRANSFORMATION LOGIC
    const formattedModules = modules.map(mod => ({
      title: mod.title,
      topics: mod.topics.map(topic => ({
        title: topic.title,
        // Fix 1: Map 'content' -> 'textContent'
        textContent: topic.content || topic.textContent,
        // Fix 2: Map single 'video' string -> 'youtubeLinks' Array
        youtubeLinks: topic.video ? [{ title: "Lesson Video", url: topic.video }] : [],
        // Fix 3: Map 'quizzes' -> 'quiz'
        quiz: topic.quizzes || topic.quiz || []
      }))
    }));

    const newCourse = new Course({
      title,
      description,
      price,
      modules: formattedModules // Save the Fixed Data
    });

    await newCourse.save();
    res.json(newCourse);
  } catch (err) {
    console.error("Publish Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- PASTE THIS IN server/routes/course.js ---

// 1. Mark Topic as Complete
router.post('/complete-topic', async (req, res) => {
  const { userId, courseId, topicId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Check if user is already enrolled in this course
    const enrollmentIndex = user.enrolledCourses.findIndex(
      (c) => c.courseId.toString() === courseId
    );

    if (enrollmentIndex === -1) {
      // If not enrolled, enroll them and add the topic
      user.enrolledCourses.push({
        courseId: courseId,
        completedTopics: [topicId]
      });
    } else {
      // If enrolled, check if topic is already completed
      const enrollment = user.enrolledCourses[enrollmentIndex];
      if (!enrollment.completedTopics.includes(topicId)) {
        enrollment.completedTopics.push(topicId);
      }
    }

    await user.save();
    res.json({ msg: "Progress saved", progress: user.enrolledCourses });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
module.exports = router;