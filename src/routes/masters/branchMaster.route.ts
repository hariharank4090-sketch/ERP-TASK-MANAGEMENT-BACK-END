import express from 'express';
import {
    getAllBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch
} from '../../controllers/masters/taskManagement/branchMaster.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Branch Master
 *   description: Branch Master management endpoints
 */

/**
 * @swagger
 * /api/masters/branch:
 *   get:
 *     summary: Get all branches with pagination and filtering
 *     tags: [Branch Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           default: BranchId
 *       - name: sortOrder
 *         in: query
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *     responses:
 *       200:
 *         description: Successfully retrieved branches
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, authorize([]), getAllBranches);

/**
 * @swagger
 * /api/masters/branch/{id}:
 *   get:
 *     summary: Get a branch by ID
 *     tags: [Branch Master]
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
 *         description: Successfully retrieved branch
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, authorize([]), getBranchById);

/**
 * @swagger
 * /api/masters/branch:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branch Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Company_id:
 *                 type: integer
 *               BranchCode:
 *                 type: string
 *               BranchName:
 *                 type: string
 *               E_Mail:
 *                 type: string
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize([]), createBranch);

/**
 * @swagger
 * /api/masters/branch/{id}:
 *   put:
 *     summary: Update an existing branch
 *     tags: [Branch Master]
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
 *               BranchName:
 *                 type: string
 *               BranchAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, authorize([]), updateBranch);

/**
 * @swagger
 * /api/masters/branch/{id}:
 *   delete:
 *     summary: Delete a branch by ID
 *     tags: [Branch Master]
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
 *         description: Branch deleted successfully
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, authorize([]), deleteBranch);

export default router;
