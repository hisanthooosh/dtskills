const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// HARD CODED SUPER ADMIN
const ADMIN_EMAIL = "hisanthoosh30@gmail.com";
const ADMIN_PASSWORD = "Hisanthu30@MBU";

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // SUPER ADMIN LOGIN
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {

    // 🔥 ENSURE SUPER ADMIN EXISTS IN DB
    let admin = await Admin.findOne({ email });

    if (!admin) {
      admin = await Admin.create({
        email,
        password,
        role: 'super_admin',
        isActive: true,
        token: 'SUPER_ADMIN_TOKEN'
      });
    }

    return res.json({
      success: true,
      admin: {
        email: admin.email,
        role: admin.role
      },
      token: admin.token
    });
  }

  // COURSE ADMIN LOGIN
  const admin = await Admin.findOne({ email, password, isActive: true });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  return res.json({
    success: true,
    admin: {
      email: admin.email,
      role: admin.role
    },
    token: admin.token
  });
});

module.exports = router;
