const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const captchaMiddleware = require('../middlewares/captchaMiddleware');
const validateLogin = require('../middlewares/validateLoginMiddleware');
const {
    register,
    login,
    registerAdmin,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');


// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// Validar payload antes do CAPTCHA para evitar conflitos de ordem
router.post('/login', validateLogin, captchaMiddleware, login);

// @route   POST /api/auth/register-admin
// @desc    Register admin user
// @access  Private/Admin
router.post('/register-admin', authMiddleware, roleMiddleware(['admin']), registerAdmin);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset user password
// @access  Public
router.put('/reset-password/:token', resetPassword);

// @route   GET /api/auth/me
// @desc    Get authenticated user
// @access  Private
router.get('/me', authMiddleware, (req, res) => {
    res.json(req.user);
});

// Exemplo de rota protegida usando authMiddleware
router.get('/dashboard', authMiddleware, (req, res) => {
    res.json({ message: 'Protected dashboard', user: req.user });
});

// Example of protecting a route with authMiddleware and roleMiddleware
router.get('/admin', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    res.json({
        message: 'Admin route',
        user: req.user
    });
});

module.exports = router;
