import express from 'express';
import { 
    getAllUsers,
    getUserById,
    getUserDropdown,
    getDeletedUsers,
    getUsersByCompany,
    getUsersByBranch,
    getUsersByType,
    testConnection
} from '../../controllers/masters/taskManagement/dbuser.controller';
import { setCompanyDatabase } from '../../middleware/database.middleware';

const router = express.Router();

// Apply middleware to all routes in this router
router.use(setCompanyDatabase);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints (Read-only with dynamic database)
 */

/**
 * @swagger
 * /api/masters/users/test:
 *   get:
 *     summary: Test database connection
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Connection successful
 */
router.get('/test', testConnection);

/**
 * @swagger
 * /api/masters/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Users]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: companyId
 *         in: query
 *         schema:
 *           type: integer
 *       - name: branchId
 *         in: query
 *         schema:
 *           type: integer
 *       - name: userTypeId
 *         in: query
 *         schema:
 *           type: integer
 *       - name: activeOnly
 *         in: query
 *         schema:
 *           type: boolean
 *           default: true
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [UserId, Name, UserName, UserTypeId, Company_Id, BranchId]
 *       - name: sortOrder
 *         in: query
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /api/masters/users/deleted:
 *   get:
 *     summary: Get soft-deleted users
 *     tags: [Users]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved deleted users
 */
router.get('/deleted', getDeletedUsers);

/**
 * @swagger
 * /api/masters/users/dropdown:
 *   get:
 *     summary: Get users for dropdown
 *     tags: [Users]
 *     parameters:
 *       - name: companyId
 *         in: query
 *         schema:
 *           type: integer
 *       - name: branchId
 *         in: query
 *         schema:
 *           type: integer
 *       - name: activeOnly
 *         in: query
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Successfully retrieved users for dropdown
 */
router.get('/dropdown', getUserDropdown);

/**
 * @swagger
 * /api/masters/users/company/{companyId}:
 *   get:
 *     summary: Get users by company ID
 *     tags: [Users]
 *     parameters:
 *       - name: companyId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *       400:
 *         description: Invalid company ID
 */
router.get('/company/:companyId', getUsersByCompany);

/**
 * @swagger
 * /api/masters/users/branch/{branchId}:
 *   get:
 *     summary: Get users by branch ID
 *     tags: [Users]
 *     parameters:
 *       - name: branchId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *       400:
 *         description: Invalid branch ID
 */
router.get('/branch/:branchId', getUsersByBranch);

/**
 * @swagger
 * /api/masters/users/type/{userTypeId}:
 *   get:
 *     summary: Get users by user type ID
 *     tags: [Users]
 *     parameters:
 *       - name: userTypeId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *       400:
 *         description: Invalid user type ID
 */
router.get('/type/:userTypeId', getUsersByType);

/**
 * @swagger
 * /api/masters/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *       404:
 *         description: User not found
 */
router.get('/:id', getUserById);

export default router;