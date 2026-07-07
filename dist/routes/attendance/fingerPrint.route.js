"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fingerPrintAttendance_controller_1 = require("../../controllers/Attendace/fingerPrintAttendance.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Fingerprint Attendance
 *   description: Fingerprint attendance management endpoints
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     AttendanceResult:
 *       type: object
 *       properties:
 *         fingerPrintEmpId:
 *           type: string
 *           example: "PT001"
 *         Designation_Name:
 *           type: string
 *           example: "Software Engineer"
 *         username:
 *           type: string
 *           example: "John Doe"
 *         Sex:
 *           type: string
 *           nullable: true
 *           example: "Male"
 *         LogDate:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         AttendanceDetails:
 *           type: string
 *           example: "09:00, 13:00, 14:00, 18:00"
 *         TotalRecords:
 *           type: integer
 *           example: 4
 *         AttendanceStatus:
 *           type: string
 *           enum: [P, A, L, H, DL]
 *           example: "P"
 *
 *     AttendanceSummary:
 *       type: object
 *       properties:
 *         employeeId:
 *           type: string
 *           example: "25"
 *         month:
 *           type: integer
 *           example: 1
 *         year:
 *           type: integer
 *           example: 2024
 *         totalDays:
 *           type: integer
 *           example: 22
 *         presentDays:
 *           type: integer
 *           example: 20
 *         absentDays:
 *           type: integer
 *           example: 1
 *         leaveDays:
 *           type: integer
 *           example: 1
 *         holidayDays:
 *           type: integer
 *           example: 0
 *         defaultLeaveDays:
 *           type: integer
 *           example: 0
 *         attendancePercentage:
 *           type: number
 *           example: 90.91
 *
 *     AttendanceStats:
 *       type: object
 *       properties:
 *         totalEmployees:
 *           type: integer
 *           example: 50
 *         totalPresent:
 *           type: integer
 *           example: 45
 *         totalAbsent:
 *           type: integer
 *           example: 3
 *         totalLeave:
 *           type: integer
 *           example: 2
 *         attendanceRate:
 *           type: number
 *           example: 90.0
 *
 *     DefaultLeave:
 *       type: object
 *       properties:
 *         SNo:
 *           type: integer
 *           example: 1
 *         Date:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         Description:
 *           type: string
 *           nullable: true
 *           example: "New Year Holiday"
 *         Created_By:
 *           type: string
 *           nullable: true
 *           example: "Admin"
 *         Created_At:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-01T10:00:00Z"
 *         Modified_By:
 *           type: string
 *           nullable: true
 *           example: "Admin"
 *         Modified_At:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-01T10:00:00Z"
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
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Data found"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AttendanceResult'
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @swagger
 * /api/attendance/fingerprint:
 *   get:
 *     summary: Get fingerprint attendance records
 *     tags: [Fingerprint Attendance]
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
 *         example: "2024-01-01"
 *       - in: query
 *         name: ToDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2024-01-31"
 *       - in: query
 *         name: FingerPrintId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by fingerprint device ID
 *         example: "PT001"
 *       - in: query
 *         name: EmpId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *         example: "25"
 *     responses:
 *       200:
 *         description: Successfully retrieved attendance records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', fingerPrintAttendance_controller_1.getFingerprintAttendance);
/**
 * @swagger
 * /api/attendance/fingerprint/today:
 *   get:
 *     summary: Get today's attendance for all employees
 *     tags: [Fingerprint Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved today's attendance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/today', fingerPrintAttendance_controller_1.getTodayAttendance);
/**
 * @swagger
 * /api/attendance/fingerprint/summary:
 *   get:
 *     summary: Get attendance summary for an employee
 *     tags: [Fingerprint Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: EmpId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *         example: "25"
 *       - in: query
 *         name: month
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month number (1-12, defaults to current)
 *         example: 1
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *         description: Year (defaults to current)
 *         example: 2024
 *     responses:
 *       200:
 *         description: Successfully retrieved attendance summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AttendanceSummary'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/summary', fingerPrintAttendance_controller_1.getEmployeeAttendanceSummary);
/**
 * @swagger
 * /api/attendance/fingerprint/employee/{empId}:
 *   get:
 *     summary: Get attendance for specific employee
 *     tags: [Fingerprint Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *         example: "25"
 *       - in: query
 *         name: FromDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: ToDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Successfully retrieved employee attendance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No records found
 *       500:
 *         description: Server error
 */
