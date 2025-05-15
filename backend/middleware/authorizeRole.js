module.exports = function (...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
