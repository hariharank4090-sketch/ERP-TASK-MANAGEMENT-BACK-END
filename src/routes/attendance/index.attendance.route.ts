import express from 'express';

import fingerPrintRoutes from '../attendance/fingerPrint.route';
import attendanceRoutes from './salesPerson.route';
import usersRoutes from './user.routes';
import { requireAuth } from '../../controllers/configuration/login/requireAuth';
const router = express.Router();


router.use('/fingerPrint',requireAuth, fingerPrintRoutes)
router.use('/salesperson',requireAuth, attendanceRoutes)
router.use('/users',requireAuth, usersRoutes)




export default router;