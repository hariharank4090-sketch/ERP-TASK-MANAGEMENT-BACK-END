import express from 'express';
import { getTickets, updateTicketStatus } from '../../controllers/masters/taskManagement/ticket.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management endpoints - Retrieve tickets with permission validations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           format: int64
 *           example: 1
 *         Description:
 *           type: string
 *           nullable: true
 *           example: "Issues regarding db schema update"
 *         Ret_Id:
 *           type: integer
 *           format: int64
 *           nullable: true
 *         Category:
 *           type: string
 *           nullable: true
 *           example: "1"
 *         Subject:
 *           type: string
 *           nullable: true
 *           example: "Update local database indexes"
 *         Priority:
 *           type: string
 *           nullable: true
 *           example: "High"
 *         Image_Url:
 *           type: string
 *           nullable: true
 *         Created_By:
 *           type: integer
 *           format: int64
 *           nullable: true
 *         Created_At:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Updated_By:
 *           type: integer
 *           format: int64
 *           nullable: true
 *         Updated_At:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Status:
 *           type: string
 *           nullable: true
 *           example: "Open"
 *         From_CompanyId:
 *           type: integer
 *           format: int64
 *           nullable: true
 *         To_CompanyId:
 *           type: integer
 *           format: int64
 *           nullable: true
 *         Created_By_Name:
 *           type: string
 *           nullable: true
 *           example: "John Doe"
 *         Category_Name:
 *           type: string
 *           nullable: true
 *           example: "Database Migration"
 */

/**
 * @swagger
 * /api/masters/tickets:
 *   get:
 *     summary: Get all tickets for a company/user
 *     description: Retrieve all tickets associated with a company or user, filtered by permission levels (Admin/Management sees all tickets for their company, regular users see only their own).
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: User_Id
 *         in: query
 *         required: false
 *         description: "Numeric ID of the user (Optional: Defaults to authenticated user's ID)"
 *         schema:
 *           type: string
 *         example: "262"
 *       - name: companyId
 *         in: query
 *         required: false
 *         description: "Numeric ID of the company (Optional: Defaults to authenticated user's company ID)"
 *         schema:
 *           type: string
 *         example: "3"
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         required: false
 *         description: Number of records per page (max 200)
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Tickets fetched successfully
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
 *                   example: "Tickets fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid input or missing required fields
 *       403:
 *         description: Unauthorized company/user access
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/masters/tickets/{User_Id}:
 *   get:
 *     summary: Get tickets by User ID route parameter
 *     description: Retrieve all tickets associated with a company or user by supplying User_Id in route path, filtered by permission levels (Admin/Management sees all tickets for their company, regular users see only their own).
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: User_Id
 *         in: path
 *         required: true
 *         description: Numeric ID of the user
 *         schema:
 *           type: string
 *         example: "262"
 *       - name: companyId
 *         in: query
 *         required: false
 *         description: "Numeric ID of the company (Optional: Defaults to authenticated user's company ID)"
 *         schema:
 *           type: string
 *         example: "3"
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         required: false
 *         description: Number of records per page (max 200)
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Tickets fetched successfully
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
 *                   example: "Tickets fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid input or missing required fields
 *       403:
 *         description: Unauthorized company/user access
 *       500:
 *         description: Internal server error
 */
router.get('/:User_Id?', getTickets);
router.put('/', updateTicketStatus);

export default router;
