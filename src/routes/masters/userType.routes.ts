// src/routes/masters/userType.routes.ts
import { Router } from 'express';
import {
    getAllUserTypes,
    getUserTypeById,
    createUserType,
    updateUserType,
    deleteUserType,
    getMyRole,
} from '../../controllers/masters/taskManagement/userType.controller';
import { authenticate, authorize }              from '../../middleware/auth';
import { setCompanyDatabase, requireCompanyDB } from '../../middleware/database.middleware';

const router = Router();

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
router.get('/my-role',
    authenticate,
    authorize([]),          // any authenticated user
    setCompanyDatabase,
    requireCompanyDB,
    getMyRole,
);

// GET /api/masters/user-type
router.get('/',
    authenticate,
    authorize([]),          // any authenticated user
    setCompanyDatabase,
    requireCompanyDB,
    getAllUserTypes,
);

// GET /api/masters/user-type/:id
router.get('/:id',
    authenticate,
    authorize([]),          // any authenticated user
    setCompanyDatabase,
    requireCompanyDB,
    getUserTypeById,
);

// ── Write endpoints — admin only ──────────────────────────────────────────────
// ⚠️ Change [1] to match the actual UserTypeId of your admin role in tbl_User_Type

// POST /api/masters/user-type
router.post('/',
    authenticate,
   authorize([]),         // only Admin (UserTypeId = 1)
    setCompanyDatabase,
    requireCompanyDB,
    createUserType,
);

// PUT /api/masters/user-type/:id
router.put('/:id',
    authenticate,
    authorize([]),         // only Admin (UserTypeId = 1)
    setCompanyDatabase,
    requireCompanyDB,
    updateUserType,
);

// DELETE /api/masters/user-type/:id  (soft delete)
router.delete('/:id',
    authenticate,
   authorize([]),         // only Admin (UserTypeId = 1)
    setCompanyDatabase,
    requireCompanyDB,
    deleteUserType,
);

export default router;