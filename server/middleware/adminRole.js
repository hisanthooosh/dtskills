// server/middleware/adminRole.js

module.exports = function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    try {
      const admin = req.admin; // set by auth middleware

      if (!admin || !allowedRoles.includes(admin.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: insufficient permissions'
        });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: 'Role check failed' });
    }
  };
};
