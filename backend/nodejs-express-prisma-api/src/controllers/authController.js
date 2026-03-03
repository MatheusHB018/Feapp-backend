const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const { registerSchema, loginSchema } = require('../validations/authValidation');

// Função para registrar um novo usuário
const register = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                details: error.details.map((item) => item.message),
            });
        }

        const { name, email, password, role } = value;

        // Verificar se o usuário já existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Criar o usuário
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        // Gerar um token JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        logger.error('Error creating user', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error creating user' });
    }
};

// Função para fazer login
const login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                details: error.details.map((item) => item.message),
            });
        }

        const { email, password } = value;

        // Buscar o usuário
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Gerar um token JWT
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        logger.error('Error logging in', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error logging in' });
    }
};

const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email and password are required' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'admin'
        });

        res.status(201).json({
            message: 'Admin created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Error creating admin', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error creating admin' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `http://localhost:8081/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: user.email,
            subject: 'Recuperação de senha FEAPP',
            text: `Você solicitou a recuperação de senha. Acesse o link: ${resetUrl}`,
        });

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        logger.error('Error in forgot password', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error sending reset email' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'New password is required' });
        }

        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        logger.error('Error resetting password', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error resetting password' });
    }
};

module.exports = {
    register,
    login,
    registerAdmin,
    forgotPassword,
    resetPassword
};
