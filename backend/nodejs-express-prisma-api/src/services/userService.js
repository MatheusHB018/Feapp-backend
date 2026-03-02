const User = require('../models/User');

const getAllUsers = async () => {
    return await User.find().select('-password');
};

const getUserById = async (id) => {
    return await User.findById(id).select('-password');
};

const createUser = async (data) => {
    const user = await User.create(data);
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
};

const updateUser = async (id, data) => {
    const user = await User.findById(id);

    if (!user) {
        return null;
    }

    user.name = data.name ?? user.name;
    user.email = data.email ?? user.email;
    user.role = data.role ?? user.role;

    if (data.password) {
        user.password = data.password;
    }

    const updated = await user.save();

    return {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
    };
};

const deleteUser = async (id) => {
    const user = await User.findById(id);

    if (!user) {
        return null;
    }

    await user.deleteOne();
    return true;
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};