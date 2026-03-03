const crypto = require('crypto');

// Gera uma pergunta matemática simples (soma) e um hash HMAC stateless da resposta
exports.generate = (req, res) => {
    try {
        const num1 = Math.floor(Math.random() * 10) + 1; // 1-10
        const num2 = Math.floor(Math.random() * 10) + 1; // 1-10
        const answer = num1 + num2;

        if (!process.env.CAPTCHA_SECRET) {
            return res.status(500).json({ message: 'CAPTCHA secret not configured' });
        }

        const hash = crypto
            .createHmac('sha256', process.env.CAPTCHA_SECRET)
            .update(String(answer))
            .digest('hex');

        return res.json({ question: `Quanto é ${num1} + ${num2}?`, hash });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao gerar CAPTCHA' });
    }
};
