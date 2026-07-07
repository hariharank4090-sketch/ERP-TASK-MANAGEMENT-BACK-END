"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paramMaster_controller_1 = require("../../controllers/masters/taskManagement/paramMaster.controller");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Param Master
 *   description: Parameter Master management endpoints - Create, Read, Update, Delete parameter masters
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     ParamMaster:
 *       type: object
 *       properties:
 *         Paramet_Id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         Paramet_Name:
 *           type: string
 *           example: "Status"
 *         Paramet_Data_Type:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Company_id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Del_Flag:
 *           type: integer
 *           enum: [0, 1]
 *           example: 0
 *         Del_Flag_Text:
 *           type: string
 *           example: "Active"
 *
 *     ParamMasterCreate:
 *       type: object
 *       required:
 *         - Paramet_Name
 *       properties:
 *         Paramet_Name:
 *           type: string
 *           example: "Status"
 *         Paramet_Data_Type:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Company_id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *
 *     ParamMasterUpdate:
 *       type: object
 *       properties:
 *         Paramet_Name:
 *           type: string
 *           example: "Status Updated"
 *         Paramet_Data_Type:
 *           type: integer
 *           nullable: true
 *         Company_id:
 *           type: integer
 *           nullable: true
 *         Del_Flag:
 *           type: integer
 *           enum: [0, 1]
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
 *                 example: "Paramet_Name"
 *               message:
 *                 type: string
 *                 example: "Parameter name is required"
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Parameter master created successfully"
 *         data:
 *           $ref: '#/components/schemas/ParamMaster'
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
 *             totalParamMasters:
 *               type: integer
 *             activeParamMasters:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 text:
 *                   type: string
 *             deletedParamMasters:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 text:
 *                   type: string
 *
 *   parameters:
 *     ParamMasterIdParam:
 *       name: id
 *       in: path
 *       required: true
 *       description: Parameter Master ID
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
 *     SearchQuery:
 *       name: search
 *       in: query
 *       required: false
 *       description: Search by parameter name
 *       schema:
 *         type: string
 *       example: "Status"
 *
 *     CompanyIdFilter:
 *       name: companyId
 *       in: query
 *       required: false
 *       description: Filter by company ID
 *       schema:
 *         type: integer
 *       example: 1
 *
 *     SortByParam:
 *       name: sortBy
 *       in: query
 *       required: false
 *       description: Sort field
 *       schema:
 *         type: string
 *         enum: [Paramet_Id, Paramet_Name, Paramet_Data_Type, Company_id]
 *         default: Paramet_Id
 *
 *     SortOrderParam:
 *       name: sortOrder
 *       in: query
 *       required: false
 *       description: Sort order
 *       schema:
 *         type: string
 *         enum: [ASC, DESC]
 *         default: ASC
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
// ==================== PUBLIC ROUTES (Authentication Required but any role) ====================
/**
 * @swagger
 * /api/masters/paramMaster/statistics:
 *   get:
 *     summary: Get parameter master statistics
 *     description: Retrieve statistical data about parameter masters
 *     tags: [Param Master]
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
router.get('/statistics', auth_1.authenticate, (0, auth_1.authorize)([]), paramMaster_controller_1.getParamMasterStatistics);
/**
 * @swagger
 * /api/masters/paramMaster/active:
 *   get:
 *     summary: Get all active parameter masters
 *     description: Retrieve all active parameter masters (Del_Flag = 0)
 *     tags: [Param Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: companyId
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by company ID
 *     responses:
 *       200:
 *         description: Active parameter masters retrieved successfully
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
 *                     $ref: '#/components/schemas/ParamMaster'
 *                 totalRecords:
 *                   type: integer
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/active', auth_1.authenticate, (0, auth_1.authorize)([]), paramMaster_controller_1.getAllActiveParamMasters);
/**
 * @swagger
 * /api/masters/paramMaster/company/{companyId}:
 *   get:
 *     summary: Get parameter masters by company ID
 *     description: Retrieve all active parameter masters for a specific company
 *     tags: [Param Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CompanyIdParam'
 *     responses:
 *       200:
 *         description: Parameter masters retrieved successfully
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
 *                     $ref: '#/components/schemas/ParamMaster'
 *                 totalRecords:
 *                   type: integer
 *       400:
 *         description: Invalid company ID
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/company/:companyId', auth_1.authenticate, (0, auth_1.authorize)([]), paramMaster_controller_1.getParamMastersByCompanyId);
// ==================== CRUD OPERATIONS ====================
/**
 * @swagger
 * /api/masters/paramMaster:
 *   get:
 *     summary: Get all parameter masters with filtering
 *     description: Retrieve all parameter masters with optional filters (no pagination)
 *     tags: [Param Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/CompanyIdFilter'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Parameter masters retrieved successfully
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
 *                   example: "Parameter masters retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ParamMaster'
 *                 totalRecords:
 *                   type: integer
 *                   example: 150
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/', auth_1.authenticate, (0, auth_1.authorize)([]), paramMaster_controller_1.getAllParamMasters);
/**
 * @swagger
 * /api/masters/paramMaster/{id}:
 *   get:
 *     summary: Get parameter master by ID
 *     description: Retrieve a specific parameter master by its ID
 *     tags: [Param Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ParamMasterIdParam'
 *     responses:
 *       200:
 *         description: Parameter master retrieved successfully
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
 *                   example: "Parameter master retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ParamMaster'
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Parameter master not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), paramMaster_controller_1.getParamMasterById);
/**
 * @swagger
 * /api/masters/paramMaster:
 *   post:
 *     summary: Create a new parameter master
 *     description: Create a new parameter master record (Admin and Manager only)
 *     tags: [Param Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParamMasterCreate'
 *     responses:
 *       201:
 *         description: Parameter master created successfully
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
 *         description: Forbidden - Insufficient permissions (Admin or Manager required)
 *       409:
 *         description: Conflict - Parameter name already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', auth_1.authenticate, (0, auth_1.authorize)([]), paramMaster_controller_1.createParamMaster);
/**
 * @swagger
 * /api/masters/paramMaster/{id}:
 *   put:
 *     summary: Update a parameter master
 *     description: Update an existing parameter master by ID (Admin and Manager only)
 *     tags: [Param Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ParamMasterIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParamMasterUpdate'
 *     responses:
 *       200:
 *         description: Parameter master updated successfully
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
 *       404:
 *         description: Parameter master not found
 *       409:
 *         description: Conflict - Parameter name already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), paramMaster_controller_1.updateParamMaster);
/**
 * @swagger
 * /api/masters/paramMaster/{id}:
 *   delete:
 *     summary: Delete a parameter master (soft delete)
 *     description: Soft delete a parameter master by setting Del_Flag to 1 (Admin only)
 *     tags: [Param Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ParamMasterIdParam'
 *     responses:
 *       200:
 *         description: Parameter master deactivated successfully
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
 *                   example: "Parameter master deactivated successfully"
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Parameter master not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), paramMaster_controller_1.deleteParamMaster);
// ==================== ADDITIONAL OPERATIONS ====================
/**
 * @swagger
 * /api/masters/paramMaster/{id}/restore:
 *   patch:
 *     summary: Restore a parameter master
 *     description: Restore a previously soft-deleted parameter master (Admin and Manager only)
 *     tags: [Param Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ParamMasterIdParam'
 *     responses:
 *       200:
 *         description: Parameter master restored successfully
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
 *         description: Parameter master not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/restore', auth_1.authenticate, (0, auth_1.authorize)([]), paramMaster_controller_1.restoreParamMaster);
/**
 * @swagger
 * /api/masters/paramMaster/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a parameter master
 *     description: Hard delete a parameter master from database (Admin only - use with caution)
 *     tags: [Param Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ParamMasterIdParam'
 *     responses:
 *       200:
 *         description: Parameter master permanently deleted successfully
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
 *                   example: "Parameter master permanently deleted successfully"
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Parameter master not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/permanent', auth_1.authenticate, (0, auth_1.authorize)([]), paramMaster_controller_1.hardDeleteParamMaster);
exports.default = router;
