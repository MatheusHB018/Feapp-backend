const Association = require('../models/Association');
const User = require('../models/User');

const canManageAssociation = (req, associationId) => {
    if (req.user.role === 'admin' || req.user.role === 'federacao') {
        return true;
    }

    return (
        req.user.role === 'associacao' &&
        req.user.association &&
        req.user.association.toString() === associationId.toString()
    );
};

exports.createAssociation = async (req, res) => {
    try {
        const { name, cnpj, address, socialMedia, activityTypes, status } = req.body;

        const exists = await Association.findOne({ cnpj });
        if (exists) {
            return res.status(400).json({ message: 'Association already exists with this CNPJ' });
        }

        const association = await Association.create({
            name,
            cnpj,
            address,
            socialMedia,
            activityTypes,
            status,
        });

        res.status(201).json(association);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAssociations = async (req, res) => {
    try {
        const {
            activity,
            status,
            city,
            search,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            order = 'desc',
        } = req.query;

        const query = {};
        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

        if (status) {
            query.status = status;
        }

        if (city) {
            query['address.city'] = new RegExp(city, 'i');
        }

        if (activity) {
            const activities = activity
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);

            if (activities.length > 0) {
                query.activityTypes = { $in: activities.map((item) => new RegExp(item, 'i')) };
            }
        }

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { cnpj: new RegExp(search, 'i') },
            ];
        }

        const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'status'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const sortOrder = order === 'asc' ? 1 : -1;

        const [associations, total] = await Promise.all([
            Association.find(query)
                .sort({ [sortField]: sortOrder })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber),
            Association.countDocuments(query),
        ]);

        res.status(200).json({
            data: associations,
            meta: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
                sortBy: sortField,
                order: sortOrder === 1 ? 'asc' : 'desc',
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPublicAssociations = async (req, res) => {
    try {
        const associations = await Association.find({ status: 'active' })
            .select('name cnpj activityTypes')
            .sort({ name: 1 });

        res.status(200).json({ data: associations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAssociationById = async (req, res) => {
    try {
        const association = await Association.findById(req.params.id);

        if (!association) {
            return res.status(404).json({ message: 'Association not found' });
        }

        if (!canManageAssociation(req, association._id)) {
            return res.status(403).json({ message: 'Not authorized to access this association' });
        }

        res.status(200).json(association);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateAssociation = async (req, res) => {
    try {
        const association = await Association.findById(req.params.id);

        if (!association) {
            return res.status(404).json({ message: 'Association not found' });
        }

        if (!canManageAssociation(req, association._id)) {
            return res.status(403).json({ message: 'Not authorized to update this association' });
        }

        if (req.body.cnpj && req.body.cnpj !== association.cnpj) {
            const cnpjExists = await Association.findOne({ cnpj: req.body.cnpj });
            if (cnpjExists) {
                return res.status(400).json({ message: 'Association already exists with this CNPJ' });
            }
        }

        const updatableFields = ['name', 'cnpj', 'address', 'socialMedia', 'activityTypes', 'status'];
        updatableFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                association[field] = req.body[field];
            }
        });

        const updatedAssociation = await association.save();
        res.status(200).json(updatedAssociation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.inactivateAssociation = async (req, res) => {
    try {
        const association = await Association.findById(req.params.id);

        if (!association) {
            return res.status(404).json({ message: 'Association not found' });
        }

        if (!canManageAssociation(req, association._id)) {
            return res.status(403).json({ message: 'Not authorized to inactivate this association' });
        }

        association.status = 'inactive';
        await association.save();

        res.status(200).json({ message: 'Association inactivated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.linkUserToAssociation = async (req, res) => {
    try {
        const { associationId, userId } = req.params;

        const association = await Association.findById(associationId);
        if (!association) {
            return res.status(404).json({ message: 'Association not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.association = association._id;
        if (user.role === 'voluntario') {
            user.role = 'associacao';
        }

        await user.save();

        res.status(200).json({
            message: 'User linked to association successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                association: user.association,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
