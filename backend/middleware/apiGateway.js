const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const apiGateway = express.Router();

// 🔁 Rate limiting: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests. Please try again later.'
});

apiGateway.use(limiter); // 💥 Apply to all routes behind /api

// 🔐 JWT check (except /auth routes)
apiGateway.use((req, res, next) => {
  if (req.path.startsWith('/auth') || req.path.startsWith('/docs')) return next();

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn('JWT validation failed', { ip: req.ip, error: err.message });
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
});

module.exports = apiGateway;
