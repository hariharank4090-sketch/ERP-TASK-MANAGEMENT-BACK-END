import express from 'express';
import { CostCenter } from '../../controllers/reports/costCenter.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cost Center
 *   description: Cost Center endpoints
 */

/**
 * @swagger
 * /api/reports/costcenter-list:
 *   get:
 *     summary: Get cost center list
 *     tags: [Cost Center]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
router.get('/costcenter-list', CostCenter.getCostCenter);

/**
 * @swagger
 * /api/reports/costcenter-create:
 *   post:
 *     summary: Create cost center
 *     tags: [Cost Center]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
router.post('/costcenter-create', CostCenter.createCostCenter);

/**
 * @swagger
 * /api/reports/costcenter-update:
 *   put:
 *     summary: Update cost center
 *     tags: [Cost Center]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
router.put('/costcenter-update', CostCenter.updateCostCenter);

/**
 * @swagger
 * /api/reports/costcenter-category:
 *   get:
 *     summary: Get cost center category
 *     tags: [Cost Center]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create cost center category
 *     tags: [Cost Center]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete cost center category
 *     tags: [Cost Center]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *         description: The ID of the cost center category
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update cost center category
 *     tags: [Cost Center]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
router.get('/costcenter-category', CostCenter.getCostCenterCategory);
router.post('/costcenter-category', CostCenter.createCostCategory);
router.delete('/costcenter-category', CostCenter.deleteCostCategory);
router.put('/costcenter-category', CostCenter.updateCostCategory);

/**
 * @swagger
 * /api/reports/costcenter-category-dropdown:
 *   get:
 *     summary: Get cost center category dropdown
 *     tags: [Cost Center]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
router.get('/costcenter-category-dropdown', CostCenter.costCategoryDropDown);

/**
 * @swagger
 * /api/reports/costcenter-involved-reports:
 *   get:
 *     summary: Get cost center involved reports
 *     tags: [Cost Center]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
router.get('/costcenter-involved-reports', CostCenter.costCenterInvolvedReports);

/**
 * @swagger
 * /api/reports/costcenter-employee-reports:
 *   get:
 *     summary: Get cost center employee reports
 *     tags: [Cost Center]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
router.get('/costcenter-employee-reports', CostCenter.costCenterEmployeeReports);

export default router;
