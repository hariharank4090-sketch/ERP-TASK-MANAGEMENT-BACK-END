import express from 'express';
import {
    getAllEmployees,
    getEmployeeById,
    getEmployeeByCode,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesByBranch,
    getEmployeesByDepartment,
    getActiveEmployees,
    bulkCreateEmployees,
    getEmployeeStatistics,
    partialUpdateEmployee,
    searchEmployees,
    getEmployeeCount,
    getEmployeesBySalaryRange,
} from '../../controllers/masters/taskManagement/employeemaster.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Employee Master
 *   description: Employee Master management endpoints - Create, Read, Update, Delete employees
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       properties:
 *         Emp_Id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         Branch:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         fingerPrintEmpId:
 *           type: string
 *           nullable: true
 *           example: "FP12345"
 *         Emp_Code:
 *           type: string
 *           example: "EMP001"
 *         Emp_Name:
 *           type: string
 *           example: "John Doe"
 *         Designation:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         DOB:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "1990-01-15"
 *         DOJ:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2020-06-01"
 *         Department_ID:
 *           type: integer
 *           nullable: true
 *           example: 3
 *         Address_1:
 *           type: string
 *           nullable: true
 *           example: "123 Main Street"
 *         Address_2:
 *           type: string
 *           nullable: true
 *           example: "Apt 4B"
 *         City:
 *           type: string
 *           nullable: true
 *           example: "Mumbai"
 *         Country:
 *           type: string
 *           nullable: true
 *           example: "India"
 *         Pincode:
 *           type: string
 *           nullable: true
 *           example: "400001"
 *         Mobile_No:
 *           type: string
 *           nullable: true
 *           example: "9876543210"
 *         Education:
 *           type: string
 *           nullable: true
 *           example: "Bachelor's Degree"
 *         Fathers_Name:
 *           type: string
 *           nullable: true
 *           example: "Robert Doe"
 *         Mothers_Name:
 *           type: string
 *           nullable: true
 *           example: "Sarah Doe"
 *         Spouse_Name:
 *           type: string
 *           nullable: true
 *           example: "Jane Doe"
 *         Sex:
 *           type: string
 *           enum: [Male, Female, Other]
 *           nullable: true
 *           example: "Male"
 *         Emp_Religion:
 *           type: string
 *           nullable: true
 *           example: "Christian"
 *         Salary:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 50000.00
 *         Total_Loan:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 10000.00
 *         Salary_Advance:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 5000.00
 *         Due_Loan:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 5000.00
 *         User_Mgt_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Entry_By:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Entry_Date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-15T10:30:00.000Z"
 *         Department:
 *           type: string
 *           nullable: true
 *           example: "Information Technology"
 *         Location:
 *           type: string
 *           nullable: true
 *           example: "Head Office"
 *         Update_By:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Update_Date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-03-20T14:30:00.000Z"
 *
 *     EmployeeCreate:
 *       type: object
 *       required:
 *         - Emp_Code
 *         - Emp_Name
 *       properties:
 *         Branch:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         fingerPrintEmpId:
 *           type: string
 *           nullable: true
 *           example: "FP12345"
 *         Emp_Code:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           example: "EMP001"
 *         Emp_Name:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           example: "John Doe"
 *         Designation:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         DOB:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "1990-01-15"
 *         DOJ:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2020-06-01"
 *         Department_ID:
 *           type: integer
 *           nullable: true
 *           example: 3
 *         Address_1:
 *           type: string
 *           nullable: true
 *           example: "123 Main Street"
 *         Address_2:
 *           type: string
 *           nullable: true
 *           example: "Apt 4B"
 *         City:
 *           type: string
 *           nullable: true
 *           example: "Mumbai"
 *         Country:
 *           type: string
 *           nullable: true
 *           example: "India"
 *         Pincode:
 *           type: string
 *           nullable: true
 *           example: "400001"
 *         Mobile_No:
 *           type: string
 *           nullable: true
 *           example: "9876543210"
 *         Education:
 *           type: string
 *           nullable: true
 *           example: "Bachelor's Degree"
 *         Fathers_Name:
 *           type: string
 *           nullable: true
 *           example: "Robert Doe"
 *         Mothers_Name:
 *           type: string
 *           nullable: true
 *           example: "Sarah Doe"
 *         Spouse_Name:
 *           type: string
 *           nullable: true
 *           example: "Jane Doe"
 *         Sex:
 *           type: string
 *           enum: [Male, Female, Other]
 *           nullable: true
 *           example: "Male"
 *         Emp_Religion:
 *           type: string
 *           nullable: true
 *           example: "Christian"
 *         Salary:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 50000.00
 *         Total_Loan:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 10000.00
 *         Salary_Advance:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 5000.00
 *         Due_Loan:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 5000.00
 *         User_Mgt_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Department:
 *           type: string
 *           nullable: true
 *           example: "Information Technology"
 *         Location:
 *           type: string
 *           nullable: true
 *           example: "Head Office"
 *
 *     EmployeeUpdate:
 *       type: object
 *       properties:
 *         Branch:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         fingerPrintEmpId:
 *           type: string
 *           nullable: true
 *           example: "FP12345"
 *         Emp_Code:
 *           type: string
 *           maxLength: 50
 *           example: "EMP001"
 *         Emp_Name:
 *           type: string
 *           maxLength: 255
 *           example: "John Doe Updated"
 *         Designation:
 *           type: integer
 *           nullable: true
 *           example: 3
 *         DOB:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "1990-01-15"
 *         DOJ:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2020-06-01"
 *         Department_ID:
 *           type: integer
 *           nullable: true
 *           example: 4
 *         Address_1:
 *           type: string
 *           nullable: true
 *           example: "456 New Street"
 *         Address_2:
 *           type: string
 *           nullable: true
 *           example: "Suite 100"
 *         City:
 *           type: string
 *           nullable: true
 *           example: "Delhi"
 *         Country:
 *           type: string
 *           nullable: true
 *           example: "India"
 *         Pincode:
 *           type: string
 *           nullable: true
 *           example: "110001"
 *         Mobile_No:
 *           type: string
 *           nullable: true
 *           example: "9876543210"
 *         Education:
 *           type: string
 *           nullable: true
 *           example: "Master's Degree"
 *         Fathers_Name:
 *           type: string
 *           nullable: true
 *           example: "Robert Doe"
 *         Mothers_Name:
 *           type: string
 *           nullable: true
 *           example: "Sarah Doe"
 *         Spouse_Name:
 *           type: string
 *           nullable: true
 *           example: "Jane Doe"
 *         Sex:
 *           type: string
 *           enum: [Male, Female, Other]
 *           nullable: true
 *           example: "Male"
 *         Emp_Religion:
 *           type: string
 *           nullable: true
 *           example: "Hindu"
 *         Salary:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 60000.00
 *         Total_Loan:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 5000.00
 *         Salary_Advance:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 2000.00
 *         Due_Loan:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           example: 3000.00
 *         User_Mgt_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         Department:
 *           type: string
 *           nullable: true
 *           example: "Human Resources"
 *         Location:
 *           type: string
 *           nullable: true
 *           example: "Branch Office"
 *
 *     EmployeeBulkCreate:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/EmployeeCreate'
 *
 *     PaginationMetadata:
 *       type: object
 *       properties:
 *         totalRecords:
 *           type: integer
 *           example: 150
 *         currentPage:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 8
 *         pageSize:
 *           type: integer
 *           example: 20
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *         hasPreviousPage:
 *           type: boolean
 *           example: false
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
 *                 example: "Emp_Code"
 *               message:
 *                 type: string
 *                 example: "Employee Code is required"
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Employee created successfully"
 *         data:
 *           $ref: '#/components/schemas/Employee'
 *
 *     BulkCreateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Bulk employee creation completed"
 *         created:
 *           type: integer
 *           example: 5
 *         failed:
 *           type: integer
 *           example: 1
 *         results:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               empCode:
 *                 type: string
 *               success:
 *                 type: boolean
 *               employeeId:
 *                 type: integer
 *               message:
 *                 type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               empCode:
 *                 type: string
 *               message:
 *                 type: string
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *
 *     EmployeeStatistics:
 *       type: object
 *       properties:
 *         totalEmployees:
 *           type: integer
 *           example: 100
 *         genderDistribution:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               Sex:
 *                 type: string
 *                 example: "Male"
 *               count:
 *                 type: integer
 *                 example: 60
 *         departmentDistribution:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               Department_ID:
 *                 type: integer
 *                 example: 1
 *               Department:
 *                 type: string
 *                 example: "IT"
 *               count:
 *                 type: integer
 *                 example: 20
 *         salaryStatistics:
 *           type: object
 *           properties:
 *             averageSalary:
 *               type: number
 *               format: decimal
 *               example: 45000.50
 *             maxSalary:
 *               type: number
 *               format: decimal
 *               example: 100000.00
 *             minSalary:
 *               type: number
 *               format: decimal
 *               example: 25000.00
 *             totalSalary:
 *               type: number
 *               format: decimal
 *               example: 4500050.00
 *
 *   parameters:
 *     EmployeeIdParam:
 *       name: id
 *       in: path
 *       required: true
 *       description: Employee ID
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
 *
 *     EmployeeCodeParam:
 *       name: empCode
 *       in: path
 *       required: true
 *       description: Employee Code
 *       schema:
 *         type: string
 *         minLength: 1
 *         maxLength: 50
 *       example: "EMP001"
 *
 *     BranchIdParam:
 *       name: branchId
 *       in: path
 *       required: true
 *       description: Branch ID
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
 *
 *     DepartmentIdParam:
 *       name: departmentId
 *       in: path
 *       required: true
 *       description: Department ID
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
 *
 *     SearchQuery:
 *       name: search
 *       in: query
 *       required: false
 *       description: Search by employee code, name, or mobile number
 *       schema:
 *         type: string
 *       example: "John"
 *
 *     BranchFilter:
 *       name: branch
 *       in: query
 *       required: false
 *       description: Filter by branch ID
 *       schema:
 *         type: integer
 *       example: 1
 *
 *     DepartmentFilter:
 *       name: departmentId
 *       in: query
 *       required: false
 *       description: Filter by department ID
 *       schema:
 *         type: integer
 *       example: 1
 *
 *     DesignationFilter:
 *       name: designation
 *       in: query
 *       required: false
 *       description: Filter by designation ID
 *       schema:
 *         type: integer
 *       example: 1
 *
 *     SortByParam:
 *       name: sortBy
 *       in: query
 *       required: false
 *       description: >
 *         Sort field. Must be a valid column on tbl_Employee_Master.
 *         Defaults to Emp_Id when an unrecognised value is supplied.
 *       schema:
 *         type: string
 *         enum:
 *           - Emp_Id
 *           - Emp_Code
 *           - Emp_Name
 *           - DOJ
 *           - DOB
 *           - Department_ID
 *           - Designation
 *           - Branch
 *           - Salary
 *           - Entry_Date
 *           - Update_Date
 *         default: Emp_Id
 *
 *     SortOrderParam:
 *       name: sortOrder
 *       in: query
 *       required: false
 *       description: Sort direction
 *       schema:
 *         type: string
 *         enum: [ASC, DESC]
 *         default: DESC
 *
 *     MinSalaryQuery:
 *       name: minSalary
 *       in: query
 *       required: false
 *       description: Minimum salary filter
 *       schema:
 *         type: number
 *         format: decimal
 *         minimum: 0
 *       example: 30000
 *
 *     MaxSalaryQuery:
 *       name: maxSalary
 *       in: query
 *       required: false
 *       description: Maximum salary filter
 *       schema:
 *         type: number
 *         format: decimal
 *         minimum: 0
 *       example: 80000
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter your JWT token
 */

