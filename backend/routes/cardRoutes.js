const express = require('express');
const router = express.Router();
const { getMyCards, getAllCards, getCardById, updateCardStatus } = require('../controllers/cardController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');

const CUSTOMER = 1;
const BANKSTAFF = 2;

// Customer
router.get('/my-cards', verifyToken, authorizeRole(CUSTOMER), getMyCards);

// Bank Staff
router.get('/', verifyToken, authorizeRole(BANKSTAFF), getAllCards);
router.get('/:id', verifyToken, authorizeRole(BANKSTAFF), getCardById);
router.put('/:id/status', verifyToken, authorizeRole(BANKSTAFF), updateCardStatus);

module.exports = router;


/**
 * @swagger
 * /api/cards/my-cards:
 *   get:
 *     summary: Get current user's cards
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user cards
 */

/**
 * @swagger
 * /api/cards:
 *   get:
 *     summary: Get all cards (Bank Staff)
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *       - in: query
 *         name: card_status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of cards with optional filters
 */

/**
 * @swagger
 * /api/cards/{id}:
 *   get:
 *     summary: Get specific card by ID (Bank Staff)
 *     tags: [Cards]
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
 *         description: Card info
 */

/**
 * @swagger
 * /api/cards/{id}/status:
 *   put:
 *     summary: Block or unblock a card (Bank Staff)
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
