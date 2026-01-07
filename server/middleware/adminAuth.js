const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Admin not authorized' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
