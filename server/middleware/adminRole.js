module.exports = (requiredRole) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.admin.role !== requiredRole) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};
