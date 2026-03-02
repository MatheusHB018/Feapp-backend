const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const associationController = require('../controllers/associationController');

const router = express.Router();

router.get('/public', associationController.getPublicAssociations);
router.post('/', authMiddleware, roleMiddleware(['admin', 'federacao']), associationController.createAssociation);
router.get('/', authMiddleware, associationController.getAssociations);
router.get('/:id', authMiddleware, associationController.getAssociationById);
router.put('/:id', authMiddleware, associationController.updateAssociation);
router.delete('/:id', authMiddleware, associationController.inactivateAssociation);
router.patch('/:associationId/link-user/:userId', authMiddleware, roleMiddleware(['admin', 'federacao']), associationController.linkUserToAssociation);

module.exports = router;
