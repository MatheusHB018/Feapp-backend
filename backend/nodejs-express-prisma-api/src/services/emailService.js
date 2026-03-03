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

const sendDonationIntentEmails = async ({ donorName, email, phone, associationName, message }) => {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const adminTo = process.env.NOTIFICATION_EMAIL_TO || 'matheusbispo925@gmail.com';
    const mailTransporter = getTransporter();

    const adminSubject = '🎉 Nova Intenção de Doação Recebida!';
    const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f172a; color: #ffffff; padding: 20px 24px;">
                <h2 style="margin: 0; font-size: 22px;">🎉 Nova Intenção de Doação Recebida!</h2>
            </div>
            <div style="padding: 24px; color: #111827;">
                <h3 style="margin-top: 0;">Dados do Doador</h3>
                <p style="margin: 6px 0;"><strong>Nome:</strong> ${donorName}</p>
                <p style="margin: 6px 0;"><strong>E-mail:</strong> ${email}</p>
                <p style="margin: 6px 0;"><strong>Telefone:</strong> ${phone}</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
                <h3 style="margin: 0 0 8px;">Associação Escolhida</h3>
                <p style="margin: 6px 0;">${associationName}</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
                <h3 style="margin: 0 0 8px;">Mensagem</h3>
                <p style="margin: 0; white-space: pre-line;">${message || 'Sem mensagem enviada.'}</p>
            </div>
        </div>
    `;

    await mailTransporter.sendMail({
        from,
        to: adminTo,
        replyTo: email,
        subject: adminSubject,
        html: adminHtml,
        text: [
            '🎉 Nova Intenção de Doação Recebida!',
            `Nome: ${donorName}`,
            `E-mail: ${email}`,
            `Telefone: ${phone}`,
            `Associação: ${associationName}`,
            `Mensagem: ${message || 'Sem mensagem enviada.'}`,
        ].join('\n'),
    });

    const donorSubject = 'Recebemos sua intenção de doação 💙';
    const donorHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f766e; color: #ffffff; padding: 20px 24px;">
                <h2 style="margin: 0; font-size: 22px;">Obrigado pelo seu interesse em doar!</h2>
            </div>
            <div style="padding: 24px; color: #111827;">
                <p style="margin-top: 0;">Olá, ${donorName}.</p>
                <p>Recebemos sua intenção de doação para a associação <strong>${associationName}</strong>.</p>
                <p>Nossa equipe entrará em contato em breve pelos dados informados.</p>
                <p style="margin-bottom: 0;">Equipe FEAPP</p>
            </div>
        </div>
    `;

    await mailTransporter.sendMail({
        from,
        to: email,
        subject: donorSubject,
        html: donorHtml,
        text: `Olá, ${donorName}. Recebemos sua intenção de doação para ${associationName}. Em breve entraremos em contato.`,
    });

    logger.info('Donation intent emails sent', {
        adminTo,
        donorTo: email,
    });
};

module.exports = {
    sendSupportRequestEmail,
    sendDonationIntentEmails,
};
