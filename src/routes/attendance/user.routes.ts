import express from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { 
    createUser, 
    deleteUser, 
    getAllUsers, 
    getUserById, 
    getUserDropdown, 
    updateUser,
    hardDeleteUser,
    restoreUser,
    changePassword
} from '../../controllers/Attendace/user.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints (UserTypeId = 6 only)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         UserId:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         Global_User_ID:
 *           type: string
 *           maxLength: 50
 *           nullable: true
 *           example: "USER-001"
 *         UserTypeId:
 *           type: integer
 *           readOnly: true
 *           example: 6
 *           description: Always 6 for this module
 *         Name:
 *           type: string
 *           maxLength: 100
 *           nullable: true
 *           example: "John Doe"
 *         UserName:
 *           type: string
 *           maxLength: 50
 *           example: "johndoe"
 *         Company_Id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         BranchId:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         UDel_Flag:
 *           type: boolean
 *           default: false
 *           example: false
 *         Autheticate_Id:
 *           type: string
 *           maxLength: 100
 *           nullable: true
 *           example: "AUTH-12345"
 *     
 *     UserCreate:
 *       type: object
 *       required:
 *         - UserName
 *         - Password
 *       properties:
 *         Global_User_ID:
 *           type: string
 *           maxLength: 50
 *         Name:
 *           type: string
 *           maxLength: 100
 *         UserName:
 *           type: string
 *           maxLength: 50
 *         Password:
 *           type: string
 *           minLength: 6
 *           maxLength: 100
 *         Company_Id:
 *           type: integer
 *         BranchId:
 *           type: integer
 *         Autheticate_Id:
 *           type: string
 *           maxLength: 100
 *       note: UserTypeId is automatically set to 6
 *     
 *     UserUpdate:
 *       type: object
 *       properties:
 *         Global_User_ID:
 *           type: string
 *           maxLength: 50
 *         Name:
 *           type: string
 *           maxLength: 100
 *         UserName:
 *           type: string
 *           maxLength: 50
 *         Password:
 *           type: string
 *           minLength: 6
 *           maxLength: 100
 *         Company_Id:
 *           type: integer
 *         BranchId:
 *           type: integer
 *         Autheticate_Id:
 *           type: string
 *           maxLength: 100
 *       note: UserTypeId cannot be changed and remains 6
 *     
 *     ChangePassword:
 *       type: object
 *       required:
 *         - oldPassword
 *         - newPassword
 *       properties:
 *         oldPassword:
 *           type: string
 *           description: Current password
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           description: New password
 *     
 *     Pagination:
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
 *     Error:
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
 *                 example: "UserName"
 *               message:
 *                 type: string
 *                 example: "Username is required"
 * 
 *   parameters:
 *     userId:
 *       name: id
 *       in: path
 *       description: User ID (only users with UserTypeId=6)
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
 *     
 *     paginationPage:
 *       name: page
 *       in: query
 *       description: Page number
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *     
 *     paginationLimit:
 *       name: limit
 *       in: query
 *       description: Items per page (max 100)
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 20
 *     
 *     searchQuery:
 *       name: search
 *       in: query
 *       description: Search by username, name, or global user ID
 *       required: false
 *       schema:
 *         type: string
 *     
 *     companyFilter:
 *       name: companyId
 *       in: query
 *       description: Filter by company ID
 *       required: false
 *       schema:
 *         type: integer
 *     
 *     branchFilter:
 *       name: branchId
 *       in: query
 *       description: Filter by branch ID
 *       required: false
 *       schema:
 *         type: integer
 *     
 *     deletedFilter:
 *       name: udelFlag
 *       in: query
 *       description: Filter by deleted status
 *       required: false
 *       schema:
 *         type: boolean
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/attendance/users:
 *   get:
 *     summary: Get all users with UserTypeId = 6
 *     description: Retrieve a paginated list of users where UserTypeId equals 6
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/paginationPage'
 *       - $ref: '#/components/parameters/paginationLimit'
 *       - $ref: '#/components/parameters/searchQuery'
 *       - $ref: '#/components/parameters/companyFilter'
 *       - $ref: '#/components/parameters/branchFilter'
 *       - $ref: '#/components/parameters/deletedFilter'
 *       - name: sortBy
 *         in: query
 *         description: Sort field
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["UserId", "UserName", "Name", "Company_Id", "BranchId"]
 *           default: "UserId"
 *       - name: sortOrder
 *         in: query
 *         description: Sort order
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["ASC", "DESC"]
 *           default: "ASC"
 *     responses:
 *       200:
 *         description: Successfully retrieved users with UserTypeId=6
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
 *                   example: "Users retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, authorize([1, 2]), getAllUsers);

/**
 * @swagger
 * /api/attendance/users/dropdown:
 *   get:
 *     summary: Get active users for dropdown (UserTypeId = 6 only)
 *     description: Retrieve active users in dropdown format where UserTypeId equals 6
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/companyFilter'
 *       - $ref: '#/components/parameters/branchFilter'
 *     responses:
 *       200:
 *         description: Successfully retrieved users for dropdown
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
 *                   example: "Users for dropdown retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: integer
 *                         example: 1
 *                       label:
 *                         type: string
 *                         example: "johndoe"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/dropdown', authenticate, getUserDropdown);

/**
 * @swagger
 * /api/attendance/users/{id}:
 *   get:
 *     summary: Get User by ID (only UserTypeId=6)
 *     description: Retrieve a specific user by their ID (only if UserTypeId=6)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: Successfully retrieved user
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
 *                   example: "User retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, authorize([1, 2]), getUserById);

/**
 * @swagger
 * /api/attendance/users:
 *   post:
 *     summary: Create a new User (UserTypeId automatically set to 6)
 *     description: Create a new user record with UserTypeId forced to 6
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: "User created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       409:
 *         description: Conflict - Username already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize([1, 2]), createUser);

/**
 * @swagger
 * /api/attendance/users/{id}:
 *   put:
 *     summary: Update a User (UserTypeId remains 6)
 *     description: Update an existing user by ID (UserTypeId cannot be changed)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: "User updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 *       409:
 *         description: Conflict - Username already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, authorize([1, 2]), updateUser);

/**
 * @swagger
 * /api/attendance/users/{id}/change-password:
 *   put:
 *     summary: Change user password
 *     description: Change password for a specific user (UserTypeId=6 only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: "Password changed successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Old password incorrect or unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/change-password', authenticate, changePassword);

/**
 * @swagger
 * /api/attendance/users/{id}:
 *   delete:
 *     summary: Soft delete a User (UserTypeId=6 only)
 *     description: Soft delete a user by setting UDel_Flag to true
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: "User deleted successfully"
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, authorize([1]), deleteUser);

/**
 * @swagger
 * /api/attendance/users/{id}/hard:
 *   delete:
 *     summary: Permanently delete a User (UserTypeId=6 only)
 *     description: Permanently delete a user from the database
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: User permanently deleted successfully
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
 *                   example: "User permanently deleted successfully"
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/hard', authenticate, authorize([1]), hardDeleteUser);

/**
 * @swagger
 * /api/attendance/users/{id}/restore:
 *   put:
 *     summary: Restore a soft-deleted User (UserTypeId=6 only)
 *     description: Restore a user by setting UDel_Flag to false
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: User restored successfully
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
 *                   example: "User restored successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/restore', authenticate, authorize([1, 2]), restoreUser);

export default router;