// routes/cardRoutes.js
const express          = require('express');
const router           = express.Router();
const {
  getMyCards,
  getAllCards,
  getCardById,
  updateCardStatus
} = require('../controllers/cardController');
const verifyToken      = require('../middleware/verifyToken');
const authorizeRole    = require('../middleware/authorizeRole');

const CUSTOMER  = 1;
const BANKSTAFF = 2;

// Customer endpoints
router.get(
  '/my-cards',
  verifyToken,
  authorizeRole(CUSTOMER),
  getMyCards
);

// Bank staff endpoints
router.get(
  '/',
  verifyToken,
  authorizeRole(BANKSTAFF),
  getAllCards
);
router.get(
  '/:id',
  verifyToken,
  authorizeRole(BANKSTAFF),
  getCardById
);
router.put(
  '/:id/status',
  verifyToken,
  authorizeRole(BANKSTAFF),
  updateCardStatus
);

module.exports = router;
