const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// HARD CODED SUPER ADMIN
const ADMIN_EMAIL = "hisanthoosh30@gmail.com";
const ADMIN_PASSWORD = "Hisanthu30@MBU";

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // =========================
    // SUPER ADMIN LOGIN
    // =========================
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {

      // Ensure super admin exists in DB
      let admin = await Admin.findOne({ email });

      if (!admin) {
        admin = await Admin.create({
          email,
          password,
          role: 'super_admin',
          isActive: true
        });
      }

      // ✅ GENERATE JWT
      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({
        success: true,
        admin: {
          email: admin.email,
          role: admin.role
        },
        token
      });
    }

    // =========================
    // COURSE ADMIN LOGIN
    // =========================
    const admin = await Admin.findOne({
      email,
      password,
      isActive: true
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // ✅ GENERATE JWT
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      admin: {
        email: admin.email,
        role: admin.role
      },
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

module.exports = router;
