const { loginSchema } = require('../validations/authValidation');

module.exports = (req, res, next) => {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false, convert: true });
    if (error) {
        return res.status(400).json({
            message: 'Validation error',
            details: error.details.map((d) => d.message),
        });
    }

    // garantir que captchaAnswer será string/número coerente: manter value
    req.body = value;
    return next();
};
