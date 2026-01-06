const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// CREATE COURSE ADMIN
router.post('/create-course-admin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing data' });
  }

  try {
    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({
      email,
      password,
      role: 'course_admin'
    });

    await admin.save();

    res.json({
      success: true,
      message: 'Course admin created successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
