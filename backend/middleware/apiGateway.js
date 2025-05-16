// backend/middleware/apiGateway.js
const express    = require('express');
const jwt        = require('jsonwebtoken');
const rateLimit  = require('express-rate-limit');
const logger     = require('../utils/logger');

const apiGateway = express.Router();

// 💥 Rate limiter: 50 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  // Key by user ID if they have a valid token, otherwise by IP
  keyGenerator: req => {
    const auth  = req.headers['authorization'] || '';
    const token = auth.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return `user_${decoded.user_id}`;
      } catch {
        // invalid/expired token → fall back
      }
    }
    return req.ip;
  },

  // Called when the limit is exceeded
  handler: (req, res) => {
    // Safely grab the key; if missing, recalc it
    let key = req.rateLimit && req.rateLimit.key;
    if (!key) {
      // recompute the same way keyGenerator would
      const auth  = req.headers['authorization'] || '';
      const token = auth.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          key = `user_${decoded.user_id}`;
        } catch {
          key = req.ip;
        }
      } else {
        key = req.ip;
      }
    }

    // 1) console for immediate feedback
    console.warn(`🔥 Rate limit handler triggered for key: ${key}`);

    // 2) structured log to activity.log
    if (typeof key === 'string' && key.startsWith('user_')) {
      const userId = key.split('_')[1];
      logger.warn(`Rate limit exceeded for user ${userId}`, {
        user_id: userId,
        path:    req.path,
        ip:      req.ip
      });
    } else {
      logger.warn(`Rate limit exceeded for IP ${key}`, {
        ip:   key,
        path: req.path
      });
    }

    // 3) tell front-end to log out
    res
      .set('X-RateLimit-Logout', 'true')
      .status(429)
      .json({
        error:  'Too many requests. You have been logged out for your safety.',
        logout: true
      });
  }
});

apiGateway.use(limiter);

// 🔐 JWT & role‐based middleware (unchanged)…
apiGateway.use((req, res, next) => {
  if (req.path.startsWith('/auth') || req.path.startsWith('/docs')) {
    return next();
  }
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user      = decoded;
    // … your existing role checks here …
    next();
  } catch (err) {
    logger.warn('JWT validation failed', { ip: req.ip, error: err.message });
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
});

module.exports = apiGateway;
