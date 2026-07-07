"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/masters/taskManagement/projectType.routes.ts
const express_1 = __importDefault(require("express"));
const projectType_controller_1 = require("../../controllers/masters/taskManagement/projectType.controller");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Project Master
 *   description: Project Master management endpoints - Create, Read, Update, Delete projects
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         Project_Id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         Project_Name:
 *           type: string
 *           example: "ERP System Development"
 *         Project_Desc:
 *           type: string
 *           nullable: true
 *           example: "Development of enterprise resource planning system"
 *         Company_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Project_Head:
 *           type: integer
 *           nullable: true
 *           example: 5
 *         Est_Start_Dt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *         Est_End_Dt:
 *           type: string
 *           format: date-time
 *           example: "2024-12-31T00:00:00.000Z"
 *         Project_Status:
 *           type: integer
 *           enum: [0, 1, 2, 3, 4, 5]
 *           example: 2
 *         Entry_By:
 *           type: integer
 *           example: 1
 *         Entry_Date:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T10:00:00.000Z"
 *         Update_By:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Update_Date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         IsActive:
 *           type: integer
 *           enum: [0, 1]
 *           example: 1
 *         statusText:
 *           type: string
 *           example: "Active"
 *         projectStatusText:
 *           type: string
 *           example: "In Progress"
 *
 *     ProjectCreate:
 *       type: object
 *       required:
 *         - Project_Name
 *         - Est_Start_Dt
 *         - Est_End_Dt
 *       properties:
 *         Project_Name:
 *           type: string
 *           example: "ERP System Development"
 *         Project_Desc:
 *           type: string
 *           nullable: true
 *           example: "Development of enterprise resource planning system"
 *         Company_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Project_Head:
 *           type: integer
 *           nullable: true
 *           example: 5
 *         Est_Start_Dt:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         Est_End_Dt:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         Project_Status:
 *           type: integer
 *           enum: [0, 1, 2, 3, 4, 5]
 *           default: 1
 *           example: 2
 *         IsActive:
 *           type: integer
 *           enum: [0, 1]
 *           default: 1
 *           example: 1
 *
 *     ProjectUpdate:
 *       type: object
 *       properties:
 *         Project_Name:
 *           type: string
 *           example: "ERP System Development v2"
 *         Project_Desc:
 *           type: string
 *           nullable: true
 *           example: "Updated description"
 *         Company_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Project_Head:
 *           type: integer
 *           nullable: true
 *           example: 5
 *         Est_Start_Dt:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         Est_End_Dt:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         Project_Status:
 *           type: integer
 *           enum: [0, 1, 2, 3, 4, 5]
 *           example: 3
 *         IsActive:
 *           type: integer
 *           enum: [0, 1]
 *           example: 1
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Validation failed"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: "Project_Name"
 *               message:
 *                 type: string
 *                 example: "Project name is required"
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Project created successfully"
 *         data:
 *           $ref: '#/components/schemas/Project'
 *
 *     StatisticsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             totalProjects:
 *               type: integer
 *             activeProjects:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 text:
 *                   type: string
 *             inactiveProjects:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 text:
 *                   type: string
 *             statusCounts:
 *               type: object
 *             noCompanyCount:
 *               type: integer
 *             noProjectHeadCount:
 *               type: integer
 *
 *     StatusOptionsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             activeStatus:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: integer
 *                   label:
 *                     type: string
 *             projectStatus:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: integer
 *                   label:
 *                     type: string
 *
 *   parameters:
 *     ProjectIdParam:
 *       name: id
 *       in: path
 *       required: true
 *       description: Project ID
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
 *
 *     CompanyIdParam:
 *       name: companyId
 *       in: path
 *       required: true
 *       description: Company ID
 *       schema:
 *         type: integer
 *       example: 1
 *
 *     ProjectHeadIdParam:
 *       name: projectHeadId
 *       in: path
 *       required: true
 *       description: Project Head ID
 *       schema:
 *         type: integer
 *       example: 5
 *
 *     StatusParam:
 *       name: status
 *       in: path
 *       required: true
 *       description: Project Status (0-5)
 *       schema:
 *         type: integer
 *         minimum: 0
 *         maximum: 5
 *       example: 2
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter your JWT token
 */
// ==================== PUBLIC ROUTES (Authentication Required but any role) ====================
/**
 * @swagger
 * /api/masters/project/statistics:
 *   get:
 *     summary: Get project statistics
 *     description: Retrieve statistical data about projects including counts by status, active/inactive, etc.
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatisticsResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/statistics', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.getProjectStatistics);
/**
 * @swagger
 * /api/masters/project/status-options:
 *   get:
 *     summary: Get status options for dropdowns
 *     description: Retrieve all available status options for active status and project status
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status options retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatusOptionsResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/status-options', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.getStatusOptions);
/**
 * @swagger
 * /api/masters/project/active:
 *   get:
 *     summary: Get all active projects
 *     description: Retrieve all active projects (IsActive = 1)
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/active', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.getActiveProjects);
/**
 * @swagger
 * /api/masters/project/no-company:
 *   get:
 *     summary: Get projects with no company assigned
 *     description: Retrieve all active projects that don't have a company assigned
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/no-company', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.getProjectsWithNoCompany);
/**
 * @swagger
 * /api/masters/project/no-project-head:
 *   get:
 *     summary: Get projects with no project head assigned
 *     description: Retrieve all active projects that don't have a project head assigned
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/no-project-head', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.getProjectsWithNoProjectHead);
/**
 * @swagger
 * /api/masters/project/company/{companyId}:
 *   get:
 *     summary: Get projects by company ID
 *     description: Retrieve all active projects for a specific company
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CompanyIdParam'
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid company ID
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - No access to this company
 *       500:
 *         description: Internal server error
 */
