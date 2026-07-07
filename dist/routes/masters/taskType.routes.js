"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskType_controller_1 = require("../../controllers/masters/taskManagement/taskType.controller");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Task Type Master
 *   description: Task Type Master management endpoints - Create, Read, Update, Delete task types
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     TaskType:
 *       type: object
 *       properties:
 *         Task_Type_Id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         Task_Type:
 *           type: string
 *           example: "Development"
 *         Is_Reptative:
 *           type: integer
 *           enum: [0, 1]
 *           example: 0
 *         Hours_Duration:
 *           type: integer
 *           nullable: true
 *           example: 8
 *         Day_Duration:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         TT_Del_Flag:
 *           type: integer
 *           enum: [0, 1]
 *           example: 0
 *         Project_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Est_StartTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Est_EndTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Status:
 *           type: integer
 *           enum: [0, 1]
 *           example: 1
 *         statusText:
 *           type: string
 *           example: "Active"
 *         delFlagText:
 *           type: string
 *           example: "Active"
 *         isReptativeText:
 *           type: string
 *           example: "Non-Repetitive"
 *         Project_Name:
 *           type: string
 *           nullable: true
 *           example: "Project Alpha"
 *
 *     TaskTypeCreate:
 *       type: object
 *       required:
 *         - Task_Type
 *       properties:
 *         Task_Type:
 *           type: string
 *           example: "Development"
 *         Is_Reptative:
 *           type: integer
 *           enum: [0, 1]
 *           default: 0
 *         Hours_Duration:
 *           type: integer
 *           nullable: true
 *           example: 8
 *         Day_Duration:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Project_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Est_StartTime:
 *           type: string
 *           format: date
 *           nullable: true
 *         Est_EndTime:
 *           type: string
 *           format: date
 *           nullable: true
 *         Status:
 *           type: integer
 *           enum: [0, 1]
 *           default: 1
 *
 *     TaskTypeUpdate:
 *       type: object
 *       properties:
 *         Task_Type:
 *           type: string
 *           example: "Development v2"
 *         Is_Reptative:
 *           type: integer
 *           enum: [0, 1]
 *         Hours_Duration:
 *           type: integer
 *           nullable: true
 *         Day_Duration:
 *           type: integer
 *           nullable: true
 *         Project_Id:
 *           type: integer
 *           nullable: true
 *         Est_StartTime:
 *           type: string
 *           format: date
 *           nullable: true
 *         Est_EndTime:
 *           type: string
 *           format: date
 *           nullable: true
 *         Status:
 *           type: integer
 *           enum: [0, 1]
 *         TT_Del_Flag:
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
 *                 example: "Task_Type"
 *               message:
 *                 type: string
 *                 example: "Task type is required"
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Task type created successfully"
 *         data:
 *           $ref: '#/components/schemas/TaskType'
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
 *             totalTaskTypes:
 *               type: integer
 *             activeTaskTypes:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 text:
 *                   type: string
 *             inactiveTaskTypes:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 text:
 *                   type: string
 *             deletedTaskTypes:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 text:
 *                   type: string
 *             repetitiveCount:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 text:
 *                   type: string
 *             nonRepetitiveCount:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 text:
 *                   type: string
 *
 *   parameters:
 *     TaskTypeIdParam:
 *       name: id
 *       in: path
 *       required: true
 *       description: Task Type ID
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
 *
 *     ProjectIdParam:
 *       name: projectId
 *       in: path
 *       required: true
 *       description: Project ID
 *       schema:
 *         type: integer
 *       example: 1
 *
 *     TaskIdParam:
 *       name: taskId
 *       in: path
 *       required: true
 *       description: Task ID
 *       schema:
 *         type: integer
 *       example: 1
 *
 *     SearchQuery:
 *       name: search
 *       in: query
 *       required: false
 *       description: Search by task type name
 *       schema:
 *         type: string
 *       example: "Development"
 *
 *     TaskTypeFilter:
 *       name: Task_Type
 *       in: query
 *       required: false
 *       description: Filter by task type name
 *       schema:
 *         type: string
 *       example: "Development"
 *
 *     ProjectIdFilter:
 *       name: Project_Id
 *       in: query
 *       required: false
 *       description: Filter by project ID
 *       schema:
 *         type: integer
 *       example: 1
 *
 *     StatusFilter:
 *       name: Status
 *       in: query
 *       required: false
 *       description: Filter by status (0=Inactive, 1=Active)
 *       schema:
 *         type: integer
 *         enum: [0, 1]
 *       example: 1
 *
 *     DelFlagFilter:
 *       name: TT_Del_Flag
 *       in: query
 *       required: false
 *       description: Filter by delete flag (0=Active, 1=Deleted)
 *       schema:
 *         type: integer
 *         enum: [0, 1]
 *       example: 0
 *
 *     IsReptativeFilter:
 *       name: Is_Reptative
 *       in: query
 *       required: false
 *       description: Filter by repetitive flag (0=Non-Repetitive, 1=Repetitive)
 *       schema:
 *         type: integer
 *         enum: [0, 1]
 *       example: 0
 *
 *     SortByParam:
 *       name: sortBy
 *       in: query
 *       required: false
 *       description: Sort field
 *       schema:
 *         type: string
 *         enum: [Task_Type_Id, Task_Type, Project_Id, Status]
 *         default: Task_Type_Id
 *
 *     SortOrderParam:
 *       name: sortOrder
 *       in: query
 *       required: false
 *       description: Sort order
 *       schema:
 *         type: string
 *         enum: [ASC, DESC]
 *         default: DESC
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
 * /api/masters/taskType/dropdown:
 *   get:
 *     summary: Get task types for dropdown
 *     description: Retrieve minimal task type data for dropdown/select inputs with optional filtering
 *     tags: [Task Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by project ID
 *       - name: includeInactive
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: false
 *         description: Include inactive task types (Status = 0)
 *     responses:
 *       200:
 *         description: Task types retrieved successfully for dropdown
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
 *                   example: "Task types retrieved successfully for dropdown"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Task_Type_Id:
 *                         type: integer
 *                         example: 3026
 *                       Task_Type:
 *                         type: string
 *                         example: "Sale Order Modification"
 *                       Is_Reptative:
 *                         type: integer
 *                         enum: [0, 1]
 *                         example: 0
 *                       Hours_Duration:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       Day_Duration:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       TT_Del_Flag:
 *                         type: integer
 *                         enum: [0, 1]
 *                         example: 0
 *                       Project_Id:
 *                         type: integer
 *                         nullable: true
 *                         example: 3
 *                       Est_StartTime:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       Est_EndTime:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       Status:
 *                         type: integer
 *                         enum: [0, 1]
 *                         example: 1
 *                       statusText:
 *                         type: string
 *                         example: "Active"
 *                       delFlagText:
 *                         type: string
 *                         example: "Active"
 *                       isReptativeText:
 *                         type: string
 *                         example: "Non-Repetitive"
 *                       Project_Name:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                 totalRecords:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/dropdown', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.getTaskTypeDropdown);
/**
 * @swagger
 * /api/masters/taskType/statistics:
 *   get:
 *     summary: Get task type statistics
 *     description: Retrieve statistical data about task types
 *     tags: [Task Type Master]
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
router.get('/statistics', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.getTaskTypeStatistics);
/**
 * @swagger
 * /api/masters/taskType/status-options:
 *   get:
 *     summary: Get status options for dropdowns
 *     description: Retrieve all available status options for task types
 *     tags: [Task Type Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status options retrieved successfully
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
 *                   type: object
 *                   properties:
 *                     statusOptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: integer
 *                           label:
 *                             type: string
 *                     delFlagOptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: integer
 *                           label:
 *                             type: string
 *                     reptativeOptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: integer
 *                           label:
 *                             type: string
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/status-options', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.getStatusOptions);
/**
 * @swagger
 * /api/masters/taskType/active:
 *   get:
 *     summary: Get all active task types
 *     description: Retrieve all active task types (Status = 1, TT_Del_Flag = 0)
 *     tags: [Task Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by project ID
 *     responses:
 *       200:
 *         description: Active task types retrieved successfully
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
 *                     $ref: '#/components/schemas/TaskType'
 *                 totalRecords:
 *                   type: integer
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/active', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.getActiveTaskTypes);
/**
 * @swagger
 * /api/masters/taskType/project/{projectId}:
 *   get:
 *     summary: Get task types by project ID
 *     description: Retrieve all active task types for a specific project
 *     tags: [Task Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *     responses:
 *       200:
 *         description: Task types retrieved successfully
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
 *                     $ref: '#/components/schemas/TaskType'
 *                 totalRecords:
 *                   type: integer
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/project/:projectId', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.getTaskTypesByProjectId);
/**
 * @swagger
 * /api/masters/taskType/task/{taskId}:
 *   get:
 *     summary: Get task types by task ID
 *     description: Retrieve task types associated with a specific task
 *     tags: [Task Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TaskIdParam'
 *     responses:
 *       200:
 *         description: Task types retrieved successfully
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
 *                     $ref: '#/components/schemas/TaskType'
 *                 totalRecords:
 *                   type: integer
 *       400:
 *         description: Invalid task ID
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/task/:taskId', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.getTaskTypesByTaskId);
// ==================== CRUD OPERATIONS ====================
/**
 * @swagger
 * /api/masters/taskType:
 *   get:
 *     summary: Get all task types with filtering
 *     description: Retrieve all task types with optional filters (no pagination)
 *     tags: [Task Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/TaskTypeFilter'
 *       - $ref: '#/components/parameters/ProjectIdFilter'
 *       - $ref: '#/components/parameters/StatusFilter'
 *       - $ref: '#/components/parameters/DelFlagFilter'
 *       - $ref: '#/components/parameters/IsReptativeFilter'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Task types retrieved successfully
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
 *                   example: "Task types retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskType'
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
router.get('/', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.getAllTaskTypes);
/**
 * @swagger
 * /api/masters/taskType/{id}:
 *   get:
 *     summary: Get task type by ID
 *     description: Retrieve a specific task type by its ID
 *     tags: [Task Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TaskTypeIdParam'
 *     responses:
 *       200:
 *         description: Task type retrieved successfully
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
 *                   example: "Task type retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TaskType'
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Task type not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.getTaskTypeById);
/**
 * @swagger
 * /api/masters/taskType:
 *   post:
 *     summary: Create a new task type
 *     description: Create a new task type record (Admin and Manager only)
 *     tags: [Task Type Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskTypeCreate'
 *     responses:
 *       201:
 *         description: Task type created successfully
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
 *         description: Conflict - Task type name already exists for this project
 *       500:
 *         description: Internal server error
 */
router.post('/', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.createTaskType);
/**
 * @swagger
 * /api/masters/taskType/{id}:
 *   put:
 *     summary: Update a task type
 *     description: Update an existing task type by ID (Admin and Manager only)
 *     tags: [Task Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TaskTypeIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskTypeUpdate'
 *     responses:
 *       200:
 *         description: Task type updated successfully
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
 *         description: Forbidden - Insufficient permissions or no access
 *       404:
 *         description: Task type not found
 *       409:
 *         description: Conflict - Task type name already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.updateTaskType);
/**
 * @swagger
 * /api/masters/taskType/{id}:
 *   delete:
 *     summary: Delete a task type (soft delete)
 *     description: Soft delete a task type by setting TT_Del_Flag to 1 and Status to 0 (Admin only)
 *     tags: [Task Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TaskTypeIdParam'
 *     responses:
 *       200:
 *         description: Task type deactivated successfully
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
 *                   example: "Task type deactivated successfully"
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Task type not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.deleteTaskType);
// ==================== ADDITIONAL OPERATIONS ====================
/**
 * @swagger
 * /api/masters/taskType/{id}/toggle:
 *   patch:
 *     summary: Toggle task type status
 *     description: Toggle task type between active (1) and inactive (0) (Admin and Manager only)
 *     tags: [Task Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TaskTypeIdParam'
 *     responses:
 *       200:
 *         description: Task type status toggled successfully
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
 *         description: Task type not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/toggle', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.toggleTaskTypeStatus);
/**
 * @swagger
 * /api/masters/taskType/{id}/restore:
 *   patch:
 *     summary: Restore a task type
 *     description: Restore a previously soft-deleted task type (Admin and Manager only)
 *     tags: [Task Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TaskTypeIdParam'
 *     responses:
 *       200:
 *         description: Task type restored successfully
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
 *         description: Task type not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/restore', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.restoreTaskType);
/**
 * @swagger
 * /api/masters/taskType/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a task type
 *     description: Hard delete a task type from database (Admin only - use with caution)
 *     tags: [Task Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TaskTypeIdParam'
 *     responses:
 *       200:
 *         description: Task type permanently deleted successfully
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
 *                   example: "Task type permanently deleted successfully"
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Task type not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/permanent', auth_1.authenticate, (0, auth_1.authorize)([]), taskType_controller_1.hardDeleteTaskType);
exports.default = router;
