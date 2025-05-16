// backend/middleware/apiGateway.js
const express    = require('express');
const jwt        = require('jsonwebtoken');
const rateLimit  = require('express-rate-limit');
const logger     = require('../utils/logger');

const apiGateway = express.Router();

// 💥 Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  keyGenerator: (req) => {
    // you could key by IP (default) or do per-user via token:
    const auth = req.headers.authorization || '';
    const token = auth.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return `user_${decoded.user_id}`;
    } catch {
      return req.ip;
    }
  },
  handler: (req, res /*, next*/) => {
    // 1) log the event
    const key = req.rateLimit.key;
    logger.warn(`Rate limit exceeded for ${key}`);

    // 2) tell front-end to log out immediately
    res
      .set('X-RateLimit-Logout', 'true')
      .status(429)
      .json({
        error: 'Too many requests. You have been logged out for your safety.',
        logout: true
      });
  }
});
apiGateway.use(limiter);


// 🔐 JWT validation + role-based access
apiGateway.use((req, res, next) => {
  // Allow public access to /auth and /docs
  if (
    req.path.startsWith('/auth') ||
    req.path.startsWith('/docs')
  ) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user      = decoded; // Attach user info downstream

    const role = decoded.role_id;
    const path = req.path.toLowerCase();

    // 🛡 Role-based access control
    if (role === 1) { // Customer
      const isCardRoute = path.startsWith('/cards');
      const isUserRoute = path.startsWith('/users');

      // Allowed for customers:
      //   GET  /cards/my-cards
      //   POST /cards/:cardId/details/request
      //   POST /cards/:cardId/details/verify
      const allowedCardPaths = 
           path.startsWith('/cards/my-cards') ||
           /^\/cards\/\d+\/details\/(request|verify)$/.test(path);

      // 1) block any /cards/* except the allowed ones
      if (isCardRoute && !allowedCardPaths) {
        logger.warn('Unauthorized card access attempt by Customer', {
          user_id: decoded.user_id,
          path
        });
        return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
      }

      // 2) block any /users/* except /users/me
      if (isUserRoute && !path.includes('/me')) {
        logger.warn('Unauthorized user access attempt by Customer', {
          user_id: decoded.user_id,
          path
        });
        return res.status(403).json({ error: 'Access denied: Customers cannot access this' });
      }
    }

    // everything else is OK
    next();

  } catch (err) {
    logger.warn('JWT validation failed', { ip: req.ip, error: err.message });
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
});

module.exports = apiGateway;