// ==================== READ ROUTES (Authentication Required) ====================

/**
 * @swagger
 * /api/masters/employees:
 *   get:
 *     summary: Get all employees with optional filtering
 *     description: >
 *       Returns the complete employee list with optional search, branch, department,
 *       designation filters and sorting. Non-admin users only see records scoped to
 *       their own User_Mgt_Id.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/BranchFilter'
 *       - $ref: '#/components/parameters/DepartmentFilter'
 *       - $ref: '#/components/parameters/DesignationFilter'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
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
 *                   example: "Employees retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *                 totalCount:
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
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, authorize([]), getAllEmployees);

/**
 * @swagger
 * /api/masters/employees/active:
 *   get:
 *     summary: Get all active employees
 *     description: Returns all employees sorted by name. Non-admin users see only their scoped records.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Maximum number of records to return (max 1000)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 1000
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
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
 *                     $ref: '#/components/schemas/Employee'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/active', authenticate, authorize([]), getActiveEmployees);

/**
 * @swagger
 * /api/masters/employees/statistics:
 *   get:
 *     summary: Get employee statistics
 *     description: >
 *       Returns aggregate statistics — total count, gender distribution,
 *       department distribution, and salary stats (avg / min / max / sum).
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee statistics retrieved successfully
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
 *                   $ref: '#/components/schemas/EmployeeStatistics'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/statistics', authenticate, authorize([]), getEmployeeStatistics);

/**
 * @swagger
 * /api/masters/employees/search:
 *   get:
 *     summary: Search employees with advanced filtering
 *     description: Search employees using multiple filter criteria.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: query
 *         required: false
 *         description: Search by employee name (partial match)
 *         schema:
 *           type: string
 *         example: "John"
 *       - name: department
 *         in: query
 *         required: false
 *         description: Filter by department ID
 *         schema:
 *           type: integer
 *         example: 1
 *       - name: designation
 *         in: query
 *         required: false
 *         description: Filter by designation ID
 *         schema:
 *           type: integer
 *         example: 2
 *       - name: branch
 *         in: query
 *         required: false
 *         description: Filter by branch ID
 *         schema:
 *           type: integer
 *         example: 1
 *       - name: city
 *         in: query
 *         required: false
 *         description: Filter by city (partial match)
 *         schema:
 *           type: string
 *         example: "Mumbai"
 *       - name: fromDate
 *         in: query
 *         required: false
 *         description: Filter by date of joining — start date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *         example: "2020-01-01"
 *       - name: toDate
 *         in: query
 *         required: false
 *         description: Filter by date of joining — end date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-12-31"
 *       - name: minSalary
 *         in: query
 *         required: false
 *         description: Filter by minimum salary
 *         schema:
 *           type: number
 *           format: decimal
 *         example: 30000
 *       - name: maxSalary
 *         in: query
 *         required: false
 *         description: Filter by maximum salary
 *         schema:
 *           type: number
 *           format: decimal
 *         example: 80000
 *     responses:
 *       200:
 *         description: Search completed successfully
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
 *                     $ref: '#/components/schemas/Employee'
 *                 count:
 *                   type: integer
 *       400:
 *         description: Invalid search parameters
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/search', authenticate, authorize([]), searchEmployees);

/**
 * @swagger
 * /api/masters/employees/count:
 *   get:
 *     summary: Get employee count by filter criteria
 *     description: Returns the number of employees matching the given filters.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/BranchFilter'
 *       - $ref: '#/components/parameters/DepartmentFilter'
 *       - $ref: '#/components/parameters/DesignationFilter'
 *     responses:
 *       200:
 *         description: Employee count fetched successfully
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
 *                     count:
 *                       type: integer
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/count', authenticate, authorize([]), getEmployeeCount);

/**
 * @swagger
 * /api/masters/employees/salary-range:
 *   get:
 *     summary: Get employees by salary range
 *     description: Returns employees filtered by a salary range. At least one of minSalary or maxSalary must be provided.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MinSalaryQuery'
 *       - $ref: '#/components/parameters/MaxSalaryQuery'
 *     responses:
 *       200:
 *         description: Employees fetched by salary range
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
 *                     $ref: '#/components/schemas/Employee'
 *                 count:
 *                   type: integer
 *       400:
 *         description: Please provide at least one salary parameter
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/salary-range', authenticate, authorize([]), getEmployeesBySalaryRange);

/**
 * @swagger
 * /api/masters/employees/branch/{branchId}:
 *   get:
 *     summary: Get employees by branch
 *     description: Returns all employees belonging to the specified branch.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/BranchIdParam'
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
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
 *                     $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Valid branch ID is required
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/branch/:branchId', authenticate, authorize([]), getEmployeesByBranch);

/**
 * @swagger
 * /api/masters/employees/department/{departmentId}:
 *   get:
 *     summary: Get employees by department
 *     description: Returns all employees belonging to the specified department.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DepartmentIdParam'
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
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
 *                     $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Valid department ID is required
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/department/:departmentId', authenticate, authorize([]), getEmployeesByDepartment);

/**
 * @swagger
 * /api/masters/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     description: Returns a single employee record by their numeric ID.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/EmployeeIdParam'
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
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
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, authorize([]), getEmployeeById);

/**
 * @swagger
 * /api/masters/employees/code/{empCode}:
 *   get:
 *     summary: Get employee by employee code
 *     description: Returns a single employee record by their unique employee code.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/EmployeeCodeParam'
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
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
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Employee code is required
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
router.get('/code/:empCode', authenticate, authorize([]), getEmployeeByCode);

// ==================== WRITE ROUTES (Admin / Manager only) ====================

/**
 * @swagger
 * /api/masters/employees:
 *   post:
 *     summary: Create a new employee
 *     description: Creates a new employee record. Requires Admin or Manager role.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeCreate'
 *           example:
 *             Emp_Code: "EMP001"
 *             Emp_Name: "John Doe"
 *             Branch: 1
 *             Department_ID: 3
 *             Designation: 2
 *             Mobile_No: "9876543210"
 *             Salary: 50000
 *             DOJ: "2024-01-15"
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin or Manager role required
 *       409:
 *         description: Conflict - Employee with this code already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate,  authorize([]), createEmployee);

/**
 * @swagger
 * /api/masters/employees/bulk:
 *   post:
 *     summary: Bulk create employees
 *     description: Creates multiple employee records in a single request. Requires Admin or Manager role.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeBulkCreate'
 *           example:
 *             - Emp_Code: "EMP001"
 *               Emp_Name: "John Doe"
 *               Branch: 1
 *               Salary: 50000
 *             - Emp_Code: "EMP002"
 *               Emp_Name: "Jane Smith"
 *               Branch: 1
 *               Salary: 55000
 *     responses:
 *       201:
 *         description: Bulk employee creation completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkCreateResponse'
 *       400:
 *         description: Request body must be an array of employee data
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin or Manager role required
 *       500:
 *         description: Internal server error
 */
