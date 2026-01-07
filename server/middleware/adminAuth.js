const Admin = require('../models/Admin');

module.exports = async function adminAuth(req, res, next) {
  try {
    // Token comes from frontend headers
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Find admin by token
    const admin = await Admin.findOne({ token });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // 🔥 VERY IMPORTANT LINE
    req.admin = admin;

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Admin authentication failed'
    });
  }
};
