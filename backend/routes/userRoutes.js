const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, getAllUsers, getUserById, resetUser } = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');

// Role IDs
const CUSTOMER = 1;
const BANKSTAFF = 2;

// Customer endpoints
router.get('/me', verifyToken, authorizeRole(CUSTOMER), getMyProfile);
router.put('/me', verifyToken, authorizeRole(CUSTOMER), updateMyProfile);

// Bank Staff endpoints
router.get('/', verifyToken, authorizeRole(BANKSTAFF), getAllUsers);
router.get('/:id', verifyToken, authorizeRole(BANKSTAFF), getUserById);
router.put('/:id/reset', verifyToken, authorizeRole(BANKSTAFF), resetUser);

module.exports = router;

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user profile
 */

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update the current user's phone number
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Phone number updated
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Bank Staff only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get specific user by ID (Bank Staff)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User info
 */

/**
 * @swagger
 * /api/users/{id}/reset:
 *   put:
 *     summary: Reset user credentials (Bank Staff)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reset message (placeholder)
 */
