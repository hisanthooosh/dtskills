const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * =================================================
 * 🔴 TEMP HARDCODED SUPER ADMIN (DEV SUPPORT)
 * =================================================
 * This keeps your OLD behavior working
 * (so nothing is disturbed)
 */
const ADMIN_EMAIL = "hisanthoosh30@gmail.com";
const ADMIN_PASSWORD = "Hisanthosh30@MBU";

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // -------------------------
    // BASIC VALIDATION
    // -------------------------
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    /**
     * =================================================
     * ✅ SUPER ADMIN LOGIN (HARDCODED + DB SAFE)
     * =================================================
     * ✔ Keeps old behavior
     * ✔ Also ensures DB consistency
     */
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {

      // Ensure super admin exists in DB
      let admin = await Admin.findOne({ email });

      if (!admin) {
        const hashedPassword = await bcrypt.hash(password, 10);

        admin = await Admin.create({
          email,
          password: hashedPassword,
          role: 'super_admin',
          isActive: true
        });
      }

      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.status(200).json({
        success: true,
        admin: {
          email: admin.email,
          role: admin.role
        },
        token
      });
    }

    /**
     * =================================================
     * ✅ COURSE ADMIN / DB ADMIN LOGIN (FIXED)
     * =================================================
     * ❌ OLD CODE BUG: password was compared directly
     * ✅ FIXED: bcrypt.compare
     */

    const admin = await Admin.findOne({
      email,
      isActive: true
    });

    if (!admin) {
      return res.status(401).json({
        message: 'Invalid admin credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid admin credentials'
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      admin: {
        email: admin.email,
        role: admin.role
      },
      token
    });

  } catch (err) {
    console.error('Admin Login Error:', err);
    return res.status(500).json({
      message: 'Server error during admin login'
    });
  }
});

module.exports = router;
