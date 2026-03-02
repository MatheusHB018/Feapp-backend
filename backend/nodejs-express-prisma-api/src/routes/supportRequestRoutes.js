const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const supportRequestController = require('../controllers/supportRequestController');

const router = express.Router();

router.post('/', supportRequestController.createSupportRequest);
router.get('/', authMiddleware, roleMiddleware(['admin', 'federacao']), supportRequestController.getSupportRequests);
router.patch('/:id/status', authMiddleware, roleMiddleware(['admin', 'federacao']), supportRequestController.updateSupportRequestStatus);

module.exports = router;
