"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/masters/userType.routes.ts
const express_1 = require("express");
const userType_controller_1 = require("../../controllers/masters/taskManagement/userType.controller");
const auth_1 = require("../../middleware/auth");
const database_middleware_1 = require("../../middleware/database.middleware");
const router = (0, express_1.Router)();
/**
 * HOW ROLES WORK:
 * ─────────────────────────────────────────────────────────────────
 * User_Portal_Test.tbl_Users.UserTypeId  →  CompanyDB.tbl_User_Type.Id
 *
 * authorize([])      → any logged-in user (all roles allowed)
 * authorize([1])     → only UserTypeId = 1  (e.g. Super Admin)
 * authorize([1, 2])  → UserTypeId 1 or 2   (e.g. Admin or Manager)
 *
 * ⚠️ Check your tbl_User_Type to confirm which Id maps to which role name.
 * ─────────────────────────────────────────────────────────────────
 *
 * Full middleware chain per route:
 *   1. authenticate       — verify token, attach req.user (with UserTypeId)
 *   2. authorize([...])   — check req.user.UserTypeId against allowed list
 *   3. setCompanyDatabase — attach req.companyDB
 *   4. requireCompanyDB   — block if no company DB resolved
 */
// ── Read endpoints — open to ALL authenticated users ──────────────────────────
// GET /api/masters/user-type/my-role
// ⚠️ /my-role MUST be before /:id — otherwise Express treats "my-role" as an id param
router.get('/my-role', auth_1.authenticate, (0, auth_1.authorize)([]), // any authenticated user
database_middleware_1.setCompanyDatabase, database_middleware_1.requireCompanyDB, userType_controller_1.getMyRole);
// GET /api/masters/user-type
router.get('/', auth_1.authenticate, (0, auth_1.authorize)([]), // any authenticated user
database_middleware_1.setCompanyDatabase, database_middleware_1.requireCompanyDB, userType_controller_1.getAllUserTypes);
// GET /api/masters/user-type/:id
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), // any authenticated user
database_middleware_1.setCompanyDatabase, database_middleware_1.requireCompanyDB, userType_controller_1.getUserTypeById);
// ── Write endpoints — admin only ──────────────────────────────────────────────
// ⚠️ Change [1] to match the actual UserTypeId of your admin role in tbl_User_Type
// POST /api/masters/user-type
router.post('/', auth_1.authenticate, (0, auth_1.authorize)([]), // only Admin (UserTypeId = 1)
database_middleware_1.setCompanyDatabase, database_middleware_1.requireCompanyDB, userType_controller_1.createUserType);
// PUT /api/masters/user-type/:id
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), // only Admin (UserTypeId = 1)
database_middleware_1.setCompanyDatabase, database_middleware_1.requireCompanyDB, userType_controller_1.updateUserType);
// DELETE /api/masters/user-type/:id  (soft delete)
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)([]), // only Admin (UserTypeId = 1)
database_middleware_1.setCompanyDatabase, database_middleware_1.requireCompanyDB, userType_controller_1.deleteUserType);
exports.default = router;
