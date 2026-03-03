const crypto = require('crypto');

// Middleware que valida captchaAnswer e captchaHash recebidos no corpo da requisição
module.exports = (req, res, next) => {
    try {
        const { captchaAnswer, captchaHash } = req.body;

        if (captchaAnswer === undefined || !captchaHash) {
            return res.status(400).json({ message: 'captchaAnswer and captchaHash are required' });
        }

        if (!process.env.CAPTCHA_SECRET) {
            return res.status(500).json({ message: 'CAPTCHA secret not configured' });
        }

        const recalculated = crypto
            .createHmac('sha256', process.env.CAPTCHA_SECRET)
            .update(String(captchaAnswer))
            .digest('hex');

        if (recalculated === captchaHash) {
            return next();
        }

        return res.status(400).json({ message: 'Desafio matemático incorreto. Você é um robô?' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao validar CAPTCHA' });
    }
};
