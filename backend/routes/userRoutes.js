// routes/userRoutes.js
const express        = require('express');
const router         = express.Router();

// ✅ Import the real handler names your controller exports:
const {
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  resetUser
} = require('../controllers/userController');

const verifyToken    = require('../middleware/verifyToken');
const authorizeRole  = require('../middleware/authorizeRole');

// Role IDs
const CUSTOMER  = 1;
const BANKSTAFF = 2;

/**
 * GET /api/users/me
 * – Returns the logged-in user’s profile (Customer & Staff)
 */
router.get(
  '/me',
  verifyToken,
  // allow both role 1 (customer) and role 2 (staff) to view their own profile
  authorizeRole(CUSTOMER, BANKSTAFF),
  getMe
);

/**
 * PUT /api/users/me
 * – Update the logged-in user’s profile (Customer & Staff)
 */
router.put(
  '/me',
  verifyToken,
  authorizeRole(CUSTOMER, BANKSTAFF),
  updateMe
);

/**
 * GET /api/users
 * – (Bank Staff only) List all users
 */
router.get(
  '/',
  verifyToken,
  authorizeRole(BANKSTAFF),
  getAllUsers
);

/**
 * GET /api/users/:id
 * – (Bank Staff only) Get user by ID
 */
router.get(
  '/:id',
  verifyToken,
  authorizeRole(BANKSTAFF),
  getUserById
);

/**
 * PUT /api/users/:id/reset
 * – (Bank Staff only) Reset a user's credentials
 */
router.put(
  '/:id/reset',
  verifyToken,
  authorizeRole(BANKSTAFF),
  resetUser
);

module.exports = router;
