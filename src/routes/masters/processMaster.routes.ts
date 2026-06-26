import express from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { 
    getAllProcessMaster, 
    getProcessMasterById, 
    createProcessMaster, 
    updateProcessMaster, 
    deleteProcessMaster,
    getAllProcessesSimple,
    getProcessStatistics
} from '../../controllers/masters/taskManagement/processMaster.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Process Master
 *   description: Process Master management endpoints - Create, Read, Update, Delete processes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProcessMaster:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         Process_Name:
 *           type: string
 *           maxLength: 250
 *           example: "Monthly Reporting Process"
 * 
 *     ProcessMasterCreate:
 *       type: object
 *       required:
 *         - Process_Name
 *       properties:
 *         Process_Name:
 *           type: string
 *           maxLength: 250
 *           example: "Monthly Reporting Process"
 * 
 *     ProcessMasterUpdate:
 *       type: object
 *       properties:
 *         Process_Name:
 *           type: string
 *           maxLength: 250
 *           example: "Updated Process Name"
 * 
 *     PaginationMetadata:
 *       type: object
 *       properties:
 *         totalRecords:
 *           type: integer
 *           example: 150
 *         currentPage:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 8
 *         pageSize:
 *           type: integer
 *           example: 20
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *         hasPreviousPage:
 *           type: boolean
 *           example: false
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
 *                 example: "Process_Name"
 *               message:
 *                 type: string
 *                 example: "Process name is required"
 * 
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Process created successfully"
 *         data:
 *           $ref: '#/components/schemas/ProcessMaster'
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
 *             totalProcesses:
 *               type: integer
 *   
 *   parameters:
 *     ProcessIdParam:
 *       name: id
 *       in: path
 *       required: true
 *       description: Process ID
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
 *     
 *     PageQuery:
 *       name: page
 *       in: query
 *       required: false
 *       description: Page number
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       example: 1
 *     
 *     LimitQuery:
 *       name: limit
 *       in: query
 *       required: false
 *       description: Items per page (max 100)
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 20
 *       example: 20
 *     
 *     SearchQuery:
 *       name: search
 *       in: query
 *       required: false
 *       description: Search by process name
 *       schema:
 *         type: string
 *       example: "Monthly"
 *     
 *     SortByParam:
 *       name: sortBy
 *       in: query
 *       required: false
 *       description: Sort field
 *       schema:
 *         type: string
 *         enum: [Id, Process_Name]
 *         default: Id
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
 *       description: Enter your JWT token
 */

// ==================== PUBLIC ROUTES (Authentication Required but any role) ====================

/**
 * @swagger
 * /api/masters/processMaster/statistics:
 *   get:
 *     summary: Get process statistics
 *     description: Retrieve statistical data about processes
 *     tags: [Process Master]
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
router.get('/statistics', authenticate, authorize([]), getProcessStatistics);

/**
 * @swagger
 * /api/masters/processMaster/all:
 *   get:
 *     summary: Get all processes (no pagination)
 *     description: Retrieve all processes without pagination for dropdowns/lists
 *     tags: [Process Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Processes retrieved successfully
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
 *                     $ref: '#/components/schemas/ProcessMaster'
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/all', authenticate, authorize([]), getAllProcessesSimple);

// ==================== CRUD OPERATIONS ====================

/**
 * @swagger
 * /api/masters/processMaster:
 *   get:
 *     summary: Get all processes with pagination and filtering
 *     description: Retrieve a paginated list of processes with optional search
 *     tags: [Process Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Processes retrieved successfully
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
 *                     $ref: '#/components/schemas/ProcessMaster'
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginationMetadata'
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
router.get('/', authenticate, authorize([]), getAllProcessMaster);

/**
 * @swagger
 * /api/masters/processMaster/{id}:
 *   get:
 *     summary: Get process by ID
 *     description: Retrieve a specific process by its ID
 *     tags: [Process Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProcessIdParam'
 *     responses:
 *       200:
 *         description: Process retrieved successfully
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
 *         description: Process not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, authorize([]), getProcessMasterById);

/**
 * @swagger
 * /api/masters/processMaster:
 *   post:
 *     summary: Create a new process
 *     description: Create a new process record (Admin and Manager only)
 *     tags: [Process Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessMasterCreate'
 *     responses:
 *       201:
 *         description: Process created successfully
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
 *         description: Conflict - Process name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Process with this name already exists"
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate,  authorize([]), createProcessMaster);

/**
 * @swagger
 * /api/masters/processMaster/{id}:
 *   put:
 *     summary: Update a process
 *     description: Update an existing process by ID (Admin and Manager only)
 *     tags: [Process Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProcessIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessMasterUpdate'
 *     responses:
 *       200:
 *         description: Process updated successfully
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
 *         description: Process not found
 *       409:
 *         description: Conflict - Process name already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate,  authorize([]), updateProcessMaster);

/**
 * @swagger
 * /api/masters/processMaster/{id}:
 *   delete:
 *     summary: Delete a process
 *     description: Permanently delete a process (Admin only)
 *     tags: [Process Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProcessIdParam'
 *     responses:
 *       200:
 *         description: Process deleted successfully
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
 *                   example: "Process deleted successfully"
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Process not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate,  authorize([]), deleteProcessMaster);

export default router;