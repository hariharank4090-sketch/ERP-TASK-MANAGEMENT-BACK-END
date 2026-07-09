"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const branchMaster_controller_1 = require("../../controllers/masters/taskManagement/branchMaster.controller");
const router = (0, express_1.Router)();
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
router.get('/', branchMaster_controller_1.getAllBranches);
/**
 * @swagger
 * /api/masters/branch/{id}:
 *   get:
 *     summary: Get a branch by ID
 *     tags: [Branch Master]
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
router.get('/:id', branchMaster_controller_1.getBranchById);
/**
 * @swagger
 * /api/masters/branch:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branch Master]
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
router.post('/', branchMaster_controller_1.createBranch);
/**
 * @swagger
 * /api/masters/branch/{id}:
 *   put:
 *     summary: Update an existing branch
 *     tags: [Branch Master]
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
router.put('/:id', branchMaster_controller_1.updateBranch);
/**
 * @swagger
 * /api/masters/branch/{id}:
 *   delete:
 *     summary: Delete a branch by ID
 *     tags: [Branch Master]
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
router.delete('/:id', branchMaster_controller_1.deleteBranch);
exports.default = router;
