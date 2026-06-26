import { Router } from 'express';
import {
    createTaskDetailsRaw,
    getAllTaskDetails,
    getTaskDetailById,
    getTaskDetailsByProject,
    getTaskDetailsBySchedule,
    getTaskDetailsByTask,
    getTaskDetailsByEmployee,
    updateTaskDetail,
    deleteTaskDetail,
    getTaskDetailsWithFilters,
    getTaskDetailsStatistics,
    updateTaskDetailsBulk
} from '../../controllers/masters/taskManagement/projectScheduleEmp.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TaskDetails
 *   description: Task Details management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskDetail:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           description: Task detail ID
 *         AN_No:
 *           type: integer
 *           nullable: true
 *         Project_Id:
 *           type: integer
 *         Sch_Id:
 *           type: integer
 *         Task_Levl_Id:
 *           type: integer
 *           nullable: true
 *         Task_Id:
 *           type: integer
 *         Task_Name:
 *           type: string
 *           nullable: true
 *           description: Task name from tbl_Task table
 *         Task_Desc:
 *           type: string
 *           nullable: true
 *           description: Task description from tbl_Task table
 *         Task_Type_Id:
 *           type: integer
 *           nullable: true
 *           description: Task type ID from tbl_Task table
 *         Assigned_Emp_Id:
 *           type: integer
 *           nullable: true
 *         Emp_Id:
 *           type: integer
 *         Task_Assign_dt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Sch_Period:
 *           type: string
 *           nullable: true
 *         Sch_Time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         EN_Time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Ord_By:
 *           type: integer
 *           nullable: true
 *         Invovled_Stat:
 *           type: integer
 *           nullable: true
 *         Schedule_Task_Sch_Timer_Based:
 *           type: integer
 *           nullable: true
 *           description: Task timer based flag from schedule table
 *         Schedule_Sch_No:
 *           type: string
 *           nullable: true
 *         Schedule_Sch_Date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Schedule_Task_Type_Id:
 *           type: integer
 *           nullable: true
 *         Schedule_Sch_Plan_Id:
 *           type: integer
 *           nullable: true
 *         Schedule_Sch_Start_Date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Schedule_Sch_End_Date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Schedule_Task_Sch_Duaration:
 *           type: integer
 *           nullable: true
 *         Schedule_Sch_Status:
 *           type: integer
 *           nullable: true
 *     
 *     TaskDetailCreate:
 *       type: object
 *       required:
 *         - Project_Id
 *         - Sch_Id
 *         - Task_Id
 *         - Emp_Ids
 *       properties:
 *         Project_Id:
 *           type: integer
 *           example: 100
 *         Sch_Id:
 *           type: integer
 *           example: 5
 *         Task_Id:
 *           type: integer
 *           example: 10
 *         Emp_Ids:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1, 2, 4]
 *         AN_No:
 *           type: integer
 *           example: 12345
 *         Task_Levl_Id:
 *           type: integer
 *           example: 1
 *         Assigned_Emp_Id:
 *           type: integer
 *           example: 101
 *         Task_Assign_dt:
 *           oneOf:
 *             - type: string
 *               format: date-time
 *             - type: array
 *               items:
 *                 type: string
 *                 format: date-time
 *           example: "2024-01-15T10:00:00Z"
 *         Sch_Period:
 *           type: string
 *           example: "Morning"
 *         Sch_Time:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T09:00:00Z"
 *         EN_Time:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T17:00:00Z"
 *         Ord_By:
 *           type: integer
 *           example: 1
 *         Invovled_Stat:
 *           type: integer
 *           example: 1
 *     
 *     TaskDetailUpdate:
 *       type: object
 *       properties:
 *         AN_No:
 *           type: integer
 *           nullable: true
 *         Project_Id:
 *           type: integer
 *         Sch_Id:
 *           type: integer
 *         Task_Levl_Id:
 *           type: integer
 *           nullable: true
 *         Task_Id:
 *           type: integer
 *         Assigned_Emp_Id:
 *           type: integer
 *           nullable: true
 *         Emp_Id:
 *           type: integer
 *         Task_Assign_dt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Sch_Period:
 *           type: string
 *           nullable: true
 *         Sch_Time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         EN_Time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Ord_By:
 *           type: integer
 *           nullable: true
 *         Invovled_Stat:
 *           type: integer
 *           nullable: true
 *     
 *     TaskDetailBulkUpdate:
 *       type: object
 *       required:
 *         - projectId
 *         - schId
 *         - taskId
 *         - empId
 *       properties:
 *         projectId:
 *           type: integer
 *           example: 100
 *         schId:
 *           type: integer
 *           example: 5
 *         taskId:
 *           type: integer
 *           example: 10
 *         empId:
 *           type: integer
 *           example: 101
 *         Ord_By:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Invovled_Stat:
 *           type: integer
 *           nullable: true
 *           example: 1
 *     
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *         metadata:
 *           type: object
 *           properties:
 *             totalRecords:
 *               type: integer
 *             currentPage:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             pageSize:
 *               type: integer
 */

