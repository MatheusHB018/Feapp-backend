const User = require('../models/User');

// Criar um novo usuário
exports.createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = await User.create({
            name,
            email,
            password,
            role,
        });

        res.status(201).json({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            association: newUser.association,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obter todos os usuários
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('association');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obter um usuário por ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
            return res.status(403).json({ message: 'Not authorized to access this user' });
        }

        const user = await User.findById(id).select('-password').populate('association');

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar um usuário
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    try {
        if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
            return res.status(403).json({ message: 'Not authorized to update this user' });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;

        if (password) {
            user.password = password;
        }

        if (role && req.user.role === 'admin') {
            user.role = role;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            association: updatedUser.association,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Deletar um usuário
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        await user.deleteOne();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};