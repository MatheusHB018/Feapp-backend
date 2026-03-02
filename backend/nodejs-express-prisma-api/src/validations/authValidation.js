const Joi = require('joi');

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
    password: Joi.string().pattern(strongPasswordRegex).required().messages({
        'string.pattern.base': 'Password must contain at least 8 chars, uppercase, lowercase, number and special character',
    }),
    role: Joi.string().valid('admin', 'federacao', 'associacao', 'voluntario').optional(),
});

const loginSchema = Joi.object({
    email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(8).required(),
});

module.exports = {
    registerSchema,
    loginSchema,
};
