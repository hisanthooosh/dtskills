const express = require('express');
const router = express.Router();
const Course = require('../models/Course'); // Ensure this path matches your model
const User = require('../models/User');

// 1. GET Single Course (This fixes the "Loading..." issue)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ... existing imports
// const User = require('../models/User');

// --- REPLACE THE COMPLETE TOPIC ROUTE WITH THIS ---
router.post('/complete-topic', async (req, res) => {
  const { userId, courseId, topicId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Find the specific course enrollment
    const enrollment = user.enrolledCourses.find(c => c.courseId.toString() === courseId);

    if (!enrollment) {
      return res.status(404).json({ message: "Student is not enrolled in this course" });
    }

    // 2. SAFETY CHECK: Create the array if it doesn't exist (Fixes the 500 Error)
    if (!enrollment.completedTopics) {
      enrollment.completedTopics = [];
    }

    // 3. Add topic if not already there
    if (!enrollment.completedTopics.includes(topicId)) {
      enrollment.completedTopics.push(topicId);
      
      // 4. Force Mongoose to recognize the change in a nested array
      user.markModified('enrolledCourses');
      
      await user.save();
    }

    res.json({ message: 'Progress updated', progress: enrollment.completedTopics });

  } catch (err) {
    console.error("❌ BACKEND ERROR:", err); // This prints the real error in your terminal
    res.status(500).json({ error: err.message });
  }
});

// ... existing module.exports

// 3. Create a Dummy Course (Use this ONCE via Postman to put data in DB)
router.post('/create-dummy', async (req, res) => {
  try {
    const newCourse = new Course({
      title: "MERN Stack Mastery",
      description: "Learn MongoDB, Express, React, and Node.js",
      thumbnail: "https://via.placeholder.com/150",
      price: 0,
      modules: [
        {
          title: "Introduction",
          topics: [
            {
              title: "What is MERN?",
              textContent: "The MERN stack is a collection of JavaScript-based technologies...",
              youtubeLinks: [{ title: "MERN Intro", url: "https://youtube.com/..." }]
            }
          ]
        }
      ]
    });
    await newCourse.save();
    res.json(newCourse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;