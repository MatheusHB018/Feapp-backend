const express = require('express');
const router = express.Router();
const captchaController = require('../controllers/captchaController');

// GET /api/captcha/generate
router.get('/generate', captchaController.generate);

module.exports = router;