router.get('/company/:companyId', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.getProjectsByCompany);
/**
 * @swagger
 * /api/masters/project/project-head/{projectHeadId}:
 *   get:
 *     summary: Get projects by project head ID
 *     description: Retrieve all active projects for a specific project head
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectHeadIdParam'
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid project head ID
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/project-head/:projectHeadId', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.getProjectsByProjectHead);
/**
 * @swagger
 * /api/masters/project/status/{status}:
 *   get:
 *     summary: Get projects by status
 *     description: Retrieve all active projects with a specific status
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/StatusParam'
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid status value (must be 0-5)
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/status/:status', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.getProjectsByStatus);
/**
 * @swagger
 * /api/masters/project/dropdown:
 *   get:
 *     summary: Get projects for dropdown
 *     description: Retrieve all active projects in simplified format for dropdown components
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully for dropdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Project_Id:
 *                         type: string
 *                         example: "20015"
 *                       Project_Name:
 *                         type: string
 *                         example: "Ai Automation"
 *                       Project_Desc:
 *                         type: string
 *                         nullable: true
 *                         example: "Ai Automation"
 *                       Company_Id:
 *                         type: integer
 *                         nullable: true
 *                         example: 3
 *                       Project_Head:
 *                         type: integer
 *                         nullable: true
 *                         example: 202
 *                       Est_Start_Dt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-05-23T00:00:00.000Z"
 *                       Est_End_Dt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-05-23T00:00:00.000Z"
 *                       Project_Status:
 *                         type: integer
 *                         example: 1
 *                       Entry_By:
 *                         type: integer
 *                         example: 200
 *                       Entry_Date:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-05-25T08:12:47.880Z"
 *                       Update_By:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       Update_Date:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       IsActive:
 *                         type: integer
 *                         example: 1
 *                       statusText:
 *                         type: string
 *                         example: "Active"
 *                       projectStatusText:
 *                         type: string
 *                         example: "Planning"
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/dropdown', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.getProjectsForDropdown);
// ==================== CRUD OPERATIONS ====================
/**
 * @swagger
 * /api/masters/project:
 *   get:
 *     summary: Get all projects
 *     description: Retrieve all projects (no pagination, no filters)
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.getAllProjects);
/**
 * @swagger
 * /api/masters/project/{id}:
 *   get:
 *     summary: Get project by ID
 *     description: Retrieve a specific project by its ID
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.getProjectById);
/**
 * @swagger
 * /api/masters/project:
 *   post:
 *     summary: Create a new project
 *     description: Create a new project record (Admin and Manager only)
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectCreate'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       409:
 *         description: Conflict - Project name already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.createProject);
/**
 * @swagger
 * /api/masters/project/{id}:
 *   put:
 *     summary: Update a project
 *     description: Update an existing project by ID (Admin and Manager only)
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectUpdate'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Project not found
 *       409:
 *         description: Conflict - Project name already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.updateProject);
/**
 * @swagger
 * /api/masters/project/{id}:
 *   delete:
 *     summary: Delete a project (soft delete)
 *     description: Soft delete a project by setting IsActive to 0 (Admin only)
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     responses:
 *       200:
 *         description: Project deactivated successfully
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.deleteProject);
// ==================== ADDITIONAL OPERATIONS ====================
/**
 * @swagger
 * /api/masters/project/{id}/toggle:
 *   patch:
 *     summary: Toggle project active status
 *     description: Toggle project between active (1) and inactive (0) (Admin and Manager only)
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     responses:
 *       200:
 *         description: Project status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/toggle', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.toggleProjectStatus);
/**
 * @swagger
 * /api/masters/project/{id}/reactivate:
 *   patch:
 *     summary: Reactivate a project
 *     description: Reactivate a previously deactivated project (Admin and Manager only)
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     responses:
 *       200:
 *         description: Project reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/reactivate', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.reactivateProject);
/**
 * @swagger
 * /api/masters/project/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a project
 *     description: Hard delete a project from database (Admin only - use with caution)
 *     tags: [Project Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     responses:
 *       200:
 *         description: Project permanently deleted successfully
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/permanent', auth_1.authenticate, (0, auth_1.authorize)([]), projectType_controller_1.hardDeleteProject);
exports.default = router;
