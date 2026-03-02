const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/public', eventController.getPublicEvents);
router.post('/', authMiddleware, roleMiddleware(['admin', 'federacao']), eventController.createEvent);
router.get('/', authMiddleware, eventController.getEvents);
router.get('/:id', authMiddleware, eventController.getEventById);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'federacao']), eventController.updateEvent);
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'federacao']), eventController.deleteEvent);
router.post('/:id/register', authMiddleware, roleMiddleware(['admin', 'federacao', 'associacao']), eventController.registerVolunteerInEvent);
router.patch('/:eventId/check-in/:volunteerId', authMiddleware, roleMiddleware(['admin', 'federacao', 'associacao']), eventController.checkInVolunteer);

module.exports = router;
