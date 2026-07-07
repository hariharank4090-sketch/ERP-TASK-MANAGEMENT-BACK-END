"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const salesperson_controller_1 = require("../../controllers/Attendace/salesperson.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Sales Person Attendance
 *   description: Sales person attendance management endpoints
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     AttendanceRecord:
 *       type: object
 *       properties:
 *         Id:
 *           type: string
 *           example: "121475"
 *         UserId:
 *           type: integer
 *           example: 33
 *         Start_Date:
 *           type: string
 *           format: date-time
 *           example: "2026-04-16T05:05:37.973Z"
 *         End_Date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-05-04T05:43:18.477Z"
 *         Start_KM:
 *           type: integer
 *           nullable: true
 *           example: 5485
 *         End_KM:
 *           type: integer
 *           nullable: true
 *           example: 5490
 *         Latitude:
 *           type: string
 *           nullable: true
 *           example: "9.9656903"
 *         Longitude:
 *           type: string
 *           nullable: true
 *           example: "78.1258178"
 *         WorkSummary:
 *           type: string
 *           nullable: true
 *           example: null
 *         IsSalesPerson:
 *           type: integer
 *           example: 1
 *         Active_Status:
 *           type: integer
 *           example: 0
 *         User_Name:
 *           type: string
 *           nullable: true
 *           example: "Ravi Kumar"
 *         Branch_Id:
 *           type: integer
 *           nullable: true
 *           example: 3
 *         Start_KM_ImageName:
 *           type: string
 *           nullable: true
 *           example: "2026-04-16T05-05-37.581Z_photo.jpg"
 *         End_KM_ImageName:
 *           type: string
 *           nullable: true
 *           example: "2026-05-04T05-43-18.100Z_photo.jpg"
 *         Start_KM_ImagePath:
 *           type: string
 *           nullable: true
 *           example: "C:\\SMT_ERP_LIVE\\Pukal_Foods_ERP\\uploads\\attendance\\2026-04-16T05-05-37.581Z_photo.jpg"
 *         End_KM_ImagePath:
 *           type: string
 *           nullable: true
 *           example: "C:\\SMT_ERP_LIVE\\Pukal_Foods_ERP\\uploads\\attendance\\2026-05-04T05-43-18.100Z_photo.jpg"
 *         startKmImageUrl:
 *           type: string
 *           nullable: true
 *           example: "imageURL/imageNotFound"
 *         endKmImageUrl:
 *           type: string
 *           nullable: true
 *           example: "imageURL/imageNotFound"
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Data Found"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AttendanceRecord'
 *         others:
 *           type: object
 *           example: {}
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error message"
 *         data:
 *           type: array
 *           example: []
 *         others:
 *           type: object
 *           example: {}
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @swagger
 * /api/attendance/salesperson/add:
 *   post:
 *     summary: Add new attendance (check-in with start KM)
 *     tags: [Sales Person Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - UserId
 *             properties:
 *               UserId:
 *                 type: integer
 *                 example: 101
 *               Start_KM:
 *                 type: integer
 *                 example: 12500
 *               Latitude:
 *                 type: string
 *                 example: "10.9876"
 *               Longitude:
 *                 type: string
 *                 example: "78.1234"
 *               Start_KM_Pic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Attendance noted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/add', salesperson_controller_1.addAttendance);
/**
 * @swagger
 * /api/attendance/salesperson/last:
 *   get:
 *     summary: Get my last attendance record
 *     tags: [Sales Person Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: UserId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 101
 *     responses:
 *       200:
 *         description: Last attendance record retrieved
 *       400:
 *         description: Invalid input
 *       404:
 *         description: No records found
 *       500:
 *         description: Server error
 */
router.get('/last', salesperson_controller_1.getMyLastAttendance);
/**
 * @swagger
 * /api/attendance/salesperson/close:
 *   put:
 *     summary: Close attendance (check-out with end KM)
 *     tags: [Sales Person Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - Id
 *             properties:
 *               Id:
 *                 type: integer
 *                 example: 1
 *               End_KM:
 *                 type: integer
 *                 example: 12650
 *               Description:
 *                 type: string
 *                 example: "Visited 5 clients today"
 *               End_KM_Pic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Attendance closed successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/close', salesperson_controller_1.closeAttendance);
/**
 * @swagger
 * /api/attendance/salesperson/history:
 *   get:
 *     summary: Get attendance records with optional date range filters
 *     tags: [Sales Person Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: From
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD) - Optional, shows all data if not provided
 *         example: "2026-04-01"
 *       - in: query
 *         name: To
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD) - Optional, shows all data if not provided
 *         example: "2026-05-31"
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid date format
 *       404:
 *         description: No records found
 *       500:
 *         description: Server error
 */
router.get('/history', salesperson_controller_1.getAttendanceHistory);
/**
 * @swagger
 * /api/attendance/salesperson/today:
 *   get:
 *     summary: Get today's active attendance records
 *     tags: [Sales Person Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's attendance records retrieved
 *       404:
 *         description: No records found
 *       500:
 *         description: Server error
 */
router.get('/today', salesperson_controller_1.getTodayAttendance);
/**
 * @swagger
 * /api/attendance/salesperson/date-range:
 *   get:
 *     summary: Get attendance records by date range
 *     tags: [Sales Person Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2026-04-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2026-05-31"
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input (startDate and endDate are required)
 *       404:
 *         description: No records found
 *       500:
 *         description: Server error
 */
router.get('/date-range', salesperson_controller_1.getAttendanceByDateRange);
/**
 * @swagger
 * /api/attendance/salesperson/monthly/{year}/{month}:
 *   get:
 *     summary: Get monthly attendance records
 *     tags: [Sales Person Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year (YYYY)
 *         example: 2026
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: Month (1-12)
 *         example: 4
 *     responses:
 *       200:
 *         description: Monthly attendance records retrieved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/monthly/:year/:month', salesperson_controller_1.getMonthlyAttendance);
/**
 * @swagger
 * /api/attendance/salesperson/summary:
 *   get:
 *     summary: Get employee attendance summary
 *     tags: [Sales Person Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: UserId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID (required for summary)
 *         example: 33
 *       - in: query
 *         name: month
 *         required: false
 *         schema:
 *           type: integer
 *         description: Month (1-12), defaults to current month
 *         example: 4
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *         description: Year (YYYY), defaults to current year
 *         example: 2026
 *     responses:
 *       200:
 *         description: Attendance summary retrieved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/summary', salesperson_controller_1.getEmployeeAttendanceSummary);
/**
 * @swagger
 * /api/attendance/salesperson/stats:
 *   get:
 *     summary: Get attendance statistics
 *     tags: [Sales Person Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: FromDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2026-04-01"
 *       - in: query
 *         name: ToDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2026-05-31"
 *       - in: query
 *         name: UserTypeID
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by user type ID (optional)
 *         example: 6
 *     responses:
 *       200:
 *         description: Attendance statistics retrieved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/stats', salesperson_controller_1.getAttendanceStats);
/**
 * @swagger
 * /api/attendance/salesperson/departments:
 *   get:
 *     summary: Get all distinct departments
 *     tags: [Sales Person Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Department list retrieved
 *       500:
 *         description: Server error
 */
router.get('/departments', salesperson_controller_1.getDepartment);
/**
 * @swagger
 * /api/attendance/salesperson/employeewise:
 *   get:
 *     summary: Get employee-wise attendance statistics
 *     tags: [Sales Person Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: FromDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2026-04-01"
 *       - in: query
 *         name: ToDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2026-05-31"
 *     responses:
 *       200:
 *         description: Employee-wise statistics retrieved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/employeewise', salesperson_controller_1.employeewise);
/**
 * @swagger
 * /api/attendance/salesperson/employees-by-department:
 *   post:
 *     summary: Get employees list filtered by department
 *     tags: [Sales Person Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - department
 *             properties:
 *               department:
 *                 type: string
 *                 example: "Sales"
 *     responses:
 *       200:
 *         description: Employee list retrieved
 *       400:
 *         description: Department is required
 *       500:
 *         description: Server error
 */
router.post('/employees-by-department', salesperson_controller_1.getEmployeesByDepartment);
exports.default = router;
