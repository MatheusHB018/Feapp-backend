const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const captchaMiddleware = require('../middlewares/captchaMiddleware');
const supportRequestController = require('../controllers/supportRequestController');

const router = express.Router();

router.post('/', supportRequestController.createSupportRequest);
router.post('/donate', captchaMiddleware, supportRequestController.createSupportRequest);
router.post('/partner', captchaMiddleware, supportRequestController.createSupportRequest);
router.get('/', authMiddleware, roleMiddleware(['admin', 'federacao']), supportRequestController.getSupportRequests);
router.patch('/:id/status', authMiddleware, roleMiddleware(['admin', 'federacao']), supportRequestController.updateSupportRequestStatus);

module.exports = router;
