// backend/routes/logRoutes.js
const express          = require('express');
const { getActivityLogs } = require('../controllers/logController');
const verifyToken      = require('../middleware/verifyToken');
const authorizeRole    = require('../middleware/authorizeRole');

const router = express.Router();

// Only staff (role_id === 2) may read the activity log
router.get(
  '/admin/logs',
  verifyToken,
  authorizeRole(2),
  getActivityLogs
);

module.exports = router;
