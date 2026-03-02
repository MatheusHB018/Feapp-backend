const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    website: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    sectors: [{ type: String, trim: true }],
    contactName: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
    timestamps: true,
});

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;
