"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/dropdown/dropdown.routes.ts
const express_1 = __importDefault(require("express"));
const dropdown_controller_1 = require("../../controllers/dropdown/dropdown.controller");
const auth_1 = require("../../middleware/auth");
const database_middleware_1 = require("../../middleware/database.middleware");
const router = express_1.default.Router();
/**
 * Middleware chain for every route:
 *
 *   authenticate       → verify Bearer token
 *                         attach req.user, req.userId, req.authenticateId
 *   setCompanyDatabase → resolve company DB connection
 *                         attach req.companyDB (ERP_DB_SMT_TEST Sequelize)
 *                         attach req.currentCompanyId, req.currentDBName
 *   requireCompanyDB   → block request if no company DB resolved
 *
 * Models read req.companyDB directly — no manual token extraction needed.
 */
const guard = [auth_1.authenticate, database_middleware_1.setCompanyDatabase, database_middleware_1.requireCompanyDB];
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     ProjectHeadItem:
 *       type: object
 *       properties:
 *         UserId:
 *           type: integer
 *           description: User ID from the database
 *           example: 5
 *         label:
 *           type: string
 *           description: User name
 *           example: "John Smith"
 *
 *     DropdownItem:
 *       type: object
 *       properties:
 *         value:
 *           type: integer
 *           description: Option value
 *           example: 1
 *         label:
 *           type: string
 *           description: Display label
 *           example: "Active"
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Data retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             oneOf:
 *               - $ref: '#/components/schemas/DropdownItem'
 *               - $ref: '#/components/schemas/ProjectHeadItem'
 *         count:
 *           type: integer
 *           example: 25
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Failed to retrieve data"
 *         error:
 *           type: string
 *           example: "Database connection error"
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     AllDropdownsResponse:
 *       type: object
 *       properties:
 *         projectHeads:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProjectHeadItem'
 *         projectStatus:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DropdownItem'
 *         employees:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DropdownItem'
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DropdownItem'
 *         projects:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DropdownItem'
 *         companies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DropdownItem'
 *
 *   parameters:
 *     activeOnlyParam:
 *       name: activeOnly
 *       in: query
 *       description: Filter only active records (UDel_Flag = 0)
 *       required: false
 *       schema:
 *         type: boolean
 *         default: true
 *       example: true
 *
 *     searchParam:
 *       name: search
 *       in: query
 *       description: Search term for employee names (minimum 2 characters)
 *       required: true
 *       schema:
 *         type: string
 *         minLength: 2
 *       example: "john"
 */
/**
 * @swagger
 * tags:
 *   - name: Dropdowns
 *     description: Dropdown data management endpoints for forms and selects
 */
// ── GET /api/masters/dropdowns/projectheads ───────────────────────────────────
/**
 * @swagger
 * /api/masters/dropdowns/projectheads:
 *   get:
 *     summary: Get project heads dropdown
 *     description: Returns list of users who can be project heads (typically all active users)
 *     tags: [Dropdowns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activeOnlyParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved project heads
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProjectHeadItem'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/projectheads', ...guard, dropdown_controller_1.getProjectHeadDropdown);
// ── GET /api/masters/dropdowns/projectStatus ──────────────────────────────────
/**
 * @swagger
 * /api/masters/dropdowns/projectStatus:
 *   get:
 *     summary: Get project status dropdown
 *     description: Returns static list of project status options (Active/Inactive)
 *     tags: [Dropdowns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved project status options
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DropdownItem'
 *                       example:
 *                         - value: 1
 *                           label: "Active"
 *                         - value: 0
 *                           label: "Inactive"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/projectStatus', ...guard, dropdown_controller_1.getProjectStatusDropdown);
// ── GET /api/masters/dropdowns/employees ─────────────────────────────────────
/**
 * @swagger
 * /api/masters/dropdowns/employees:
 *   get:
 *     summary: Get employees dropdown
 *     description: Returns list of all employees from the company database
 *     tags: [Dropdowns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activeOnlyParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved employees
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DropdownItem'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/employees', ...guard, dropdown_controller_1.getEmployeeDropdown);
// ── GET /api/masters/dropdowns/employees/search ──────────────────────────────────
/**
 * @swagger
 * /api/masters/dropdowns/employees/search:
 *   get:
 *     summary: Search employees by name
 *     description: Search employees with partial name matching (minimum 2 characters)
 *     tags: [Dropdowns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/searchParam'
 *       - $ref: '#/components/parameters/activeOnlyParam'
 *     responses:
 *       200:
 *         description: Successfully searched employees
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DropdownItem'
 *       400:
 *         description: Bad request - Missing or invalid search parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/employees/search', ...guard, dropdown_controller_1.searchEmployeesController);
// ── GET /api/masters/dropdowns/tasks ─────────────────────────────────────────
/**
 * @swagger
 * /api/masters/dropdowns/tasks:
 *   get:
 *     summary: Get tasks dropdown
 *     description: Returns list of tasks (currently returns empty array - to be implemented)
 *     tags: [Dropdowns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activeOnlyParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved tasks
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DropdownItem'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/tasks', ...guard, dropdown_controller_1.getTaskDropdown);
// ── GET /api/masters/dropdowns/projects ──────────────────────────────────────
/**
 * @swagger
 * /api/masters/dropdowns/projects:
 *   get:
 *     summary: Get projects dropdown
 *     description: Returns list of projects from tbl_Project_Master
 *     tags: [Dropdowns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activeOnlyParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved projects
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DropdownItem'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/projects', ...guard, dropdown_controller_1.getProjectsDropdown);
// ── GET /api/masters/dropdowns/company ───────────────────────────────────────
/**
 * @swagger
 * /api/masters/dropdowns/company:
 *   get:
 *     summary: Get current company dropdown
 *     description: Returns the current company from the user's session (no database call)
 *     tags: [Dropdowns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activeOnlyParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved company
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DropdownItem'
 *                       example:
 *                         - value: 1
 *                           label: "SMT TEST"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/company', ...guard, dropdown_controller_1.getCompanyDropdown);
// ── GET /api/masters/dropdowns/all ───────────────────────────────────────────
/**
 * @swagger
 * /api/masters/dropdowns/all:
 *   get:
 *     summary: Get all dropdowns combined
 *     description: Returns all dropdown data in a single API call for efficient form loading
 *     tags: [Dropdowns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activeOnlyParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved all dropdowns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All dropdowns retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AllDropdownsResponse'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/all', ...guard, dropdown_controller_1.getAllDropdowns);
// ── GET /api/masters/dropdowns/test ──────────────────────────────────────────
/**
 * @swagger
 * /api/masters/dropdowns/test:
 *   get:
 *     summary: Test endpoint for dropdown routes
 *     description: Health check endpoint to verify dropdown routes are working
 *     tags: [Dropdowns]
 *     responses:
 *       200:
 *         description: Routes are working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Dropdown routes are working"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/test', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Dropdown routes are working',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
