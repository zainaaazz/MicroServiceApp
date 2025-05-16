// routes/cardRoutes.js
const express          = require('express');
const router           = express.Router();
const {
  getMyCards,
  getAllCards,
  getCardById,
  updateCardStatus
} = require('../controllers/cardController');
const {
  requestDetailsOtp,
  verifyDetailsOtp
} = require('../controllers/cardDetailController');
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


router.post(
  '/:cardId/details/request',
  verifyToken,
  requestDetailsOtp
);
router.post(
  '/:cardId/details/verify',
  verifyToken,
  verifyDetailsOtp
);


// Customer: request & verify one-time code to see full card details
router.post(
  '/:cardId/details/request',
  verifyToken,
  authorizeRole(CUSTOMER),
  requestDetailsOtp
);
router.post(
  '/:cardId/details/verify',
  verifyToken,
  authorizeRole(CUSTOMER),
  verifyDetailsOtp
);




module.exports = router;
