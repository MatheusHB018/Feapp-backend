const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Definindo rotas para usuários
router.post('/', authMiddleware, roleMiddleware(['admin']), userController.createUser);
router.get('/', authMiddleware, roleMiddleware(['admin']), userController.getAllUsers);
router.get('/:id', authMiddleware, roleMiddleware('admin'), userController.getUserById);
router.put('/:id', authMiddleware, roleMiddleware('admin'), userController.updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), userController.deleteUser);

module.exports = router;