/**
 * @swagger
 * /api/masters/projectScheduleEmp/create:
 *   post:
 *     summary: Create task details for multiple employees
 *     tags: [TaskDetails]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskDetailCreate'
 *     responses:
 *       201:
 *         description: Task details created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalRecords:
 *                           type: integer
 *                         employeeCount:
 *                           type: integer
 *                         scheduleTaskCount:
 *                           type: integer
 *                         employeeIds:
 *                           type: array
 *                           items:
 *                             type: integer
 *                         scheduleTaskDates:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               taskWorkDate:
 *                                 type: string
 *                                 format: date-time
 *                               taskStartTime:
 *                                 type: string
 *                                 format: date-time
 *                               taskEndTime:
 *                                 type: string
 *                                 format: date-time
 *                         anNoValuesUsed:
 *                           type: array
 *                           items:
 *                             type: integer
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/create', createTaskDetailsRaw);

/**
 * @swagger
 * /api/masters/projectScheduleEmp/bulk-update:
 *   put:
 *     summary: Bulk update task details for an employee
 *     tags: [TaskDetails]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskDetailBulkUpdate'
 *     responses:
 *       200:
 *         description: Task details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalRecords:
 *                           type: integer
 *                         employeeId:
 *                           type: integer
 *                         scheduleTaskCount:
 *                           type: integer
 *                         scheduleTaskDates:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               taskWorkDate:
 *                                 type: string
 *                                 format: date-time
 *                               taskStartTime:
 *                                 type: string
 *                                 format: date-time
 *                               taskEndTime:
 *                                 type: string
 *                                 format: date-time
 *                         anNoValuesUsed:
 *                           type: array
 *                           items:
 *                             type: integer
 *       400:
 *         description: Validation failed or missing required fields
 *       404:
 *         description: No schedule task data found
 *       500:
 *         description: Internal server error
 */
router.put('/bulk-update', updateTaskDetailsBulk);

