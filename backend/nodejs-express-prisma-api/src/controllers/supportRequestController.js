const Association = require('../models/Association');
const SupportRequest = require('../models/SupportRequest');
const { sendSupportRequestEmail } = require('../services/emailService');
const logger = require('../utils/logger');

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

exports.createSupportRequest = async (req, res) => {
    try {
        const {
            type,
            fullName,
            companyName,
            contactName,
            email,
            phone,
            associationId,
            message,
        } = req.body;

        if (!['donation', 'company'].includes(type)) {
            return res.status(400).json({ message: 'Invalid type. Use donation or company' });
        }

        if (!email || !phone || !associationId) {
            return res.status(400).json({ message: 'email, phone and associationId are required' });
        }

        if (!isEmailValid(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (type === 'donation' && !fullName) {
            return res.status(400).json({ message: 'fullName is required for donation request' });
        }

        if (type === 'company' && (!companyName || !contactName)) {
            return res.status(400).json({ message: 'companyName and contactName are required for company request' });
        }

        const association = await Association.findOne({ _id: associationId, status: 'active' });
        if (!association) {
            return res.status(404).json({ message: 'Active association not found' });
        }

        const request = await SupportRequest.create({
            type,
            fullName,
            companyName,
            contactName,
            email,
            phone,
            association: associationId,
            message,
        });

        let emailResult = {
            sent: false,
            warning: 'SMTP não configurado ou envio falhou',
        };

        try {
            await sendSupportRequestEmail({
                type,
                fullName,
                companyName,
                contactName,
                email,
                phone,
                associationName: association.name,
                message,
            });
            emailResult = {
                sent: true,
                warning: null,
            };
        } catch (emailError) {
            logger.error('Support request email failed', {
                message: emailError.message,
                stack: emailError.stack,
            });

            emailResult = {
                sent: false,
                warning: `Solicitação salva, mas o envio de e-mail falhou: ${emailError.message}`,
            };
        }

        res.status(201).json({
            id: request._id,
            type: request.type,
            status: request.status,
            createdAt: request.createdAt,
            emailSentTo: process.env.NOTIFICATION_EMAIL_TO || 'matheusbispo925@gmail.com',
            email: emailResult,
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
