const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
    register,
    login
} = require('../controllers/authController');


// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get authenticated user
// @access  Private
router.get('/me', authMiddleware, (req, res) => {
    res.json(req.user);
});

// Example of protecting a route with authMiddleware and roleMiddleware
router.get('/admin', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    res.json({
        message: 'Admin route',
        user: req.user
    });
});

module.exports = router;
