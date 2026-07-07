"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const users_model_1 = require("../models/users.model");
const getUsers = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db) {
            return res.status(500).json({ message: 'DB missing' });
        }
        const User = (0, users_model_1.initUserModel)(db);
        const users = await User.findAll();
        res.json({
            status: 'success',
            db: req.currentDBName,
            data: users,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUsers = getUsers;
