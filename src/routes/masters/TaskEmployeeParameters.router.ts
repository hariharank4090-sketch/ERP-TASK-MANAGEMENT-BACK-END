import express from 'express';
import {
    getAllTaskParametDTs,
    getTaskParametDTById,
    createTaskParametDT,
    updateTaskParametDT,
    deleteTaskParametDT,
    deleteTaskParametDTsByTaskId,
    getTaskParametDTsByTaskId
} from '../../controllers/masters/taskManagement/TaskEmployeeParameters.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TaskParameterDetails
 *   description: Task Parameter Details management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskParameterDetail:
 *       type: object
 *       required:
 *         - Task_Id
 *         - Param_Id
 *       properties:
 *         PA_Id:
 *           type: integer
 *           readOnly: true
 *         Task_Id:
 *           type: integer
 *         Param_Id:
 *           type: integer
 *         Paramet_Data_Type:
 *           type: string
 *           nullable: true
 *         Paramet_Name:
 *           type: string
 *           nullable: true
 *           description: Parameter name from Paramet_Master table
 *         Para_Display_Name:
 *           type: string
 *           nullable: true
 *           description: Display name from Paramet_Data_Type table
 * 
 *     TaskParameterDetailCreate:
 *       type: object
 *       required:
 *         - Task_Id
 *         - Param_Id
 *       properties:
 *         Task_Id:
 *           type: integer
 *         Param_Id:
 *           type: integer
 *         Paramet_Data_Type:
 *           type: string
 *           nullable: true
 * 
 *     TaskParameterDetailUpdate:
 *       type: object
 *       properties:
 *         Task_Id:
 *           type: integer
 *           nullable: true
 *         Param_Id:
 *           type: integer
 *           nullable: true
 *         Paramet_Data_Type:
 *           type: string
 *           nullable: true
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
 *                 example: "Task_Id"
 *               message:
 *                 type: string
 *                 example: "Task_Id is required"
 * 
 *   parameters:
 *     taskParameterDetailId:
 *       name: id
 *       in: path
 *       description: Task Parameter Detail ID (PA_Id)
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
 * 
 *     taskId:
 *       name: taskId
 *       in: path
 *       description: Task ID
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
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
 * /api/masters/taskParameterDetails:
 *   get:
 *     summary: Get all task parameter details with filtering
 *     description: Retrieve a list of task parameter details with optional filtering. Includes parameter names from Paramet_Master table and display names from Paramet_Data_Type table.
 *     tags: [TaskParameterDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Task_Id
 *         in: query
 *         description: Filter by Task ID
 *         required: false
 *         schema:
 *           type: integer
 *       - name: Param_Id
 *         in: query
 *         description: Filter by Parameter ID
 *         required: false
 *         schema:
 *           type: integer
 *       - name: sortBy
 *         in: query
 *         description: Sort by field
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["PA_Id", "Task_Id", "Param_Id", "Paramet_Name", "Para_Display_Name"]
 *           default: "PA_Id"
 *       - name: sortOrder
 *         in: query
 *         description: Sort order
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["ASC", "DESC"]
 *           default: "ASC"
 *     responses:
 *       200:
 *         description: Successfully retrieved task parameter details
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
 *                     $ref: '#/components/schemas/TaskParameterDetail'
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, authorize([]), getAllTaskParametDTs);

/**
 * @swagger
 * /api/masters/taskParameterDetails/byTask/{taskId}:
 *   get:
 *     summary: Get task parameter details by Task ID
 *     description: Retrieve all parameter details for a specific task. Includes parameter names from Paramet_Master table and display names from Paramet_Data_Type table.
 *     tags: [TaskParameterDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/taskId'
 *     responses:
 *       200:
 *         description: Successfully retrieved task parameter details
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
 *                     $ref: '#/components/schemas/TaskParameterDetail'
 *       400:
 *         description: Invalid Task ID
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/byTask/:taskId', authenticate, authorize([]), getTaskParametDTsByTaskId);

/**
 * @swagger
 * /api/masters/taskParameterDetails/{id}:
 *   get:
 *     summary: Get task parameter detail by ID
 *     description: Retrieve a specific task parameter detail by its PA_Id. Includes parameter name from Paramet_Master table and display name from Paramet_Data_Type table.
 *     tags: [TaskParameterDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/taskParameterDetailId'
 *     responses:
 *       200:
 *         description: Successfully retrieved task parameter detail
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
 *                   $ref: '#/components/schemas/TaskParameterDetail'
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Task parameter detail not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, authorize([]), getTaskParametDTById);

// ==================== CRUD OPERATIONS ====================

/**
 * @swagger
 * /api/masters/taskParameterDetails:
 *   post:
 *     summary: Create task parameter details
 *     description: Create one or multiple task parameter detail records. Returns created records with parameter names and display names.
 *     tags: [TaskParameterDetails]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/TaskParameterDetailCreate'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/TaskParameterDetailCreate'
 *     responses:
 *       201:
 *         description: Task parameter detail(s) created successfully
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
 *                   oneOf:
 *                     - $ref: '#/components/schemas/TaskParameterDetail'
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskParameterDetail'
 *       207:
 *         description: Partial success - some records created, some failed
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       409:
 *         description: Conflict - Task Parameter combination already exists
 *       500:
 *         description: Internal server error
 */
router.post('/',
    authenticate,
   authorize([]),
    createTaskParametDT
);

/**
 * @swagger
 * /api/masters/taskParameterDetails/{id}:
 *   put:
 *     summary: Update a task parameter detail
 *     description: Update an existing task parameter detail by PA_Id. Returns updated record with parameter name and display name.
 *     tags: [TaskParameterDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/taskParameterDetailId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskParameterDetailUpdate'
 *     responses:
 *       200:
 *         description: Task parameter detail updated successfully
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
 *                   $ref: '#/components/schemas/TaskParameterDetail'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Task parameter detail not found
 *       409:
 *         description: Conflict - Task Parameter combination already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id',
    authenticate,
   authorize([]), 
    updateTaskParametDT
);

/**
 * @swagger
 * /api/masters/taskParameterDetails/{id}:
 *   delete:
 *     summary: Delete a task parameter detail
 *     description: Delete a task parameter detail by PA_Id
 *     tags: [TaskParameterDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/taskParameterDetailId'
 *     responses:
 *       200:
 *         description: Task parameter detail deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Task parameter detail not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id',
    authenticate,
    authorize([]), 
    deleteTaskParametDT
);

/**
 * @swagger
 * /api/masters/taskParameterDetails/byTask/{taskId}:
 *   delete:
 *     summary: Delete all task parameter details by Task ID
 *     description: Delete all parameter details for a specific task
 *     tags: [TaskParameterDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/taskId'
 *     responses:
 *       200:
 *         description: All task parameter details deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid Task ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.delete('/byTask/:taskId',
    authenticate,
   authorize([]),
    deleteTaskParametDTsByTaskId
);

export default router;