/**
 * @swagger
 * /api/masters/projectScheduleEmp/list:
 *   get:
 *     summary: Get all task details with filtering
 *     tags: [TaskDetails]
 *     parameters:
 *       - in: query
 *         name: Project_Id
 *         schema:
 *           type: integer
 *         description: Filter by project ID
 *       - in: query
 *         name: Sch_Id
 *         schema:
 *           type: integer
 *         description: Filter by schedule ID
 *       - in: query
 *         name: Task_Id
 *         schema:
 *           type: integer
 *         description: Filter by task ID
 *       - in: query
 *         name: Emp_Id
 *         schema:
 *           type: integer
 *         description: Filter by employee ID
 *       - in: query
 *         name: Assigned_Emp_Id
 *         schema:
 *           type: integer
 *         description: Filter by assigned employee ID
 *       - in: query
 *         name: Invovled_Stat
 *         schema:
 *           type: integer
 *         description: Filter by involvement status
 *       - in: query
 *         name: from_Task_Assign_dt
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for task assignment (YYYY-MM-DD)
 *       - in: query
 *         name: to_Task_Assign_dt
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for task assignment (YYYY-MM-DD)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [Id, AN_No, Project_Id, Sch_Id, Task_Id, Task_Name, Emp_Id, Task_Assign_dt, Sch_Time, EN_Time, Invovled_Stat, Schedule_Task_Sch_Timer_Based, Schedule_Sch_No, Schedule_Sch_Date]
 *           default: Id
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
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
 *                         $ref: '#/components/schemas/TaskDetail'
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.get('/list', getAllTaskDetails);

/**
 * @swagger
 * /api/masters/projectScheduleEmp/filter:
 *   get:
 *     summary: Get task details with advanced filters
 *     tags: [TaskDetails]
 *     parameters:
 *       - in: query
 *         name: Project_Ids
 *         schema:
 *           type: string
 *         description: Comma-separated project IDs (e.g., 1,2,3)
 *       - in: query
 *         name: Task_Ids
 *         schema:
 *           type: string
 *         description: Comma-separated task IDs
 *       - in: query
 *         name: Emp_Ids
 *         schema:
 *           type: string
 *         description: Comma-separated employee IDs
 *       - in: query
 *         name: has_AN_No
 *         schema:
 *           type: boolean
 *         description: Filter records with/without AN_No (true=has AN_No, false=no AN_No)
 *       - in: query
 *         name: has_Assigned_Emp
 *         schema:
 *           type: boolean
 *         description: Filter records with/without assigned employee
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [Id, AN_No, Project_Id, Sch_Id, Task_Id, Task_Name, Emp_Id, Task_Assign_dt, Sch_Time, EN_Time, Invovled_Stat]
 *           default: Id
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
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
 *                         $ref: '#/components/schemas/TaskDetail'
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.get('/filter', getTaskDetailsWithFilters);

/**
 * @swagger
 * /api/masters/projectScheduleEmp/statistics/all:
 *   get:
 *     summary: Get task details statistics
 *     tags: [TaskDetails]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalRecords:
 *                           type: integer
 *                         recordsWithAN:
 *                           type: integer
 *                         recordsWithAssignedEmp:
 *                           type: integer
 *                         recordsWithoutAN:
 *                           type: integer
 *                         recordsWithoutAssignedEmp:
 *                           type: integer
 *                         statusDistribution:
 *                           type: array
 *                           items:
 *                             type: object
 *                         scheduleStats:
 *                           type: object
 *                           properties:
 *                             tasksWithTimerBased:
 *                               type: integer
 *                             timerBasedCount:
 *                               type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/statistics/all', getTaskDetailsStatistics);

/**
 * @swagger
 * /api/masters/projectScheduleEmp/project/{projectId}:
 *   get:
 *     summary: Get task details by project ID
 *     tags: [TaskDetails]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
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
 *                         $ref: '#/components/schemas/TaskDetail'
 *       400:
 *         description: Invalid project ID
 *       500:
 *         description: Internal server error
 */
router.get('/project/:projectId', getTaskDetailsByProject);

/**
 * @swagger
 * /api/masters/projectScheduleEmp/schedule/{schId}:
 *   get:
 *     summary: Get task details by schedule ID
 *     tags: [TaskDetails]
 *     parameters:
 *       - in: path
 *         name: schId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
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
 *                         $ref: '#/components/schemas/TaskDetail'
 *       400:
 *         description: Invalid schedule ID
 *       500:
 *         description: Internal server error
 */
router.get('/schedule/:schId', getTaskDetailsBySchedule);

/**
 * @swagger
 * /api/masters/projectScheduleEmp/task/{taskId}:
 *   get:
 *     summary: Get task details by task ID
 *     tags: [TaskDetails]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
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
 *                         $ref: '#/components/schemas/TaskDetail'
 *       400:
 *         description: Invalid task ID
 *       500:
 *         description: Internal server error
 */
router.get('/task/:taskId', getTaskDetailsByTask);

/**
 * @swagger
 * /api/masters/projectScheduleEmp/employee/{empId}:
 *   get:
 *     summary: Get task details by employee ID
 *     tags: [TaskDetails]
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
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
 *                         $ref: '#/components/schemas/TaskDetail'
 *       400:
 *         description: Invalid employee ID
 *       500:
 *         description: Internal server error
 */
router.get('/employee/:empId', getTaskDetailsByEmployee);

/**
 * @swagger
 * /api/masters/projectScheduleEmp/{id}:
 *   get:
 *     summary: Get task detail by ID
 *     tags: [TaskDetails]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task detail ID
 *     responses:
 *       200:
 *         description: Task detail retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TaskDetail'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Task detail not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getTaskDetailById);

/**
 * @swagger
 * /api/masters/projectScheduleEmp/{id}:
 *   put:
 *     summary: Update task detail
 *     tags: [TaskDetails]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task detail ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskDetailUpdate'
 *     responses:
 *       200:
 *         description: Task detail updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TaskDetail'
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Task detail not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateTaskDetail);

/**
 * @swagger
 * /api/masters/projectScheduleEmp/{id}:
 *   delete:
 *     summary: Delete task detail
 *     tags: [TaskDetails]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task detail ID
 *     responses:
 *       200:
 *         description: Task detail deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Task detail not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteTaskDetail);

export default router;