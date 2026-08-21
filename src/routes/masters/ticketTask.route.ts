import express from 'express';
import {
    getAllTicketTasks,
    getTicketTaskById,
    createTicketTask,
    updateTicketTask,
    deleteTicketTask,
    getEmpIdByGlobalUserId
} from '../../controllers/masters/taskManagement/ticketTask.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ticket Tasks
 *   description: Ticket Task management endpoints mapping to tbl_Project_Ticket
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TicketTask:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 1
 *         project_id:
 *           type: integer
 *           format: int64
 *           nullable: true
 *           example: 10
 *         Ticket_Id:
 *           type: integer
 *           format: int64
 *           nullable: true
 *           example: 100
 *         Est_Sch_Start_Date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-08-20T10:00:00.000Z"
 *         Est_Sch_End_Date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-08-25T18:00:00.000Z"
 *         From_CompanyId:
 *           type: integer
 *           format: int64
 *           nullable: true
 *           example: 3
 *         To_CompanyId:
 *           type: integer
 *           format: int64
 *           nullable: true
 *           example: 6
 *         Employee_Involved_Id:
 *           type: integer
 *           format: int64
 *           nullable: true
 *           example: 262
 *         ticket_acc_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-08-20T10:15:00.000Z"
 *         tick_com_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-08-25T17:30:00.000Z"
 */

/**
 * @swagger
 * /api/masters/ticketTasks:
 *   get:
 *     summary: Get all ticket tasks with filtering
 *     tags: [Ticket Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: project_id
 *         in: query
 *         schema:
 *           type: integer
 *       - name: Ticket_Id
 *         in: query
 *         schema:
 *           type: integer
 *       - name: Employee_Involved_Id
 *         in: query
 *         schema:
 *           type: integer
 *       - name: From_CompanyId
 *         in: query
 *         schema:
 *           type: integer
 *       - name: To_CompanyId
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved ticket tasks
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
 *                   example: "Ticket tasks retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TicketTask'
 *                 total:
 *                   type: integer
 *                   example: 10
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, authorize([]), getAllTicketTasks);

/**
 * @swagger
 * /api/masters/ticketTasks/{id}:
 *   get:
 *     summary: Get a ticket task by ID
 *     tags: [Ticket Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved ticket task
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
 *                   example: "Ticket task retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TicketTask'
 *       404:
 *         description: Ticket task not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, authorize([]), getTicketTaskById);

/**
 * @swagger
 * /api/masters/ticketTasks:
 *   post:
 *     summary: Create a new ticket task
 *     tags: [Ticket Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: integer
 *               Ticket_Id:
 *                 type: integer
 *               Est_Sch_Start_Date:
 *                 type: string
 *                 format: date-time
 *               Est_Sch_End_Date:
 *                 type: string
 *                 format: date-time
 *               From_CompanyId:
 *                 type: integer
 *               To_CompanyId:
 *                 type: integer
 *               Employee_Involved_Id:
 *                 type: integer
 *               ticket_acc_date:
 *                 type: string
 *                 format: date-time
 *               tick_com_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Ticket task created successfully
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
 *                   example: "Ticket task created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TicketTask'
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize([]), createTicketTask);

/**
 * @swagger
 * /api/masters/ticketTasks/{id}:
 *   put:
 *     summary: Update an existing ticket task
 *     tags: [Ticket Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: integer
 *               Ticket_Id:
 *                 type: integer
 *               Est_Sch_Start_Date:
 *                 type: string
 *                 format: date-time
 *               Est_Sch_End_Date:
 *                 type: string
 *                 format: date-time
 *               From_CompanyId:
 *                 type: integer
 *               To_CompanyId:
 *                 type: integer
 *               Employee_Involved_Id:
 *                 type: integer
 *               ticket_acc_date:
 *                 type: string
 *                 format: date-time
 *               tick_com_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Ticket task updated successfully
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
 *                   example: "Ticket task updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TicketTask'
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Ticket task not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, authorize([]), updateTicketTask);

/**
 * @swagger
 * /api/masters/ticketTasks/{id}:
 *   delete:
 *     summary: Delete a ticket task by ID
 *     tags: [Ticket Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket task deleted successfully
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
 *                   example: "Ticket task deleted successfully"
 *       404:
 *         description: Ticket task not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, authorize([]), deleteTicketTask);
router.get('/getEmpId/:globalUserId', authenticate, getEmpIdByGlobalUserId);

export default router;
