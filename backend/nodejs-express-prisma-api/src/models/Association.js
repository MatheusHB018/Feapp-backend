const mongoose = require('mongoose');

const associationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    cnpj: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    address: {
        street: { type: String, default: '' },
        number: { type: String, default: '' },
        neighborhood: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' },
    },
    socialMedia: {
        instagram: { type: String, default: '' },
        facebook: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        website: { type: String, default: '' },
    },
    activityTypes: [{
        type: String,
        trim: true,
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, {
    timestamps: true,
});

const Association = mongoose.model('Association', associationSchema);

module.exports = Association;
