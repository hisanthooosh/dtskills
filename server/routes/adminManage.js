const express = require('express');
const router = express.Router();

const Admin = require('../models/Admin');
const AicteInternship = require('../models/AicteInternship');

const User = require('../models/User');

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

/**
 * =========================================
 * ✅ ADMIN / SUPER ADMIN – VERIFY AICTE ID
 * =========================================
 */
router.post(
  '/verify-aicte-id',
  adminAuth,
  adminRole('admin', 'super_admin', 'course_admin'),
  async (req, res) => {
    try {
      const { studentId, courseId, officialAicteId } = req.body;

      if (!studentId || !courseId || !officialAicteId) {
        return res.status(400).json({
          message: 'studentId, courseId and officialAicteId are required'
        });
      }

      const user = await User.findById(studentId);
      if (!user) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const enrollment = user.enrolledCourses.find(
        e => e.courseId.toString() === courseId
      );

      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }

      // 🔓 VERIFY & UNLOCK INTERNSHIP
      enrollment.aicteInternshipId = officialAicteId;
      enrollment.aicteVerified = true;
      enrollment.internshipUnlocked = true;
      enrollment.internshipVerifiedBy = req.admin._id;
      enrollment.internshipVerifiedAt = new Date();

      await user.save();

      res.json({
        message: 'AICTE Internship verified. Modules 6–10 unlocked.'
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Verification failed' });
    }
  }
);
/**
 * =========================================
 * ✅ ADMIN / COURSE ADMIN – ADD AICTE ID
 * =========================================
 */
router.post(
  '/aicte/add',
  adminAuth,
  adminRole('super_admin', 'course_admin'),
  async (req, res) => {
    try {
      const { email, courseId, aicteInternshipId } = req.body;

      // Basic validation
      if (!email || !courseId || !aicteInternshipId) {
        return res.status(400).json({
          message: 'email, courseId and aicteInternshipId are required'
        });
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // ❌ Check duplicate AICTE ID
      const existingId = await AicteInternship.findOne({
        aicteInternshipId: aicteInternshipId.trim()
      });

      if (existingId) {
        return res.status(400).json({
          message: 'This AICTE Internship ID already exists'
        });
      }

      // ❌ Check duplicate email + course
      const existingEmailCourse = await AicteInternship.findOne({
        email: normalizedEmail,
        courseId
      });

      if (existingEmailCourse) {
        return res.status(400).json({
          message: 'AICTE ID already added for this email & course'
        });
      }

      // ✅ Create AICTE Internship record
      const record = new AicteInternship({
        email: normalizedEmail,
        courseId,
        aicteInternshipId: aicteInternshipId.trim(),
        createdByAdmin: req.admin._id
      });

      await record.save();

      res.json({
        message: 'AICTE Internship ID added successfully'
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Failed to add AICTE Internship ID'
      });
    }
  }
);

/**
 * =========================================
 * ✅ ADMIN / COURSE ADMIN – LIST AICTE IDS
 * =========================================
 */
router.get(
  '/aicte',
  adminAuth,
  adminRole('super_admin', 'course_admin'),
  async (req, res) => {
    try {
      const records = await AicteInternship.find()
        .populate({
          path: 'courseId',
          select: 'title'
        })
        .populate({
          path: 'usedByStudentId',
          select: 'email'
        })
        .sort({ createdAt: -1 });

      const formatted = records.map(r => ({
        _id: r._id,
        email: r.email,
        course: r.courseId?.title || 'N/A',
        courseId: r.courseId?._id,
        aicteInternshipId: r.aicteInternshipId,
        status: r.isUsed ? 'Used' : 'Unused',
        usedBy: r.usedByStudentId?.email || null,
        createdAt: r.createdAt
      }));

      res.json(formatted);

    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Failed to fetch AICTE Internship IDs'
      });
    }
  }
);
// ================================
// 🔐 ADMIN: ADD AICTE INTERNSHIP ID
// ================================
const AicteInternship = require('../models/AicteInternship');

router.post(
  '/aicte/add',
  adminAuth,
  adminRole('super_admin', 'course_admin'),
  async (req, res) => {
    try {
      const { email, courseId, aicteInternshipId } = req.body;

      if (!email || !courseId || !aicteInternshipId) {
        return res.status(400).json({
          message: 'Email, courseId and AICTE Internship ID are required'
        });
      }

      // ❌ Prevent duplicate AICTE ID
      const existingId = await AicteInternship.findOne({
        aicteInternshipId
      });

      if (existingId) {
        return res.status(400).json({
          message: 'This AICTE Internship ID already exists'
        });
      }

      // ❌ Prevent duplicate email + course
      const existingEmailCourse = await AicteInternship.findOne({
        email: email.toLowerCase(),
        courseId
      });

      if (existingEmailCourse) {
        return res.status(400).json({
          message: 'AICTE ID already added for this email & course'
        });
      }

      const record = new AicteInternship({
        email: email.toLowerCase(),
        courseId,
        aicteInternshipId,
        createdByAdmin: req.admin._id
      });

      await record.save();

      res.json({
        message: 'AICTE Internship ID added successfully'
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Failed to add AICTE Internship ID'
      });
    }
  }
);
// ================================
// 🔐 ADMIN: LIST AICTE INTERNSHIP IDS
// ================================
router.get(
  '/aicte',
  adminAuth,
  adminRole('super_admin', 'course_admin'),
  async (req, res) => {
    try {
      const records = await AicteInternship.find()
        .populate('courseId', 'title')
        .populate('usedByStudentId', 'email')
        .populate('createdByAdmin', 'email')
        .sort({ createdAt: -1 });

      res.json(records);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Failed to fetch AICTE Internship IDs'
      });
    }
  }
);


module.exports = router;
