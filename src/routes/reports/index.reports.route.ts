import express from 'express';
import staffBasedReportRoutes from './staffBasedReport.route';
import costCenterRoutes from './costCenter.route';

const router = express.Router();

router.use('/', staffBasedReportRoutes);
router.use('/', costCenterRoutes);

export default router;
