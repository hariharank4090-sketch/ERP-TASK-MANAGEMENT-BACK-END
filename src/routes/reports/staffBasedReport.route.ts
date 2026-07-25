import express from 'express';
import { StaffBasedReport } from '../../controllers/reports/staffBasedReport.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reports endpoints
 */

/**
 * @swagger
 * /api/reports/staff-based-report:
 *   get:
 *     summary: Get staff based report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: Fromdate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: Todate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Data found
 *       500:
 *         description: Internal server error
 */
router.get('/staff-based-report', StaffBasedReport);

export default router;
