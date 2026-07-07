"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/configuration/login.route.ts
const express_1 = __importDefault(require("express"));
const index_1 = require("../../controllers/configuration/login/index");
const companyDb_middleware_1 = require("../../middleware/companyDb.middleware");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
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
router.post('/', index_1.login);
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
router.post('/switch-company', auth_1.authenticate, companyDb_middleware_1.setCompanyDatabase, index_1.switchCompany);
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
router.post('/logout', auth_1.authenticate, companyDb_middleware_1.setCompanyDatabase, index_1.logout);
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
router.get('/verify', auth_1.authenticate, companyDb_middleware_1.setCompanyDatabase, index_1.verifyToken);
exports.default = router;
