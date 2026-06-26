import { requireAuth } from '../../controllers/configuration/login/requireAuth';
import appMenuRoutes from './appMenu.route';
import loginRoutes from './login.route';
import express from 'express';

const router = express.Router();

router.use('/appMenu', requireAuth, appMenuRoutes);
router.use('/login', loginRoutes);

export default router;