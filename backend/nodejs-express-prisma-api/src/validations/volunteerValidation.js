const Joi = require('joi');

const volunteerApplySchema = Joi.object({
    fullName: Joi.string().trim().min(3).max(150).required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.string().trim().min(8).max(30).required(),
    document: Joi.string().trim().allow('').optional(),
    city: Joi.string().trim().allow('').optional(),
    skills: Joi.array().items(Joi.string().trim().min(2).max(80)).optional(),
    availability: Joi.string().trim().allow('').optional(),
    notes: Joi.string().trim().allow('').optional(),
});

module.exports = {
    volunteerApplySchema,
};
