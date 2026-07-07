"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const task_controller_1 = require("../../controllers/masters/taskManagement/task.controller");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Task Master
 *   description: Task Master management endpoints - Create, Read, Update, Delete tasks
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         Task_Id:
 *           type: integer
 *           readOnly: true
 *           example: 66
 *         Task_Name:
 *           type: string
 *           example: "SMT EXPENSES CHECKING"
 *         Task_Desc:
 *           type: string
 *           nullable: true
 *           example: "SMT EXPENSES CHECKING DESCRIPTION"
 *         Company_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Task_Type_Id:
 *           type: integer
 *           example: 2
 *         Project_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Entry_By:
 *           type: integer
 *           example: 1
 *         Entry_Date:
 *           type: string
 *           format: date-time
 *           example: "2024-10-18T19:20:33.710Z"
 *         Update_By:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Update_Date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-12-16T13:26:12.240Z"
 *
 *     TaskSchedule:
 *       type: object
 *       properties:
 *         Sch_Id:
 *           type: integer
 *           example: 1
 *         Sch_No:
 *           type: string
 *           example: "SCH-001"
 *         Sch_Date:
 *           type: string
 *           format: date-time
 *         Task_Id:
 *           type: integer
 *         Task_Type_Id:
 *           type: integer
 *         Sch_Plan_Id:
 *           type: integer
 *         Sch_Start_Date:
 *           type: string
 *           format: date-time
 *         Sch_End_Date:
 *           type: string
 *           format: date-time
 *         Task_Sch_Timer_Based:
 *           type: boolean
 *         Sch_Est_Start_Time:
 *           type: string
 *           format: date-time
 *         Sch_Est_End_Time:
 *           type: string
 *           format: date-time
 *         Task_Sch_Duaration:
 *           type: integer
 *         Sch_Status:
 *           type: string
 *         Entry_By:
 *           type: integer
 *         Entry_Date:
 *           type: string
 *           format: date-time
 *         Update_By:
 *           type: integer
 *           nullable: true
 *         Update_Date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Sch_Del_Flag:
 *           type: boolean
 *
 *     TaskWithSchedules:
 *       allOf:
 *         - $ref: '#/components/schemas/Task'
 *         - type: object
 *           properties:
 *             Schedules:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskSchedule'
 *
 *     TaskCreate:
 *       type: object
 *       required:
 *         - Task_Name
 *         - Task_Type_Id
 *       properties:
 *         Task_Name:
 *           type: string
 *           example: "New Task Name"
 *         Task_Desc:
 *           type: string
 *           nullable: true
 *           example: "Task description"
 *         Company_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Task_Type_Id:
 *           type: integer
 *           example: 2
 *         Project_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *
 *     TaskUpdate:
 *       type: object
 *       properties:
 *         Task_Name:
 *           type: string
 *           example: "Updated Task Name"
 *         Task_Desc:
 *           type: string
 *           nullable: true
 *         Company_Id:
 *           type: integer
 *           nullable: true
 *         Task_Type_Id:
 *           type: integer
 *           example: 2
 *         Project_Id:
 *           type: integer
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
 *                 example: "Task_Name"
 *               message:
 *                 type: string
 *                 example: "Task name is required"
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Task created successfully"
 *         data:
 *           $ref: '#/components/schemas/Task'
 *
 *   parameters:
 *     TaskIdParam:
 *       name: id
 *       in: path
 *       required: true
 *       description: Task ID
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 66
 *
 *     ProjectIdParam:
 *       name: projectId
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
 *         minimum: 1
 *       example: 1
 *
 *     TaskGroupIdParam:
 *       name: taskGroupId
 *       in: path
 *       required: true
 *       description: Task Group ID
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 2
 *
 *     TaskIdForSchedules:
 *       name: taskId
 *       in: path
 *       required: true
 *       description: Task ID to get schedules
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 66
 *
 *     SearchQuery:
 *       name: search
 *       in: query
 *       required: false
 *       description: Search by task name or description
 *       schema:
 *         type: string
 *       example: "EXPENSES"
 *
 *     CompanyIdFilter:
 *       name: Company_Id
 *       in: query
 *       required: false
 *       description: Filter by company ID
 *       schema:
 *         type: integer
 *       example: 1
 *
 *     TaskTypeIdFilter:
 *       name: Task_Type_Id
 *       in: query
 *       required: false
 *       description: Filter by task type ID
 *       schema:
 *         type: integer
 *       example: 2
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
 *     SortByParam:
 *       name: sortBy
 *       in: query
 *       required: false
 *       description: Sort field
 *       schema:
 *         type: string
 *         enum: [Task_Id, Task_Name, Entry_Date, Update_Date, Task_Type_Id]
 *         default: Task_Id
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
 *     IncludeSchedulesQuery:
 *       name: includeSchedules
 *       in: query
 *       required: false
 *       description: Include schedule data in the response
 *       schema:
 *         type: boolean
 *         default: false
 *       example: true
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter your JWT token
 */
