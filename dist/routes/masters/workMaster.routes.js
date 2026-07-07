"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workMaster_controller_1 = require("../../controllers/masters/taskManagement/workMaster.controller");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: WorkMaster
 *   description: Work Master management endpoints
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     ScheduleDetails:
 *       type: object
 *       properties:
 *         Sch_No:
 *           type: string
 *           description: Schedule number
 *           example: "SCH-2024-001"
 *         Sch_Date:
 *           type: string
 *           format: date
 *           description: Schedule date
 *           example: "2024-01-15"
 *         Task_Type_Id:
 *           type: integer
 *           description: Task type ID
 *           example: 1
 *         Sch_Plan_Id:
 *           type: integer
 *           description: Schedule plan ID
 *           example: 10
 *         Task_Sch_Timer_Based:
 *           type: boolean
 *           description: Is timer based schedule
 *           example: true
 *         Sch_Est_Start_Time:
 *           type: string
 *           format: date-time
 *           description: Estimated start time
 *           example: "2024-01-15T09:00:00.000Z"
 *         Sch_Est_End_Time:
 *           type: string
 *           format: date-time
 *           description: Estimated end time
 *           example: "2024-01-15T17:00:00.000Z"
 *         Task_Sch_Duaration:
 *           type: integer
 *           description: Schedule duration in minutes
 *           example: 480
 *         Sch_Status:
 *           type: integer
 *           description: Schedule status
 *           example: 1
 *
 *     TaskDetails:
 *       type: object
 *       properties:
 *         Task_Name:
 *           type: string
 *           description: Name of the task
 *           example: "Development Task"
 *         Project_Id:
 *           type: integer
 *           description: Project ID
 *           example: 5
 *         Project_Name:
 *           type: string
 *           description: Project name
 *           example: "ERP System Development"
 *
 *     WorkParameter:
 *       type: object
 *       properties:
 *         WNo:
 *           type: integer
 *           description: Parameter record number (auto-generated)
 *           readOnly: true
 *           example: 1
 *         Param_Id:
 *           type: integer
 *           description: Parameter ID from task parameters
 *           example: 101
 *         Paramet_Data_Type:
 *           type: string
 *           description: Data type of the parameter (from task parameter master)
 *           nullable: true
 *           example: "Number"
 *         PA_Id:
 *           type: integer
 *           description: Parameter attribute ID (from task parameter master)
 *           nullable: true
 *           example: 5
 *         Default_Value:
 *           type: string
 *           description: Default value for the parameter
 *           nullable: true
 *           example: "10"
 *         Current_Value:
 *           type: string
 *           description: Current/actual value for the parameter
 *           nullable: true
 *           example: "15"
 *
 *     WorkMaster:
 *       type: object
 *       required:
 *         - Work_Id
 *         - Sch_Id
 *         - Task_Id
 *         - Emp_Id
 *         - Work_Dt
 *       properties:
 *         SNo:
 *           type: integer
 *           description: Serial number (auto-generated)
 *           readOnly: true
 *           example: 1
 *         Work_Id:
 *           type: integer
 *           description: Unique work identifier
 *           minimum: 1
 *           example: 1001
 *         Sch_Id:
 *           type: integer
 *           description: Schedule ID
 *           minimum: 1
 *           example: 5
 *         Sch_No:
 *           type: string
 *           description: Schedule number from tbl_Project_Schedule
 *           nullable: true
 *           example: "SCH-2024-001"
 *         Sch_Date:
 *           type: string
 *           format: date
 *           description: Schedule date from tbl_Project_Schedule
 *           nullable: true
 *           example: "2024-01-15"
 *         Task_Id:
 *           type: integer
 *           description: Task ID
 *           minimum: 1
 *           example: 10
 *         Emp_Id:
 *           type: integer
 *           description: Employee ID
 *           minimum: 1
 *           example: 101
 *         Work_Dt:
 *           type: string
 *           format: date
 *           description: Work date
 *           example: "2024-01-15"
 *         Work_Done:
 *           type: string
 *           description: Description of work done
 *           nullable: true
 *           example: "Completed initial setup and testing"
 *         Start_Time:
 *           type: string
 *           format: date-time
 *           description: Work start time
 *           nullable: true
 *           example: "2024-01-15T09:00:00.000Z"
 *         End_Time:
 *           type: string
 *           format: date-time
 *           description: Work end time
 *           nullable: true
 *           example: "2024-01-15T12:30:00.000Z"
 *         Tot_Minutes:
 *           type: integer
 *           description: Total minutes worked
 *           nullable: true
 *           example: 210
 *         Work_Status:
 *           type: string
 *           description: Current status of the work
 *           enum: [Pending, In Progress, Completed]
 *           default: "Pending"
 *           example: "Completed"
 *         Entry_By:
 *           type: integer
 *           description: User ID who created the record
 *           nullable: true
 *           example: 1
 *         Entry_Date:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *           readOnly: true
 *           example: "2024-01-15T08:00:00.000Z"
 *         Update_By:
 *           type: integer
 *           description: User ID who last updated the record
 *           nullable: true
 *           example: 2
 *         Update_Date:
 *           type: string
 *           format: date-time
 *           description: Record last update timestamp
 *           nullable: true
 *           example: "2024-01-15T13:00:00.000Z"
 *         Process_Id:
 *           type: integer
 *           description: Process ID
 *           nullable: true
 *           example: 501
 *         taskDetails:
 *           $ref: '#/components/schemas/TaskDetails'
 *         scheduleDetails:
 *           $ref: '#/components/schemas/ScheduleDetails'
 *         parameters:
 *           type: array
 *           description: List of work parameters with their details from task parameter master
 *           items:
 *             $ref: '#/components/schemas/WorkParameter'
 *
 *     WorkMasterCreate:
 *       type: object
 *       required:
 *         - Work_Id
 *         - Sch_Id
 *         - Task_Id
 *         - Emp_Id
 *         - Work_Dt
 *       properties:
 *         Work_Id:
 *           type: integer
 *           minimum: 1
 *           example: 1001
 *         Sch_Id:
 *           type: integer
 *           minimum: 1
 *           example: 5
 *         Task_Id:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *         Emp_Id:
 *           type: integer
 *           minimum: 1
 *           example: 101
 *         Work_Dt:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         Work_Done:
 *           type: string
 *           nullable: true
 *           optional: true
 *           example: "Completed initial setup"
 *         Start_Time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           optional: true
 *           example: "2024-01-15T09:00:00.000Z"
 *         End_Time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           optional: true
 *           example: "2024-01-15T12:30:00.000Z"
 *         Tot_Minutes:
 *           type: integer
 *           nullable: true
 *           optional: true
 *           example: 210
 *         Work_Status:
 *           type: string
 *           enum: [Pending, In Progress, Completed]
 *           default: "Pending"
 *           optional: true
 *         Entry_By:
 *           type: integer
 *           nullable: true
 *           optional: true
 *           example: 1
 *         Process_Id:
 *           type: integer
 *           nullable: true
 *           optional: true
 *           example: 501
 *         Parameters:
 *           type: array
 *           description: List of work parameters (only Param_Id and values are needed, data type comes from task parameter master)
 *           optional: true
 *           items:
 *             type: object
 *             required:
 *               - Param_Id
 *             properties:
 *               Param_Id:
 *                 type: integer
 *                 description: Parameter ID from task parameters
 *                 example: 101
 *               Default_Value:
 *                 type: string
 *                 description: Default value for the parameter
 *                 nullable: true
 *                 example: "10"
 *               Current_Value:
 *                 type: string
 *                 description: Current value for the parameter
 *                 nullable: true
 *                 example: "15"
 *
 *     WorkMasterUpdate:
 *       type: object
 *       properties:
 *         Work_Id:
 *           type: integer
 *           minimum: 1
 *           optional: true
 *           example: 1001
 *         Sch_Id:
 *           type: integer
 *           minimum: 1
 *           optional: true
 *           example: 5
 *         Task_Id:
 *           type: integer
 *           minimum: 1
 *           optional: true
 *           example: 10
 *         Emp_Id:
 *           type: integer
 *           minimum: 1
 *           optional: true
 *           example: 101
 *         Work_Dt:
 *           type: string
 *           format: date
 *           optional: true
 *           example: "2024-01-15"
 *         Work_Done:
 *           type: string
 *           nullable: true
 *           optional: true
 *           example: "Updated work description"
 *         Start_Time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           optional: true
 *           example: "2024-01-15T09:00:00.000Z"
 *         End_Time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           optional: true
 *           example: "2024-01-15T12:30:00.000Z"
 *         Tot_Minutes:
 *           type: integer
 *           nullable: true
 *           optional: true
 *           example: 210
 *         Work_Status:
 *           type: string
 *           enum: [Pending, In Progress, Completed]
 *           optional: true
 *         Update_By:
 *           type: integer
 *           nullable: true
 *           optional: true
 *           example: 2
 *         Process_Id:
 *           type: integer
 *           nullable: true
 *           optional: true
 *           example: 501
 *         Parameters:
 *           type: array
 *           description: List of work parameters
 *           optional: true
 *           items:
 *             type: object
 *             properties:
 *               Param_Id:
 *                 type: integer
 *                 example: 101
 *               Default_Value:
 *                 type: string
 *                 nullable: true
 *                 example: "10"
 *               Current_Value:
 *                 type: string
 *                 nullable: true
 *                 example: "15"
 *
 *     WorkMasterResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Works retrieved successfully"
 *         data:
 *           oneOf:
 *             - $ref: '#/components/schemas/WorkMaster'
 *             - type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkMaster'
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
 *                 example: "Work_Id"
 *               message:
 *                 type: string
 *                 example: "Work_Id is required"
 *
 *   parameters:
 *     workMasterId:
 *       name: id
 *       in: path
 *       description: Work SNo (Primary Key)
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
 *
 *     employeeId:
 *       name: empId
 *       in: path
 *       description: Employee ID
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 101
 *
 *     taskId:
 *       name: taskId
 *       in: path
 *       description: Task ID
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 10
 *
 *     empIdQuery:
 *       name: empId
 *       in: query
 *       description: Filter by Employee ID
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 *
 *     taskIdQuery:
 *       name: taskId
 *       in: query
 *       description: Filter by Task ID
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 *
 *     schIdQuery:
 *       name: schId
 *       in: query
 *       description: Filter by Schedule ID
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 *
 *     fromDateQuery:
 *       name: fromDate
 *       in: query
 *       description: Filter from date (YYYY-MM-DD)
 *       required: false
 *       schema:
 *         type: string
 *         format: date
 *         example: "2024-01-01"
 *
 *     toDateQuery:
 *       name: toDate
 *       in: query
 *       description: Filter to date (YYYY-MM-DD)
 *       required: false
 *       schema:
 *         type: string
 *         format: date
 *         example: "2024-01-31"
 *
 *     workStatusQuery:
 *       name: workStatus
 *       in: query
 *       description: Filter by work status
 *       required: false
 *       schema:
 *         type: string
 *         enum: [Pending, In Progress, Completed]
 *
 *     sortByQuery:
 *       name: sortBy
 *       in: query
 *       description: Sort field
 *       required: false
 *       schema:
 *         type: string
 *         enum: [Work_Id, Work_Dt, Work_Status, Emp_Id, Task_Id]
 *         default: Work_Dt
 *
 *     sortOrderQuery:
 *       name: sortOrder
 *       in: query
 *       description: Sort order
 *       required: false
 *       schema:
 *         type: string
 *         enum: [ASC, DESC]
 *         default: DESC
 *
 *     searchQuery:
 *       name: search
 *       in: query
 *       description: Search term for Work_Done
 *       required: false
 *       schema:
 *         type: string
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
// ==================== PUBLIC ENDPOINTS (No Authentication Required) ====================
/**
 * @swagger
 * /api/masters/workMaster:
 *   get:
 *     summary: Get all works
 *     description: Retrieve all works with optional filtering and sorting
 *     tags: [WorkMaster]
 *     parameters:
 *       - $ref: '#/components/parameters/searchQuery'
 *       - $ref: '#/components/parameters/empIdQuery'
 *       - $ref: '#/components/parameters/taskIdQuery'
 *       - $ref: '#/components/parameters/schIdQuery'
 *       - $ref: '#/components/parameters/fromDateQuery'
 *       - $ref: '#/components/parameters/toDateQuery'
 *       - $ref: '#/components/parameters/workStatusQuery'
 *       - $ref: '#/components/parameters/sortByQuery'
 *       - $ref: '#/components/parameters/sortOrderQuery'
 *     responses:
 *       200:
 *         description: Successfully retrieved works
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkMasterResponse'
 *       400:
 *         description: Invalid query parameters
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
router.get('/', workMaster_controller_1.getAllWorks);
/**
 * @swagger
 * /api/masters/workMaster/active:
 *   get:
 *     summary: Get active works
 *     description: Retrieve all active works (status not deleted), optionally filtered by employee
 *     tags: [WorkMaster]
 *     parameters:
 *       - $ref: '#/components/parameters/empIdQuery'
 *     responses:
 *       200:
 *         description: Successfully retrieved active works
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkMasterResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/active', workMaster_controller_1.getActiveWorks);
/**
 * @swagger
 * /api/masters/workMaster/statistics:
 *   get:
 *     summary: Get work statistics
 *     description: Get statistics about works grouped by status with total minutes
 *     tags: [WorkMaster]
 *     parameters:
 *       - $ref: '#/components/parameters/empIdQuery'
 *       - $ref: '#/components/parameters/fromDateQuery'
 *       - $ref: '#/components/parameters/toDateQuery'
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
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
 *                   example: "Statistics retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Work_Status:
 *                         type: string
 *                         enum: [Pending, In Progress, Completed]
 *                         example: "Completed"
 *                       count:
 *                         type: integer
 *                         example: 5
 *                       totalMinutes:
 *                         type: integer
 *                         example: 450
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/statistics', workMaster_controller_1.getWorkStatistics);
/**
 * @swagger
 * /api/masters/workMaster/employee/{empId}:
 *   get:
 *     summary: Get works by employee ID
 *     description: Retrieve all works for a specific employee
 *     tags: [WorkMaster]
 *     parameters:
 *       - $ref: '#/components/parameters/employeeId'
 *     responses:
 *       200:
 *         description: Successfully retrieved works by employee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkMasterResponse'
 *       400:
 *         description: Invalid employee ID
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
router.get('/employee/:empId', workMaster_controller_1.getWorksByEmployeeId);
/**
 * @swagger
 * /api/masters/workMaster/task/{taskId}:
 *   get:
 *     summary: Get works by task ID
 *     description: Retrieve all works for a specific task
 *     tags: [WorkMaster]
 *     parameters:
 *       - $ref: '#/components/parameters/taskId'
 *     responses:
 *       200:
 *         description: Successfully retrieved works by task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkMasterResponse'
 *       400:
 *         description: Invalid task ID
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
router.get('/task/:taskId', workMaster_controller_1.getWorksByTaskId);
/**
 * @swagger
 * /api/masters/workMaster/{id}:
 *   get:
 *     summary: Get work by ID
 *     description: Retrieve a specific work by its SNo (primary key)
 *     tags: [WorkMaster]
 *     parameters:
 *       - $ref: '#/components/parameters/workMasterId'
 *     responses:
 *       200:
 *         description: Successfully retrieved work
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkMasterResponse'
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Work not found
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
router.get('/:id', workMaster_controller_1.getWorkById);
// ==================== PROTECTED ENDPOINTS (Authentication Required) ====================
/**
 * @swagger
 * /api/masters/workMaster:
 *   post:
 *     summary: Create a new work
 *     description: Create a new work record with optional parameters. If work with same Work_Id and Emp_Id exists on same date, it will be updated instead.
 *     tags: [WorkMaster]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkMasterCreate'
 *     responses:
 *       201:
 *         description: Work created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkMasterResponse'
 *       200:
 *         description: Work updated successfully (when existing work found)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkMasterResponse'
 *       400:
 *         description: Validation error or invalid Task/Schedule ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
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
router.post('/', auth_1.authenticate, (0, auth_1.authorize)([]), workMaster_controller_1.createWork);
/**
 * @swagger
 * /api/masters/workMaster/{id}:
 *   put:
 *     summary: Update a work
 *     description: Update an existing work by SNo (primary key)
 *     tags: [WorkMaster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workMasterId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkMasterUpdate'
 *     responses:
 *       200:
 *         description: Work updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkMasterResponse'
 *       400:
 *         description: Validation error or invalid Schedule ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Work not found
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
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), workMaster_controller_1.updateWork);
/**
 * @swagger
 * /api/masters/workMaster/{id}:
 *   delete:
 *     summary: Delete a work
 *     description: Permanently delete a work and its associated parameters from the database
 *     tags: [WorkMaster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workMasterId'
 *     responses:
 *       200:
 *         description: Work deleted successfully
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
 *                   example: "Work deleted successfully"
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Work not found
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
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), workMaster_controller_1.deleteWork);
exports.default = router;
