const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const adminAuth = require('../middleware/adminAuth');
const requireRole = require('../middleware/adminRole');


// CREATE COURSE ADMIN (SUPER ADMIN ONLY)
router.post('/create-course-admin', async (req, res) => {
  const { email, password, adminToken } = req.body;

  // 🔐 SUPER ADMIN CHECK
  if (adminToken !== 'SUPER_ADMIN_STATIC_TOKEN') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

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
      message: 'Course admin created successfully',
      admin: {
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// GET ALL COURSE ADMINS (SUPER ADMIN ONLY)
// =====================================================
router.get(
  '/course-admins',
  adminAuth,
  requireRole(['super_admin']),
  async (req, res) => {
    try {
      const admins = await Admin.find({ role: 'course_admin' }).select('-password');
      res.json(admins);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// =====================================================
// ENABLE / DISABLE COURSE ADMIN
// =====================================================
router.put(
  '/toggle-course-admin/:id',
  adminAuth,
  requireRole(['super_admin']),
  async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id);
      if (!admin) return res.status(404).json({ message: 'Admin not found' });

      admin.isActive = !admin.isActive;
      await admin.save();

      res.json({
        success: true,
        isActive: admin.isActive
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);


module.exports = router;
