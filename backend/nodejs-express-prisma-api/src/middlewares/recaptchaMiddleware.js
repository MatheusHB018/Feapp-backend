const recaptchaMiddleware = async (req, res, next) => {
    try {
        const { recaptchaToken } = req.body;

        if (!recaptchaToken) {
            return res.status(400).json({ message: 'recaptchaToken is required' });
        }

        if (!process.env.RECAPTCHA_SECRET_KEY) {
            return res.status(500).json({ message: 'reCAPTCHA secret key is not configured' });
        }

        const params = new URLSearchParams({
            secret: process.env.RECAPTCHA_SECRET_KEY,
            response: recaptchaToken,
        });

        const googleResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        const data = await googleResponse.json();

        if (data.success === true) {
            return next();
        }

        return res.status(400).json({ message: 'Falha na verificação de bot' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao validar reCAPTCHA' });
    }
};

module.exports = recaptchaMiddleware;
