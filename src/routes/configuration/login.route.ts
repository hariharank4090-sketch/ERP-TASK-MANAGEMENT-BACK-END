// src/routes/configuration/login.route.ts
import express from 'express';
import { login, logout, verifyToken, switchCompany } from '../../controllers/configuration/login/index';
import { setCompanyDatabase } from '../../middleware/companyDb.middleware';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/configuration/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful - returns user details (including Global_User_ID) and tokens for all companies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         Global_User_ID:
 *                           type: integer
 *                           example: 262
 *                         Local_User_ID:
 *                           type: integer
 *                           example: 262
 *                         Name:
 *                           type: string
 *                           example: "Hari"
 *                         UserName:
 *                           type: string
 *                           example: "hari"
 *                         UserTypeId:
 *                           type: integer
 *                           example: 2
 *                     currentCompany:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           companyId:
 *                             type: integer
 *                           companyName:
 *                             type: string
 *                             example: "SM TRADERS"
 *                           dbName:
 *                             type: string
 *                             example: "ERP_LIVE_DB_SMT"
 *                           dbConnected:
 *                             type: boolean
 *                             example: true
 *                           token:
 *                             type: string
 *                             example: "token123example"
 *                           UserTypeId:
 *                             type: integer
 *                             example: 2
 *                     serverTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-17T05:36:56Z"
 *       401:
 *         description: Invalid credentials
 */
router.post('/', login);

/**
 * @swagger
 * /api/configuration/login/switch-company:
 *   post:
 *     summary: Switch to a different company
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetCompanyId
 *             properties:
 *               targetCompanyId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Company switched successfully - returns new token
 *       401:
 *         description: Unauthorized
 */
router.post('/switch-company', authenticate, setCompanyDatabase, switchCompany);

/**
 * @swagger
 * /api/configuration/login/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticate, setCompanyDatabase, logout);

/**
 * @swagger
 * /api/configuration/login/verify:
 *   get:
 *     summary: Verify authentication token
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Invalid or expired token
 */
router.get('/verify', authenticate, setCompanyDatabase, verifyToken);

export default router;