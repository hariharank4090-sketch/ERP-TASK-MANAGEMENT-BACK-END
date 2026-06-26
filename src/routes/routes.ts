import express from 'express';
import { getUsers } from '../controllers/user.controller';
import {
    setCompanyDatabase,
    requireAuthMiddleware,
    requireCompanyDB,
} from '../middleware/companyDb.middleware';

const router = express.Router();

router.use(setCompanyDatabase);

router.get('/users', requireAuthMiddleware, requireCompanyDB, getUsers);

export default router;