// ==================== ROUTES ====================
/**
 * @swagger
 * /api/masters/tasks:
 *   get:
 *     summary: Get all tasks with filtering
 *     description: Retrieve all tasks with optional filters and schedule inclusion (NO PAGINATION)
 *     tags: [Task Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/CompanyIdFilter'
 *       - $ref: '#/components/parameters/TaskTypeIdFilter'
 *       - $ref: '#/components/parameters/ProjectIdFilter'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *       - $ref: '#/components/parameters/IncludeSchedulesQuery'
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
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
 *                     oneOf:
 *                       - $ref: '#/components/schemas/Task'
 *                       - $ref: '#/components/schemas/TaskWithSchedules'
 *                 total:
 *                   type: integer
 *                   example: 150
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', auth_1.authenticate, (0, auth_1.authorize)([]), task_controller_1.getAllTasks);
/**
 * @swagger
 * /api/masters/tasks/no-company:
 *   get:
 *     summary: Get tasks with no company assigned
 *     description: Retrieve all tasks that don't have a company assigned
 *     tags: [Task Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IncludeSchedulesQuery'
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
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
 *                     $ref: '#/components/schemas/Task'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/no-company', auth_1.authenticate, (0, auth_1.authorize)([]), task_controller_1.getTasksWithNoCompany);
/**
 * @swagger
 * /api/masters/tasks/no-project:
 *   get:
 *     summary: Get tasks with no project assigned
 *     description: Retrieve all tasks that don't have a project assigned
 *     tags: [Task Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IncludeSchedulesQuery'
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
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
 *                     $ref: '#/components/schemas/Task'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/no-project', auth_1.authenticate, (0, auth_1.authorize)([]), task_controller_1.getTasksWithNoProject);
/**
 * @swagger
 * /api/masters/tasks/project/{projectId}:
 *   get:
 *     summary: Get tasks by project ID
 *     description: Retrieve all tasks for a specific project
 *     tags: [Task Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectIdParam'
 *       - $ref: '#/components/parameters/IncludeSchedulesQuery'
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
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
 *                     $ref: '#/components/schemas/Task'
 *                 total:
 *                   type: integer
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/project/:projectId', auth_1.authenticate, (0, auth_1.authorize)([]), task_controller_1.getTasksByProject);
/**
 * @swagger
 * /api/masters/tasks/company/{companyId}:
 *   get:
 *     summary: Get tasks by company ID
 *     description: Retrieve all tasks for a specific company
 *     tags: [Task Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CompanyIdParam'
 *       - $ref: '#/components/parameters/IncludeSchedulesQuery'
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
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
 *                     $ref: '#/components/schemas/Task'
 *                 total:
 *                   type: integer
 *       400:
 *         description: Invalid company ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/company/:companyId', auth_1.authenticate, (0, auth_1.authorize)([]), task_controller_1.getTasksByCompany);
/**
 * @swagger
 * /api/masters/tasks/task-group/{taskGroupId}:
 *   get:
 *     summary: Get tasks by task group ID
 *     description: Retrieve all tasks for a specific task group
 *     tags: [Task Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TaskGroupIdParam'
 *       - $ref: '#/components/parameters/IncludeSchedulesQuery'
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
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
 *                     $ref: '#/components/schemas/Task'
 *                 total:
 *                   type: integer
 *       400:
 *         description: Invalid task group ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/task-group/:taskGroupId', auth_1.authenticate, (0, auth_1.authorize)([]), task_controller_1.getTasksByTaskGroup);
/**
 * @swagger
 * /api/masters/tasks/{taskId}/schedules:
 *   get:
 *     summary: Get schedules for a specific task
 *     description: Retrieve all schedules associated with a task
 *     tags: [Task Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TaskIdForSchedules'
 *     responses:
 *       200:
 *         description: Task schedules retrieved successfully
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
 *                     $ref: '#/components/schemas/TaskSchedule'
 *                 total:
 *                   type: integer
 *       400:
 *         description: Invalid task ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get('/:taskId/schedules', auth_1.authenticate, (0, auth_1.authorize)([]), task_controller_1.getTaskSchedules);
/**
 * @swagger
 * /api/masters/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     description: Retrieve a specific task by its ID with optional schedule data
 *     tags: [Task Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TaskIdParam'
 *       - $ref: '#/components/parameters/IncludeSchedulesQuery'
 *     responses:
 *       200:
 *         description: Task retrieved successfully
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
 *                     - $ref: '#/components/schemas/Task'
 *                     - $ref: '#/components/schemas/TaskWithSchedules'
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), task_controller_1.getTaskById);
// ==================== CRUD OPERATIONS ====================
/**
 * @swagger
 * /api/masters/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Create a new task record (Admin and Manager only)
 *     tags: [Task Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreate'
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Conflict - Task name already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', auth_1.authenticate, (0, auth_1.authorize)([]), task_controller_1.createTask);
/**
 * @swagger
 * /api/masters/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     description: Update an existing task by ID (Admin and Manager only)
 *     tags: [Task Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TaskIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdate'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       409:
 *         description: Conflict - Task name already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), task_controller_1.updateTask);
/**
 * @swagger
 * /api/masters/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Delete a task by ID (Admin only)
 *     tags: [Task Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TaskIdParam'
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Task not found
 *       409:
 *         description: Conflict - Cannot delete task with associated schedules
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), task_controller_1.deleteTask);
exports.default = router;
