const express = require('express');
const router = express.Router();

const Admin = require('../models/Admin');
const adminAuth = require('../middleware/adminAuth');
const adminRole = require('../middleware/adminRole');

/**
 * 🔐 SUPER ADMIN ONLY ROUTES
 */

// ✅ GET ALL COURSE ADMINS
router.get(
  '/course-admins',
  adminAuth,
  adminRole('super_admin'),
  async (req, res) => {
    const admins = await Admin.find({ role: 'course_admin' });
    res.json(admins);
  }
);

// ✅ CREATE COURSE ADMIN
router.post(
  '/create-course-admin',
  adminAuth,
  adminRole('super_admin'),
  async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email & password required' });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    const admin = new Admin({
      email,
      password,
      role: 'course_admin',
      isActive: true
    });

    await admin.save();

    res.json({ message: 'Course admin created successfully' });
  }
);

// ✅ ENABLE / DISABLE COURSE ADMIN
router.put(
  '/toggle-course-admin/:id',
  adminAuth,
  adminRole('super_admin'),
  async (req, res) => {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.json({ message: 'Admin status updated' });
  }
);

module.exports = router;
