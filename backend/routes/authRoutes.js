const express = require('express');
const router = express.Router();
const { googleLoginURL, googleOAuthCallback } = require('../controllers/authController');

router.get('/google', googleLoginURL); // Step 1: Redirect to Google
router.get('/oauth/callback', googleOAuthCallback); // Step 2: Handle Google's response

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
