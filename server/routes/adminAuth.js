const express = require('express');
const router = express.Router();

// ✅ HARD CODED SUPER ADMIN (FOR MVP)
const SUPER_ADMIN_EMAIL = "hisanthoosh30@gmail.com";
const SUPER_ADMIN_PASSWORD = "Hisanthu30@MBU";

// ADMIN LOGIN
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // ✅ SUPER ADMIN LOGIN
  if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
    return res.json({
      success: true,
      admin: {
        email,
        role: 'super_admin'
      },
      token: 'SUPER_ADMIN_STATIC_TOKEN'
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid admin credentials'
  });
});

module.exports = router;