router.post('/bulk', authenticate, authorize([]), bulkCreateEmployees);

/**
 * @swagger
 * /api/masters/employees/{id}:
 *   put:
 *     summary: Full update of an employee
 *     description: Replaces all updatable fields of an employee by ID. Requires Admin or Manager role.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/EmployeeIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeUpdate'
 *           example:
 *             Emp_Name: "John Doe Updated"
 *             Salary: 60000
 *             Department_ID: 4
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin or Manager role required
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Conflict - Another employee with this code already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate,  authorize([]), updateEmployee);

/**
 * @swagger
 * /api/masters/employees/{id}:
 *   patch:
 *     summary: Partial update of an employee
 *     description: Updates only the supplied fields of an employee by ID. Requires Admin or Manager role.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/EmployeeIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeUpdate'
 *           example:
 *             Mobile_No: "9988776655"
 *             City: "Pune"
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin or Manager role required
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Conflict - Another employee with this code already exists
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', authenticate,  authorize([]), partialUpdateEmployee);

/**
 * @swagger
 * /api/masters/employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     description: Permanently deletes an employee by ID. Requires Admin role only.
 *     tags: [Employee Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/EmployeeIdParam'
 *     responses:
 *       200:
 *         description: Employee deleted successfully
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
 *                   example: "Employee deleted successfully"
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate,  authorize([]), deleteEmployee);

export default router;