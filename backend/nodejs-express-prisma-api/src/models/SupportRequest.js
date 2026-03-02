const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['donation', 'company'],
        required: true,
    },
    fullName: {
        type: String,
        default: '',
        trim: true,
    },
    companyName: {
        type: String,
        default: '',
        trim: true,
    },
    contactName: {
        type: String,
        default: '',
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    association: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Association',
        required: true,
    },
    message: {
        type: String,
        default: '',
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'closed'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

const SupportRequest = mongoose.model('SupportRequest', supportRequestSchema);

module.exports = SupportRequest;
