const express = require('express');
const router = express.Router();

const Admin = require('../models/Admin');
const AicteInternship = require('../models/AicteInternship');

const adminAuth = require('../middleware/adminAuth');
const adminRole = require('../middleware/adminRole');
const bcrypt = require('bcryptjs'); // add at top if not present

/**
 * =========================================
 * 🔐 SUPER ADMIN — COURSE ADMINS
 * =========================================
 */

// GET ALL COURSE ADMINS
router.get(
  '/course-admins',
  adminAuth,
  adminRole(['super_admin']),
  async (req, res) => {
    const admins = await Admin.find({ role: 'course_admin' });
    res.json(admins);
  }
);

// CREATE COURSE ADMIN
router.post(
  '/create-course-admin',
  adminAuth,
  adminRole(['super_admin']),
  async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email & password required' });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    

    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      email: normalizedEmail,
      password: hashedPassword,
      role: 'course_admin',
      isActive: true
    });


    await admin.save();
    res.json({ message: 'Course admin created successfully' });
  }
);

// ENABLE / DISABLE COURSE ADMIN
router.put(
  '/toggle-course-admin/:id',
  adminAuth,
  adminRole(['super_admin']),
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

/**
 * =========================================
 * ✅ ADMIN — ADD AICTE INTERNSHIP ID
 * =========================================
 */
router.post(
  '/aicte/add',
  adminAuth,
  adminRole(['super_admin', 'course_admin']),
  async (req, res) => {
    try {
      const { email, courseId, aicteInternshipId } = req.body;

      if (!email || !courseId || !aicteInternshipId) {
        return res.status(400).json({
          message: 'email, courseId and aicteInternshipId are required'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existingId = await AicteInternship.findOne({
        aicteInternshipId: aicteInternshipId.trim()
      });

      if (existingId) {
        return res.status(400).json({
          message: 'This AICTE Internship ID already exists'
        });
      }

      const existingEmailCourse = await AicteInternship.findOne({
        email: normalizedEmail,
        courseId
      });

      if (existingEmailCourse) {
        return res.status(400).json({
          message: 'AICTE ID already added for this email & course'
        });
      }

      const record = new AicteInternship({
        email: normalizedEmail,
        courseId,
        aicteInternshipId: aicteInternshipId.trim(),
        createdByAdmin: req.admin._id
      });

      await record.save();

      res.json({ message: 'AICTE Internship ID added successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to add AICTE Internship ID' });
    }
  }
);

/**
 * =========================================
 * ✅ ADMIN — LIST AICTE INTERNSHIP IDS
 * =========================================
 */
router.get(
  '/aicte',
  adminAuth,
  adminRole(['super_admin', 'course_admin']),
  async (req, res) => {
    const records = await AicteInternship.find()
      .populate('courseId', 'title')
      .populate('usedByStudentId', 'email')
      .sort({ createdAt: -1 });

    const formatted = records.map(r => ({
      _id: r._id,
      email: r.email,
      course: r.courseId?.title || 'N/A',
      courseId: r.courseId?._id,
      aicteInternshipId: r.aicteInternshipId,
      status: r.isUsed ? 'Used' : 'Unused',
      usedBy: r.usedByStudentId?.email || null
    }));

    res.json(formatted);
  }
);

module.exports = router;
