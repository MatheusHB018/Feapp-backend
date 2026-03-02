const User = require('../models/User');
const jwt = require('jsonwebtoken');
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

module.exports = {
    register,
    login
};
