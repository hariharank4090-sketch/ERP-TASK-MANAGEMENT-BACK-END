// src/routes/configuration/menuManagement.routes.ts

import express from 'express';
import appMenu from '../../controllers/configuration/menuManagement/index';
import { authenticate, authorize } from '../../middleware/auth';

const AuthorizationRouter = express.Router();
const menuController = appMenu;

// Apply authentication to all routes
AuthorizationRouter.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Menu Management
 *   description: Application menu and rights management APIs
 */

/**
 * @swagger
 * /api/configuration/appMenu/appMenu:
 *   get:
 *     summary: Get application menu structure
 *     description: Fetch complete menu structure with sub-menus and child menus based on authenticated user's rights
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menu data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Data Found
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       menu_type:
 *                         type: integer
 *                         enum: [0, 1, 2, 3]
 *                       parent_id:
 *                         type: integer
 *                         nullable: true
 *                       url:
 *                         type: string
 *                       display_order:
 *                         type: integer
 *                       is_active:
 *                         type: integer
 *                       Read_Rights:
 *                         type: integer
 *                       Add_Rights:
 *                         type: integer
 *                       Edit_Rights:
 *                         type: integer
 *                       Delete_Rights:
 *                         type: integer
 *                       Print_Rights:
 *                         type: integer
 *                       SubMenu:
 *                         type: array
 *                       SubRoutes:
 *                         type: array
 *                 others:
 *                   type: object
 *                   properties:
 *                     subRoutings:
 *                       type: array
 *                     nestedRoutes:
 *                       type: array
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
AuthorizationRouter.get('/appMenu', authenticate, menuController.newAppMenu);

/**
 * @swagger
 * /api/configuration/appMenu/newAppMenu:
 *   get:
 *     summary: Get application menu structure (alternative endpoint)
 *     description: Alternative endpoint to fetch complete menu structure based on authenticated user's rights
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menu data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Data Found
 *                 data:
 *                   type: array
 *                 others:
 *                   type: object
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
AuthorizationRouter.get('/newAppMenu', authenticate, menuController.newAppMenu);

/**
 * @swagger
 * /api/configuration/appMenu/userRights:
 *   get:
 *     summary: Get authenticated user's menu rights
 *     description: Fetch all menu rights assigned to the currently authenticated user
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User rights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Data Found
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       menu_type:
 *                         type: integer
 *                       parent_id:
 *                         type: integer
 *                         nullable: true
 *                       url:
 *                         type: string
 *                       display_order:
 *                         type: integer
 *                       is_active:
 *                         type: integer
 *                       Read_Rights:
 *                         type: integer
 *                         description: Read permission (0 or 1)
 *                       Add_Rights:
 *                         type: integer
 *                         description: Add permission (0 or 1)
 *                       Edit_Rights:
 *                         type: integer
 *                         description: Edit permission (0 or 1)
 *                       Delete_Rights:
 *                         type: integer
 *                         description: Delete permission (0 or 1)
 *                       Print_Rights:
 *                         type: integer
 *                         description: Print permission (0 or 1)
 *                       SubMenu:
 *                         type: array
 *                         description: Sub menus under this menu
 *                       SubRoutes:
 *                         type: array
 *                         description: Routes under this menu
 *                 others:
 *                   type: object
 *                   properties:
 *                     subRoutings:
 *                       type: array
 *                     nestedRoutes:
 *                       type: array
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
AuthorizationRouter.get('/userRights', authenticate, menuController.userRights);

/**
 * @swagger
 * /api/configuration/appMenu/userRights:
 *   post:
 *     summary: Modify user menu rights
 *     description: Update or assign menu rights for a specific user
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - MenuId
 *               - User
 *             properties:
 *               MenuId:
 *                 type: integer
 *                 description: Menu ID to assign rights for
 *                 example: 1
 *               User:
 *                 type: integer
 *                 description: User ID
 *                 example: 100
 *               ReadRights:
 *                 type: integer
 *                 description: Read permission (0 or 1)
 *                 enum: [0, 1]
 *                 default: 0
 *                 example: 1
 *               AddRights:
 *                 type: integer
 *                 description: Add permission (0 or 1)
 *                 enum: [0, 1]
 *                 default: 0
 *                 example: 0
 *               EditRights:
 *                 type: integer
 *                 description: Edit permission (0 or 1)
 *                 enum: [0, 1]
 *                 default: 0
 *                 example: 0
 *               DeleteRights:
 *                 type: integer
 *                 description: Delete permission (0 or 1)
 *                 enum: [0, 1]
 *                 default: 0
 *                 example: 0
 *               PrintRights:
 *                 type: integer
 *                 description: Print permission (0 or 1)
 *                 enum: [0, 1]
 *                 default: 0
 *                 example: 0
 *     responses:
 *       200:
 *         description: User rights modified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Changes saved successfully.
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
AuthorizationRouter.post('/userRights', authenticate, menuController.newModifyUserRights);

/**
 * @swagger
 * /api/configuration/appMenu/userTypeRights:
 *   get:
 *     summary: Get user type-based menu rights
 *     description: Fetch all menu rights assigned to a specific user type
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: UserType
 *         required: true
 *         schema:
 *           type: integer
 *         description: User type ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User type rights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Data Found
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       Read_Rights:
 *                         type: integer
 *                       Add_Rights:
 *                         type: integer
 *                       Edit_Rights:
 *                         type: integer
 *                       Delete_Rights:
 *                         type: integer
 *                       Print_Rights:
 *                         type: integer
 *                 others:
 *                   type: object
 *                   properties:
 *                     subRoutings:
 *                       type: array
 *                     nestedRoutes:
 *                       type: array
 *       400:
 *         description: UserType parameter is required
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
AuthorizationRouter.get('/userTypeRights', authenticate, menuController.getNewUserTypeBasedRights);

/**
 * @swagger
 * /api/configuration/appMenu/userTypeRights:
 *   post:
 *     summary: Modify user type menu rights
 *     description: Update or assign menu rights for a specific user type
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - MenuId
 *               - UserType
 *             properties:
 *               MenuId:
 *                 type: integer
 *                 description: Menu ID to assign rights for
 *                 example: 1
 *               UserType:
 *                 type: integer
 *                 description: User type ID
 *                 example: 1
 *               ReadRights:
 *                 type: integer
 *                 description: Read permission (0 or 1)
 *                 enum: [0, 1]
 *                 default: 0
 *                 example: 1
 *               AddRights:
 *                 type: integer
 *                 description: Add permission (0 or 1)
 *                 enum: [0, 1]
 *                 default: 0
 *                 example: 0
 *               EditRights:
 *                 type: integer
 *                 description: Edit permission (0 or 1)
 *                 enum: [0, 1]
 *                 default: 0
 *                 example: 0
 *               DeleteRights:
 *                 type: integer
 *                 description: Delete permission (0 or 1)
 *                 enum: [0, 1]
 *                 default: 0
 *                 example: 0
 *               PrintRights:
 *                 type: integer
 *                 description: Print permission (0 or 1)
 *                 enum: [0, 1]
 *                 default: 0
 *                 example: 0
 *     responses:
 *       200:
 *         description: User type rights modified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Changes saved successfully.
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
AuthorizationRouter.post('/userTypeRights', authenticate, menuController.newModifyUserTypeRights);

/**
 * @swagger
 * /api/configuration/appMenu/menuMaster:
 *   get:
 *     summary: Get complete menu master list
 *     description: Fetch all menu items with parent information in hierarchical structure
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menu master list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Data Found
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       menu_type:
 *                         type: integer
 *                         enum: [0, 1, 2, 3]
 *                       parent_id:
 *                         type: integer
 *                         nullable: true
 *                       url:
 *                         type: string
 *                       tUrl:
 *                         type: string
 *                       rUrl:
 *                         type: string
 *                       actionType:
 *                         type: string
 *                         enum: [internal, external]
 *                       display_order:
 *                         type: integer
 *                       is_active:
 *                         type: integer
 *                         enum: [0, 1]
 *                       ParantData:
 *                         type: object
 *                         description: Parent menu information
 *                       SubMenu:
 *                         type: array
 *                       SubRoutes:
 *                         type: array
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
AuthorizationRouter.get('/menuMaster', authenticate, menuController.listMenu);

/**
 * @swagger
 * /api/configuration/appMenu/menuMaster:
 *   post:
 *     summary: Create new menu item
 *     description: Add a new menu item to the application menu master
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - menu_type
 *               - display_order
 *             properties:
 *               name:
 *                 type: string
 *                 description: Menu name
 *                 example: Dashboard
 *               menu_type:
 *                 type: integer
 *                 description: |
 *                   Menu type:
 *                   - 0: Route/Sub-route
 *                   - 1: Main Menu
 *                   - 2: Sub Menu
 *                   - 3: Child Menu
 *                 enum: [0, 1, 2, 3]
 *                 example: 1
 *               parent_id:
 *                 type: integer
 *                 description: Parent menu ID (required for sub-menus and child menus)
 *                 nullable: true
 *                 example: null
 *               url:
 *                 type: string
 *                 description: Menu URL/path
 *                 nullable: true
 *                 example: /dashboard
 *               tUrl:
 *                 type: string
 *                 description: Target URL for external links
 *                 nullable: true
 *                 example: null
 *               rUrl:
 *                 type: string
 *                 description: Redirect URL
 *                 nullable: true
 *                 example: null
 *               display_order:
 *                 type: integer
 *                 description: Display order for sorting
 *                 example: 1
 *               is_active:
 *                 type: integer
 *                 description: Active status (0 = Inactive, 1 = Active)
 *                 enum: [0, 1]
 *                 default: 1
 *                 example: 1
 *               actionType:
 *                 type: string
 *                 description: Action type for menu navigation
 *                 enum: [internal, external]
 *                 default: internal
 *                 example: internal
 *     responses:
 *       200:
 *         description: Menu created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: New Menu Added
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
AuthorizationRouter.post('/menuMaster', authenticate, menuController.createNewMenu);

/**
 * @swagger
 * /api/configuration/appMenu/menuMaster:
 *   put:
 *     summary: Update existing menu item
 *     description: Update an existing menu item in the application menu master
 *     tags: [Menu Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - menu_type
 *               - display_order
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Menu ID to update
 *                 example: 1
 *               name:
 *                 type: string
 *                 description: Menu name
 *                 example: Updated Dashboard
 *               menu_type:
 *                 type: integer
 *                 description: |
 *                   Menu type:
 *                   - 0: Route/Sub-route
 *                   - 1: Main Menu
 *                   - 2: Sub Menu
 *                   - 3: Child Menu
 *                 enum: [0, 1, 2, 3]
 *                 example: 1
 *               parent_id:
 *                 type: integer
 *                 description: Parent menu ID
 *                 nullable: true
 *                 example: null
 *               url:
 *                 type: string
 *                 description: Menu URL/path
 *                 nullable: true
 *                 example: /updated-dashboard
 *               tUrl:
 *                 type: string
 *                 description: Target URL for external links
 *                 nullable: true
 *                 example: null
 *               rUrl:
 *                 type: string
 *                 description: Redirect URL
 *                 nullable: true
 *                 example: null
 *               display_order:
 *                 type: integer
 *                 description: Display order for sorting
 *                 example: 2
 *               is_active:
 *                 type: integer
 *                 description: Active status (0 = Inactive, 1 = Active)
 *                 enum: [0, 1]
 *                 default: 1
 *                 example: 1
 *               actionType:
 *                 type: string
 *                 description: Action type for menu navigation
 *                 enum: [internal, external]
 *                 default: internal
 *                 example: internal
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Changes Saved
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Internal server error
 */
AuthorizationRouter.put('/menuMaster', authenticate, menuController.updateMenu);

export default AuthorizationRouter;