import { Request, Response } from 'express';
import { initUserModel } from '../models/users.model';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const db = req.companyDB;

        if (!db) {
            return res.status(500).json({ message: 'DB missing' });
        }

        const User = initUserModel(db);

        const users = await User.findAll();

        res.json({
            status: 'success',
            db: req.currentDBName,
            data: users,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};