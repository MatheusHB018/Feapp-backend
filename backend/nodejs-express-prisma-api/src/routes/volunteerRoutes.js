const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const volunteerController = require('../controllers/volunteerController');

const router = express.Router();

router.post('/apply', volunteerController.applyVolunteer);
router.get('/', authMiddleware, roleMiddleware(['admin']), volunteerController.getVolunteers);
router.get('/match', authMiddleware, roleMiddleware(['admin', 'federacao']), volunteerController.matchVolunteersBySkills);
router.get('/:id', authMiddleware, roleMiddleware(['admin']), volunteerController.getVolunteerById);
router.patch('/:id/status', authMiddleware, roleMiddleware(['admin']), volunteerController.updateVolunteerStatus);

module.exports = router;
