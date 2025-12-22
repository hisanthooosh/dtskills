const express = require('express');
const router = express.Router();
const Course = require('../models/Course'); // Notice how it imports the OTHER file

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find(); 
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;