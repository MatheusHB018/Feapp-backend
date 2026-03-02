const Partner = require('../models/Partner');

exports.createPartner = async (req, res) => {
    try {
        const { name, website, logoUrl, description, sectors, contactName, contactEmail, contactPhone, status } = req.body;

        const exists = await Partner.findOne({ name });
        if (exists) {
            return res.status(400).json({ message: 'Partner already exists with this name' });
        }

        const partner = await Partner.create({ name, website, logoUrl, description, sectors, contactName, contactEmail, contactPhone, status });
        res.status(201).json(partner);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPartners = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status = null } = req.query;

        const query = {};
        if (status) query.status = status;
        if (search) query.name = new RegExp(search, 'i');

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

        const [items, total] = await Promise.all([
            Partner.find(query).sort({ name: 1 }).skip((pageNumber - 1) * limitNumber).limit(limitNumber),
            Partner.countDocuments(query),
        ]);

        res.status(200).json({ data: items, meta: { total, page: pageNumber, limit: limitNumber } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPublicPartners = async (req, res) => {
    try {
        const items = await Partner.find({ status: 'active' })
            .select('name website logoUrl description sectors contactName contactEmail contactPhone')
            .sort({ name: 1 });

        res.status(200).json({ data: items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPartnerById = async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id);
        if (!partner) return res.status(404).json({ message: 'Partner not found' });
        res.status(200).json(partner);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePartner = async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id);
        if (!partner) return res.status(404).json({ message: 'Partner not found' });

        const updatable = ['name', 'website', 'logoUrl', 'description', 'sectors', 'contactName', 'contactEmail', 'contactPhone', 'status'];
        updatable.forEach((f) => {
            if (req.body[f] !== undefined) partner[f] = req.body[f];
        });

        const updated = await partner.save();
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.inactivatePartner = async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id);
        if (!partner) return res.status(404).json({ message: 'Partner not found' });
        partner.status = 'inactive';
        await partner.save();
        res.status(200).json({ message: 'Partner inactivated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
