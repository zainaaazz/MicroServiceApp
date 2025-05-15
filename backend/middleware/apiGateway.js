const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const apiGateway = express.Router();

// 💥 Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests. Please try again later.'
});
apiGateway.use(limiter);

// 🔐 JWT validation + role-based access
apiGateway.use((req, res, next) => {
  // Allow public access to:
  if (
    req.path.startsWith('/auth') ||
    req.path.startsWith('/docs')
  ) return next();

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info for downstream access

    // 🔐 Role-based access control
    const role = decoded.role_id;
    const path = req.path.toLowerCase();

    // ⛔ Block Customers from accessing admin card/user routes
    if (role === 1) { // Customer
      if (
        path.startsWith('/cards') &&
        !path.includes('/my-cards') // they can only access their own cards
      ) {
        logger.warn('Unauthorized card access attempt by Customer', {
          user_id: decoded.user_id,
          path
        });
        return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
      }

      if (
        path.startsWith('/users') &&
        !path.includes('/me')
      ) {
        logger.warn('Unauthorized user list access by Customer', {
          user_id: decoded.user_id,
          path
        });
        return res.status(403).json({ error: 'Access denied: Customers cannot access this' });
      }
    }

    next();
  } catch (err) {
    logger.warn('JWT validation failed', { ip: req.ip, error: err.message });
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
});

module.exports = apiGateway;
