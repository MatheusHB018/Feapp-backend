const Volunteer = require('../models/Volunteer');
const logger = require('../utils/logger');
const { volunteerApplySchema } = require('../validations/volunteerValidation');

exports.applyVolunteer = async (req, res) => {
    try {
        const { error, value } = volunteerApplySchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                details: error.details.map((item) => item.message),
            });
        }

        const {
            fullName,
            email,
            phone,
            document,
            city,
            skills,
            availability,
            notes,
        } = value;

        const exists = await Volunteer.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'Volunteer already applied with this email' });
        }

        const normalizedSkills = Array.isArray(skills)
            ? skills.map((skill) => String(skill).trim()).filter(Boolean)
            : [];

        const volunteer = await Volunteer.create({
            fullName,
            email,
            phone,
            document,
            city,
            skills: normalizedSkills,
            availability,
            notes,
        });

        res.status(201).json({
            id: volunteer._id,
            fullName: volunteer.fullName,
            email: volunteer.email,
            status: volunteer.status,
            createdAt: volunteer.createdAt,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Volunteer already applied with this email' });
        }

        logger.error('Error applying volunteer', { message: error.message, stack: error.stack });
        res.status(500).json({ error: error.message });
    }
};

exports.getVolunteers = async (req, res) => {
    try {
        const { status, skill, page = 1, limit = 10 } = req.query;
        const query = {};

        if (status && !['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status filter' });
        }

        if (status) {
            query.status = status;
        }

        if (skill) {
            query.skills = { $in: [new RegExp(skill, 'i')] };
        }

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

        const [volunteers, total] = await Promise.all([
            Volunteer.find(query)
                .sort({ createdAt: -1 })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber)
                .populate('reviewedBy', 'name email role'),
            Volunteer.countDocuments(query),
        ]);

        res.status(200).json({
            data: volunteers,
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

exports.getVolunteerById = async (req, res) => {
    try {
        const { id } = req.params;
        const volunteer = await Volunteer.findById(id).populate('reviewedBy', 'name email role');

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        res.status(200).json(volunteer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateVolunteerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Use approved or rejected' });
        }

        const volunteer = await Volunteer.findById(id);

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        volunteer.status = status;
        volunteer.reviewedBy = req.user._id;
        volunteer.reviewedAt = new Date();

        await volunteer.save();

        res.status(200).json({
            id: volunteer._id,
            status: volunteer.status,
            reviewedBy: volunteer.reviewedBy,
            reviewedAt: volunteer.reviewedAt,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.matchVolunteersBySkills = async (req, res) => {
    try {
        const { skills } = req.query;

        if (!skills) {
            return res.status(400).json({ message: 'Provide at least one skill in query param skills' });
        }

        const skillList = skills
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

        if (skillList.length === 0) {
            return res.status(400).json({ message: 'Invalid skills query' });
        }

        const regexList = skillList.map((skill) => new RegExp(skill, 'i'));

        const volunteers = await Volunteer.find({
            status: 'approved',
            skills: { $in: regexList },
        }).sort({ updatedAt: -1 });

        res.status(200).json({
            data: volunteers,
            criteria: {
                skills: skillList,
                onlyApproved: true,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
