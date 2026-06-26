import express from 'express';
import {
    getAllParametDataTypes,
    getParametDataTypeById,
    createParametDataType,
    updateParametDataType,
    deleteParametDataType,
    getAllActiveParametDataTypes,
    getParametDataTypeStatistics,
    searchParametDataTypes
} from '../../controllers/masters/taskManagement/taskParamType.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Parameter Data Type Master
 *   description: Parameter Data Type Master management endpoints - Create, Read, Update, Delete parameter data types
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ParametDataType:
 *       type: object
 *       properties:
 *         Para_Data_Type_Id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         Para_Data_Type:
 *           type: string
 *           example: "String"
 *         Para_Display_Name:
 *           type: string
 *           nullable: true
 *           example: "Text/String Value"
 *     
 *     ParametDataTypeCreate:
 *       type: object
 *       required:
 *         - Para_Data_Type
 *       properties:
 *         Para_Data_Type:
 *           type: string
 *           example: "String"
 *         Para_Display_Name:
 *           type: string
 *           nullable: true
 *           example: "Text/String Value"
 *     
 *     ParametDataTypeUpdate:
 *       type: object
 *       properties:
 *         Para_Data_Type:
 *           type: string
 *           example: "String Updated"
 *         Para_Display_Name:
 *           type: string
 *           nullable: true
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
 *                 example: "Para_Data_Type"
 *               message:
 *                 type: string
 *                 example: "Parameter data type is required"
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Parameter data type created successfully"
 *         data:
 *           $ref: '#/components/schemas/ParametDataType'
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
 *             totalParametDataTypes:
 *               type: integer
 *             totalRecords:
 *               type: integer
 *   
 *   parameters:
 *     ParametDataTypeIdParam:
 *       name: id
 *       in: path
 *       required: true
 *       description: Parameter Data Type ID
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
 *     
 *     SearchQuery:
 *       name: search
 *       in: query
 *       required: false
 *       description: Search by data type or display name
 *       schema:
 *         type: string
 *       example: "String"
 *     
 *     ParaDataTypeFilter:
 *       name: Para_Data_Type
 *       in: query
 *       required: false
 *       description: Filter by data type
 *       schema:
 *         type: string
 *       example: "String"
 *     
 *     SortByParam:
 *       name: sortBy
 *       in: query
 *       required: false
 *       description: Sort field
 *       schema:
 *         type: string
 *         enum: [Para_Data_Type_Id, Para_Data_Type, Para_Display_Name]
 *         default: Para_Data_Type_Id
 *     
 *     SortOrderParam:
 *       name: sortOrder
 *       in: query
 *       required: false
 *       description: Sort order
 *       schema:
 *         type: string
 *         enum: [ASC, DESC]
 *         default: ASC
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// ==================== PUBLIC ROUTES (Authentication Required but any role) ====================

/**
 * @swagger
 * /api/masters/parametDataTypes/statistics:
 *   get:
 *     summary: Get parameter data type statistics
 *     description: Retrieve statistical data about parameter data types
 *     tags: [Parameter Data Type Master]
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
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/statistics', authenticate, authorize([]), getParametDataTypeStatistics);

/**
 * @swagger
 * /api/masters/parametDataTypes/search:
 *   get:
 *     summary: Search parameter data types
 *     description: Search parameter data types by name or display name
 *     tags: [Parameter Data Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *     responses:
 *       200:
 *         description: Parameter data types retrieved successfully
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
 *                     $ref: '#/components/schemas/ParametDataType'
 *                 totalRecords:
 *                   type: integer
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/search', authenticate, authorize([]), searchParametDataTypes);

/**
 * @swagger
 * /api/masters/parametDataTypes/active:
 *   get:
 *     summary: Get all parameter data types
 *     description: Retrieve all parameter data types
 *     tags: [Parameter Data Type Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parameter data types retrieved successfully
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
 *                     $ref: '#/components/schemas/ParametDataType'
 *                 totalRecords:
 *                   type: integer
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/active', authenticate, authorize([]), getAllActiveParametDataTypes);

// ==================== CRUD OPERATIONS ====================

/**
 * @swagger
 * /api/masters/parametDataTypes:
 *   get:
 *     summary: Get all parameter data types with filtering
 *     description: Retrieve all parameter data types with optional filters (no pagination)
 *     tags: [Parameter Data Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ParaDataTypeFilter'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Parameter data types retrieved successfully
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
 *                   example: "Parameter data types retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ParametDataType'
 *                 totalRecords:
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
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, authorize([]), getAllParametDataTypes);

/**
 * @swagger
 * /api/masters/parametDataTypes/{id}:
 *   get:
 *     summary: Get parameter data type by ID
 *     description: Retrieve a specific parameter data type by its ID
 *     tags: [Parameter Data Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ParametDataTypeIdParam'
 *     responses:
 *       200:
 *         description: Parameter data type retrieved successfully
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
 *                   example: "Parameter data type retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ParametDataType'
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Parameter data type not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, authorize([]), getParametDataTypeById);

/**
 * @swagger
 * /api/masters/parametDataTypes:
 *   post:
 *     summary: Create a new parameter data type
 *     description: Create a new parameter data type record (Admin and Manager only)
 *     tags: [Parameter Data Type Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParametDataTypeCreate'
 *     responses:
 *       201:
 *         description: Parameter data type created successfully
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
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions (Admin or Manager required)
 *       409:
 *         description: Conflict - Parameter data type name already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize([]), createParametDataType);

/**
 * @swagger
 * /api/masters/parametDataTypes/{id}:
 *   put:
 *     summary: Update a parameter data type
 *     description: Update an existing parameter data type by ID (Admin and Manager only)
 *     tags: [Parameter Data Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ParametDataTypeIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParametDataTypeUpdate'
 *     responses:
 *       200:
 *         description: Parameter data type updated successfully
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
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Parameter data type not found
 *       409:
 *         description: Conflict - Parameter data type name already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, authorize([]), updateParametDataType);

/**
 * @swagger
 * /api/masters/parametDataTypes/{id}:
 *   delete:
 *     summary: Delete a parameter data type
 *     description: Delete a parameter data type by ID (Admin only)
 *     tags: [Parameter Data Type Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ParametDataTypeIdParam'
 *     responses:
 *       200:
 *         description: Parameter data type deleted successfully
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
 *                   example: "Parameter data type deleted successfully"
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Parameter data type not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, authorize([]), deleteParametDataType);

export default router;