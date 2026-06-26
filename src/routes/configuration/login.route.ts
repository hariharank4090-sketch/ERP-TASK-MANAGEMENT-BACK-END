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
 *         description: Login successful - returns tokens for all companies
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