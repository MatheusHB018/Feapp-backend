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
    // captchaAnswer pode ser number ou string contendo dígitos
    captchaAnswer: Joi.alternatives().try(
        Joi.number().integer(),
        Joi.string().pattern(/^\d+$/)
    ).required(),
    // captchaHash é um hex string (SHA-256 = 64 hex chars)
    captchaHash: Joi.string().hex().length(64).required(),
});

module.exports = {
    registerSchema,
    loginSchema,
};
