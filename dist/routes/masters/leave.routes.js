"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leave_controller_1 = require("../../controllers/masters/taskManagement/leave.controller");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Leave Master
 *   description: Leave Master management - Apply, Approve, and Manage employee leaves
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Leave:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         User_Id:
 *           type: integer
 *           example: 10
 *         FromDate:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T00:00:00.000Z"
 *         ToDate:
 *           type: string
 *           format: date-time
 *           example: "2025-01-16T00:00:00.000Z"
 *         Session:
 *           type: string
 *           enum: [FN, AN, Full]
 *           example: "Full"
 *         NoOfDays:
 *           type: number
 *           example: 2
 *         LeaveType_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Department:
 *           type: string
 *           nullable: true
 *           example: "Engineering"
 *         InCharge:
 *           type: integer
 *           nullable: true
 *           example: 5
 *         Reason:
 *           type: string
 *           nullable: true
 *           example: "Medical appointment"
 *         Created_By:
 *           type: integer
 *           nullable: true
 *           example: 10
 *         Created_At:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Approved_By:
 *           type: integer
 *           nullable: true
 *           example: 5
 *         Approved_At:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         Approver_Reason:
 *           type: string
 *           nullable: true
 *           example: "Approved as per policy"
 *         Status:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *           example: "Pending"
 *         statusText:
 *           type: string
 *           example: "Pending"
 *         UserName:
 *           type: string
 *           nullable: true
 *           example: "John Doe"
 *         LeaveType:
 *           type: string
 *           nullable: true
 *           example: "Casual Leave"
 *         ApproverName:
 *           type: string
 *           nullable: true
 *           example: "Jane Smith"
 *         InChargeName:
 *           type: string
 *           nullable: true
 *           example: "Manager Name"
 *
 *     LeaveCreate:
 *       type: object
 *       required:
 *         - User_Id
 *         - FromDate
 *         - ToDate
 *         - Session
 *         - NoOfDays
 *       properties:
 *         User_Id:
 *           type: integer
 *           example: 10
 *         FromDate:
 *           type: string
 *           format: date
 *           example: "2025-01-15"
 *         ToDate:
 *           type: string
 *           format: date
 *           example: "2025-01-16"
 *         Session:
 *           type: string
 *           enum: [FN, AN, Full]
 *           default: Full
 *         NoOfDays:
 *           type: number
 *           example: 2
 *         LeaveType_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Department:
 *           type: string
 *           nullable: true
 *           example: "Engineering"
 *         InCharge:
 *           type: integer
 *           nullable: true
 *           example: 5
 *         Reason:
 *           type: string
 *           nullable: true
 *           example: "Medical appointment"
 *         Created_By:
 *           type: integer
 *           nullable: true
 *           example: 10
 *         Status:
 *           type: string
 *           nullable: true
 *           default: Pending
 *
 *     LeaveUpdate:
 *       type: object
 *       required:
 *         - Id
 *       properties:
 *         Id:
 *           type: integer
 *           example: 1
 *         LeaveType_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Approver_Reason:
 *           type: string
 *           nullable: true
 *           example: "Approved as per policy"
 *         Approved_By:
 *           type: integer
 *           nullable: true
 *           example: 5
 *         Status:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *           nullable: true
 *           example: "Approved"
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
 *                 example: "User_Id"
 *               message:
 *                 type: string
 *                 example: "User_Id must be positive"
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Leave applied successfully"
 *         data:
 *           $ref: '#/components/schemas/Leave'
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
 *             total:
 *               type: integer
 *             pending:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 text:
 *                   type: string
 *             approved:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 text:
 *                   type: string
 *             rejected:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 text:
 *                   type: string
 *
 *   parameters:
 *     LeaveIdParam:
 *       name: id
 *       in: path
 *       required: true
 *       description: Leave record ID
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
 *
 *     UserIdQuery:
 *       name: UserId
 *       in: query
 *       required: false
 *       description: Filter leaves by User ID (0 or omit for all)
 *       schema:
 *         type: integer
 *       example: 10
 *
 *     UserTypeIdQuery:
 *       name: UserTypeId
 *       in: query
 *       required: false
 *       description: User type for filtering (0=SuperAdmin, 1=Admin, 2=Manager, 3=Employee)
 *       schema:
 *         type: integer
 *         enum: [0, 1, 2, 3]
 *       example: 3
 *
 *     FromDateQuery:
 *       name: FromDate
 *       in: query
 *       required: false
 *       description: Filter from date (YYYY-MM-DD)
 *       schema:
 *         type: string
 *         format: date
 *       example: "2025-01-01"
 *
 *     ToDateQuery:
 *       name: ToDate
 *       in: query
 *       required: false
 *       description: Filter to date (YYYY-MM-DD)
 *       schema:
 *         type: string
 *         format: date
 *       example: "2025-01-31"
 *
 *     UserIdForApprove:
 *       name: userId
 *       in: query
 *       required: true
 *       description: InCharge user ID to get leaves pending for their approval
 *       schema:
 *         type: integer
 *       example: 5
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
// ==================== READ ROUTES ====================
/**
 * @swagger
 * /api/masters/leave/statistics:
 *   get:
 *     summary: Get leave statistics
 *     description: Retrieve total, pending, approved, and rejected leave counts
 *     tags: [Leave Master]
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
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/statistics', auth_1.authenticate, (0, auth_1.authorize)([]), leave_controller_1.getLeaveStatistics);
/**
 * @swagger
 * /api/masters/leave/status-options:
 *   get:
 *     summary: Get status and session options for dropdowns
 *     description: Retrieve all available status and session options
 *     tags: [Leave Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Options retrieved successfully
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
 *                             type: string
 *                           label:
 *                             type: string
 *                     sessionOptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                           label:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/status-options', auth_1.authenticate, (0, auth_1.authorize)([]), leave_controller_1.getStatusOptions);
/**
 * @swagger
 * /api/masters/leave/approve-data:
 *   get:
 *     summary: Get leaves pending for approval by a specific InCharge user
 *     description: Returns all leave records where the logged-in user is the InCharge
 *     tags: [Leave Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdForApprove'
 *     responses:
 *       200:
 *         description: Approve data retrieved successfully
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
 *                   example: "Approve data retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Leave'
 *                 totalRecords:
 *                   type: integer
 *       400:
 *         description: userId is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/approve-data', auth_1.authenticate, (0, auth_1.authorize)([1, 2]), leave_controller_1.getApproveData);
/**
 * @swagger
 * /api/masters/leave:
 *   get:
 *     summary: Get all leave records with optional filters
 *     description: Returns leave records filtered by user, date range, and user type
 *     tags: [Leave Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdQuery'
 *       - $ref: '#/components/parameters/UserTypeIdQuery'
 *       - $ref: '#/components/parameters/FromDateQuery'
 *       - $ref: '#/components/parameters/ToDateQuery'
 *     responses:
 *       200:
 *         description: Leave records retrieved successfully
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
 *                   example: "Leave records retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Leave'
 *                 totalRecords:
 *                   type: integer
 *                   example: 25
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', auth_1.authenticate, (0, auth_1.authorize)([]), leave_controller_1.getLeaveList);
/**
 * @swagger
 * /api/masters/leave/{id}:
 *   get:
 *     summary: Get a single leave record by ID
 *     description: Retrieve a specific leave record
 *     tags: [Leave Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/LeaveIdParam'
 *     responses:
 *       200:
 *         description: Leave record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave record not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), leave_controller_1.getLeaveById);
// ==================== WRITE ROUTES ====================
/**
 * @swagger
 * /api/masters/leave:
 *   post:
 *     summary: Apply for leave
 *     description: Submit a new leave application
 *     tags: [Leave Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveCreate'
 *     responses:
 *       201:
 *         description: Leave applied successfully
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
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/', auth_1.authenticate, (0, auth_1.authorize)([]), leave_controller_1.applyLeave);
/**
 * @swagger
 * /api/masters/leave:
 *   put:
 *     summary: Update or approve a leave record
 *     description: Update leave details, approve or reject a leave (Admin/Manager only)
 *     tags: [Leave Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveUpdate'
 *     responses:
 *       200:
 *         description: Leave updated successfully
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
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Manager required
 *       404:
 *         description: Leave record not found
 *       500:
 *         description: Internal server error
 */
router.put('/', auth_1.authenticate, (0, auth_1.authorize)([]), leave_controller_1.updateLeave);
/**
 * @swagger
 * /api/masters/leave:
 *   delete:
 *     summary: Delete a leave record
 *     description: Permanently delete a leave record by ID (Admin only)
 *     tags: [Leave Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Id
 *             properties:
 *               Id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Leave record deleted successfully
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
 *                   example: "Leave record deleted successfully"
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Leave record not found
 *       500:
 *         description: Internal server error
 */
router.delete('/', auth_1.authenticate, (0, auth_1.authorize)([]), leave_controller_1.deleteLeave);
exports.default = router;
