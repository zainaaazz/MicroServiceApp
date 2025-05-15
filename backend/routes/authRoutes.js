const express = require('express');
const router = express.Router();
const { googleLoginURL, googleOAuthCallback, login } = require('../controllers/authController');
const { body } = require('express-validator');
const { validateLoginInput } = require('../middleware/validationMiddleware');

// 🔐 Email/password login with input validation
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validateLoginInput,
  login
);

// 🔐 Google OAuth login
router.get('/google', googleLoginURL);
router.get('/oauth/callback', googleOAuthCallback);

module.exports = router;

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login returns JWT
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Redirect to Google for OAuth login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects user to Google login
 */

/**
 * @swagger
 * /api/auth/oauth/callback:
 *   get:
 *     summary: OAuth2 callback to handle Google response and issue JWT
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: JWT returned after Google login
 *       500:
 *         description: OAuth login failed
 */
