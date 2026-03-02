const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const partnerController = require('../controllers/partnerController');

const router = express.Router();

router.get('/public', partnerController.getPublicPartners);
router.post('/', authMiddleware, roleMiddleware(['admin', 'federacao']), partnerController.createPartner);
router.get('/', authMiddleware, partnerController.getPartners);
router.get('/:id', authMiddleware, partnerController.getPartnerById);
router.put('/:id', authMiddleware, partnerController.updatePartner);
router.delete('/:id', authMiddleware, partnerController.inactivatePartner);

module.exports = router;
