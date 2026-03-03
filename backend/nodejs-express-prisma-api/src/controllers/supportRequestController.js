const Association = require('../models/Association');
const SupportRequest = require('../models/SupportRequest');
const { sendDonationIntentEmails } = require('../services/emailService');
const logger = require('../utils/logger');

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

exports.createSupportRequest = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            associationId,
            associationName,
            message,
            details,
        } = req.body;

        if (!name || !email || !phone || (!associationId && !associationName)) {
            return res.status(400).json({
                message: 'name, email, phone and associationId (or associationName) are required',
            });
        }

        if (!isEmailValid(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const resolvedMessage = message ?? details ?? '';

        let association = null;
        if (associationId) {
            association = await Association.findOne({ _id: associationId, status: 'active' });
        } else if (associationName) {
            association = await Association.findOne({
                name: { $regex: `^${associationName.trim()}$`, $options: 'i' },
                status: 'active',
            });
        }

        if (!association) {
            return res.status(404).json({ message: 'Active association not found' });
        }

        const request = await SupportRequest.create({
            type: 'donation',
            fullName: name,
            email,
            phone,
            association: association._id,
            message: resolvedMessage,
            status: 'pending',
        });

        try {
            await sendDonationIntentEmails({
                donorName: name,
                email,
                phone,
                associationName: association.name,
                message: resolvedMessage,
            });
        } catch (emailError) {
            logger.error('Donation intent email failed', { message: emailError.message, stack: emailError.stack });
        }

        res.status(201).json({
            id: request._id,
            status: 'pendente',
            createdAt: request.createdAt,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSupportRequests = async (req, res) => {
    try {
        const { type, status, page = 1, limit = 10 } = req.query;
        const query = {};

        if (type) {
            query.type = type;
        }

        if (status) {
            query.status = status;
        }

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

        const [requests, total] = await Promise.all([
            SupportRequest.find(query)
                .sort({ createdAt: -1 })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber)
                .populate('association', 'name cnpj status'),
            SupportRequest.countDocuments(query),
        ]);

        res.status(200).json({
            data: requests,
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

exports.updateSupportRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'contacted', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await SupportRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Support request not found' });
        }

        request.status = status;
        await request.save();

        res.status(200).json({
            id: request._id,
            status: request.status,
            updatedAt: request.updatedAt,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
