const Event = require('../models/Event');
const Volunteer = require('../models/Volunteer');

exports.createEvent = async (req, res) => {
    try {
        const { name, date, location, description, status } = req.body;

        if (!name || !date || !location) {
            return res.status(400).json({ message: 'name, date and location are required' });
        }

        const event = await Event.create({
            name,
            date,
            location,
            description,
            status,
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const { status, from, to, page = 1, limit = 10 } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }

        if (from || to) {
            query.date = {};
            if (from) {
                query.date.$gte = new Date(from);
            }
            if (to) {
                query.date.$lte = new Date(to);
            }
        }

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

        const [events, total] = await Promise.all([
            Event.find(query)
                .sort({ date: 1 })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber)
                .populate('participants.volunteer', 'fullName email status skills'),
            Event.countDocuments(query),
        ]);

        res.status(200).json({
            data: events,
            meta: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPublicEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'active' })
            .sort({ date: 1 })
            .select('name date location description status');

        res.status(200).json({ data: events });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('participants.volunteer', 'fullName email status skills');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const fields = ['name', 'date', 'location', 'description', 'status'];
        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                event[field] = req.body[field];
            }
        });

        const updatedEvent = await event.save();
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await event.deleteOne();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.registerVolunteerInEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { volunteerId } = req.body;

        if (!volunteerId) {
            return res.status(400).json({ message: 'volunteerId is required' });
        }

        const [event, volunteer] = await Promise.all([
            Event.findById(id),
            Volunteer.findById(volunteerId),
        ]);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        if (volunteer.status !== 'approved') {
            return res.status(400).json({ message: 'Only approved volunteers can be registered in events' });
        }

        const alreadyRegistered = event.participants.some(
            (participant) => participant.volunteer.toString() === volunteerId
        );

        if (alreadyRegistered) {
            return res.status(400).json({ message: 'Volunteer already registered in this event' });
        }

        event.participants.push({ volunteer: volunteerId });
        await event.save();

        res.status(200).json({
            message: 'Volunteer registered in event successfully',
            eventId: event._id,
            volunteerId,
            totalParticipants: event.participants.length,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.checkInVolunteer = async (req, res) => {
    try {
        const { eventId, volunteerId } = req.params;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const participant = event.participants.find(
            (item) => item.volunteer.toString() === volunteerId
        );

        if (!participant) {
            return res.status(404).json({ message: 'Volunteer is not registered in this event' });
        }

        if (participant.checkedInAt) {
            return res.status(400).json({ message: 'Volunteer already checked-in' });
        }

        participant.checkedInAt = new Date();
        await event.save();

        res.status(200).json({
            message: 'Check-in completed successfully',
            eventId: event._id,
            volunteerId,
            checkedInAt: participant.checkedInAt,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