router.get('/employee/:empId', fingerPrintAttendance_controller_1.getEmployeeAttendance);
/**
 * @swagger
 * /api/attendance/fingerprint/device/{deviceId}:
 *   get:
 *     summary: Get attendance for specific fingerprint device
 *     tags: [Fingerprint Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Fingerprint Device ID
 *         example: "PT001"
 *       - in: query
 *         name: FromDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: ToDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Successfully retrieved device attendance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/device/:deviceId', fingerPrintAttendance_controller_1.getDeviceAttendance);
/**
 * @swagger
 * /api/attendance/fingerprint/date-range:
 *   get:
 *     summary: Get attendance for custom date range
 *     tags: [Fingerprint Attendance]
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
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2024-01-31"
 *       - in: query
 *         name: EmpId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *         example: "25"
 *       - in: query
 *         name: FingerPrintId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by fingerprint device ID
 *         example: "PT001"
 *     responses:
 *       200:
 *         description: Successfully retrieved attendance records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/date-range', fingerPrintAttendance_controller_1.getAttendanceByDateRange);
/**
 * @swagger
 * /api/attendance/fingerprint/month/{year}/{month}:
 *   get:
 *     summary: Get attendance for specific month
 *     tags: [Fingerprint Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year
 *         example: 2024
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month number (1-12)
 *         example: 1
 *       - in: query
 *         name: EmpId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *         example: "25"
 *       - in: query
 *         name: FingerPrintId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by fingerprint device ID
 *         example: "PT001"
 *     responses:
 *       200:
 *         description: Successfully retrieved monthly attendance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/month/:year/:month', fingerPrintAttendance_controller_1.getMonthlyAttendance);
/**
 * @swagger
 * /api/attendance/fingerprint/absent:
 *   get:
 *     summary: Get absent employees for a date range
 *     tags: [Fingerprint Attendance]
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
 *         example: "2024-01-01"
 *       - in: query
 *         name: ToDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Successfully retrieved absent employees
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/absent', fingerPrintAttendance_controller_1.getAbsentEmployees);
/**
 * @swagger
 * /api/attendance/fingerprint/present:
 *   get:
 *     summary: Get present employees for a date range
 *     tags: [Fingerprint Attendance]
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
 *         example: "2024-01-01"
 *       - in: query
 *         name: ToDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Successfully retrieved present employees
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/present', fingerPrintAttendance_controller_1.getPresentEmployees);
/**
 * @swagger
 * /api/attendance/fingerprint/stats:
 *   get:
 *     summary: Get attendance statistics
 *     tags: [Fingerprint Attendance]
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
 *         example: "2024-01-01"
 *       - in: query
 *         name: ToDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Successfully retrieved attendance statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AttendanceStats'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', fingerPrintAttendance_controller_1.getAttendanceStats);
/**
 * @swagger
 * /api/attendance/fingerprint/default-leaves:
 *   get:
 *     summary: Get all default leave records
 *     tags: [Fingerprint Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved default leave records
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
 *                   example: "Data found"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DefaultLeave'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/default-leaves', fingerPrintAttendance_controller_1.getAllDefaultLeaves);
/**
 * @swagger
 * /api/attendance/fingerprint/default-leaves/date-range:
 *   get:
 *     summary: Get default leave records by date range
 *     tags: [Fingerprint Attendance]
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
 *         example: "2024-01-01"
 *       - in: query
 *         name: ToDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Successfully retrieved default leave records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DefaultLeave'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/default-leaves/date-range', fingerPrintAttendance_controller_1.getDefaultLeavesByDateRange);
/**
 * @swagger
 * /api/attendance/fingerprint/default-leaves/{id}:
 *   get:
 *     summary: Get default leave record by ID
 *     tags: [Fingerprint Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Default leave record ID (SNo)
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved default leave record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DefaultLeave'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.get('/default-leaves/:id', fingerPrintAttendance_controller_1.getDefaultLeaveById);
/**
 * @swagger
 * /api/attendance/fingerprint/fingerprintSync:
 *   post:
 *     summary: Sync fingerprint attendance data for a date range
 *     tags: [Fingerprint Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date (YYYY-MM-DD)
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date (YYYY-MM-DD)
 *                 example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Attendance sync completed successfully
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
 *                   example: "Attendance sync completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       example: "2024-01-01"
 *                     endDate:
 *                       type: string
 *                       example: "2024-01-31"
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/fingerprintSync', fingerPrintAttendance_controller_1.attendanceSync);
exports.default = router;
