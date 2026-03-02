const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

const getRequiredEnv = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

const getTransporter = () => {
    if (transporter) {
        return transporter;
    }

    const host = getRequiredEnv('SMTP_HOST');
    const port = Number(getRequiredEnv('SMTP_PORT'));
    const user = getRequiredEnv('SMTP_USER');
    const pass = getRequiredEnv('SMTP_PASS');

    transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });

    return transporter;
};

const sendSupportRequestEmail = async ({ type, fullName, companyName, contactName, email, phone, associationName, message }) => {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const to = process.env.NOTIFICATION_EMAIL_TO || 'matheusbispo925@gmail.com';

    const subject = type === 'donation'
        ? `Novo cadastro de doação - ${fullName}`
        : `Nova solicitação de parceria empresarial - ${companyName}`;

    const textLines = [
        `Tipo: ${type}`,
        `Associação: ${associationName}`,
        fullName ? `Nome: ${fullName}` : null,
        companyName ? `Empresa: ${companyName}` : null,
        contactName ? `Responsável: ${contactName}` : null,
        `Email: ${email}`,
        `Telefone: ${phone}`,
        message ? `Mensagem: ${message}` : null,
    ].filter(Boolean);

    const mailOptions = {
        from,
        to,
        replyTo: email,
        subject,
        text: textLines.join('\n'),
    };

    const mailTransporter = getTransporter();
    const result = await mailTransporter.sendMail(mailOptions);

    logger.info('Support request email sent', {
        messageId: result.messageId,
        to,
        type,
    });

    return result;
};

module.exports = {
    sendSupportRequestEmail,
};
