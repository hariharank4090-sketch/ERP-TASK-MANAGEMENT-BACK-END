"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyRole = exports.deleteUserType = exports.updateUserType = exports.createUserType = exports.getUserTypeById = exports.getAllUserTypes = void 0;
const sequelize_1 = require("sequelize");
const userType_model_1 = require("../../../models/masters/users/userType.model");
const users_model_1 = require("../../../models/masters/users/users.model");
const database_config_1 = require("../../../config/database.config");
// ─── Internal helper ──────────────────────────────────────────────────────────
/**
 * Resolves the company Sequelize connection from the request.
 * Throws a descriptive error if the middleware has not attached one —
 * this prevents silent fallback to the wrong (portal) database.
 */
function requireCompanySequelize(req) {
    if (!req.companyDB) {
        throw new Error('Company database connection not found on request. Make sure authenticate + setCompanyDatabase middleware are applied.');
    }
    if (!req.currentDBName || req.currentDBName === 'default') {
        throw new Error('No company selected. Please login and select a company first.');
    }
    return req.companyDB;
}
// ─── GET ALL ──────────────────────────────────────────────────────────────────
/**
 * GET /api/masters/user-type
 *
 * Returns all active user types from the company database.
 * tbl_User_Type.Id  maps to  User_Portal_Test.tbl_Users.UserTypeId
 */
const getAllUserTypes = async (req, res) => {
    try {
        const companyDB = requireCompanySequelize(req);
        const UserTypeModel = (0, userType_model_1.initUserTypeModel)(companyDB);
        const userTypes = await UserTypeModel.findAll({
            order: [['UserType', 'ASC']],
        });
        return res.status(200).json({
            status: 'success',
            message: 'User types fetched successfully',
            data: userTypes,
            others: {
                companyId: req.currentCompanyId,
                dbName: req.currentDBName,
                count: userTypes.length,
            },
        });
    }
    catch (err) {
        console.error('❌ getAllUserTypes error:', err.message);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error',
            data: null,
            others: {},
        });
    }
};
exports.getAllUserTypes = getAllUserTypes;
// ─── GET BY ID ────────────────────────────────────────────────────────────────
/**
 * GET /api/masters/user-type/:id
 */
const getUserTypeById = async (req, res) => {
    try {
        const companyDB = requireCompanySequelize(req);
        const UserTypeModel = (0, userType_model_1.initUserTypeModel)(companyDB);
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid ID — must be a number',
                data: null,
                others: {},
            });
        }
        const userType = await UserTypeModel.findByPk(id);
        if (!userType) {
            return res.status(404).json({
                status: 'error',
                message: `User type with ID ${id} not found`,
                data: null,
                others: {},
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'User type fetched successfully',
            data: userType,
            others: {},
        });
    }
    catch (err) {
        console.error('❌ getUserTypeById error:', err.message);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error',
            data: null,
            others: {},
        });
    }
};
exports.getUserTypeById = getUserTypeById;
// ─── CREATE ───────────────────────────────────────────────────────────────────
/**
 * POST /api/masters/user-type
 * Body: { UserType: string, Alias?: string, IsActive?: number }
 */
const createUserType = async (req, res) => {
    try {
        const companyDB = requireCompanySequelize(req);
        const UserTypeModel = (0, userType_model_1.initUserTypeModel)(companyDB);
        // Validate body
        const parsed = userType_model_1.userTypeCreateSchema.safeParse(req.body);
        if (!parsed.success) {
            // Properly handle ZodError format
            const errorMessages = parsed.error.issues.map(e => ({
                field: e.path.join('.'),
                message: 'Internal server error',
            }));
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                data: errorMessages,
                others: {},
            });
        }
        const { UserType, Alias, IsActive } = parsed.data;
        // Check for duplicate name
        const existing = await UserTypeModel.findOne({
            where: { UserType },
        });
        if (existing) {
            return res.status(409).json({
                status: 'error',
                message: `User type "${UserType}" already exists`,
                data: null,
                others: {},
            });
        }
        const newUserType = await UserTypeModel.create({
            UserType,
            Alias: Alias ?? null,
            IsActive: IsActive ?? 1,
        });
        console.log(`✅ UserType created: "${UserType}" (ID: ${newUserType.Id}) in ${req.currentDBName}`);
        return res.status(201).json({
            status: 'success',
            message: 'User type created successfully',
            data: newUserType,
            others: {},
        });
    }
    catch (err) {
        console.error('❌ createUserType error:', err.message);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error',
            data: null,
            others: {},
        });
    }
};
exports.createUserType = createUserType;
// ─── UPDATE ───────────────────────────────────────────────────────────────────
/**
 * PUT /api/masters/user-type/:id
 * Body: { UserType?: string, Alias?: string, IsActive?: number }
 */
const updateUserType = async (req, res) => {
    try {
        const companyDB = requireCompanySequelize(req);
        const UserTypeModel = (0, userType_model_1.initUserTypeModel)(companyDB);
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid ID — must be a number',
                data: null,
                others: {},
            });
        }
        const userType = await UserTypeModel.findByPk(id);
        if (!userType) {
            return res.status(404).json({
                status: 'error',
                message: `User type with ID ${id} not found`,
                data: null,
                others: {},
            });
        }
        // Validate body
        const parsed = userType_model_1.userTypeUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            // Properly handle ZodError format
            const errorMessages = parsed.error.issues.map(e => ({
                field: e.path.join('.'),
                message: 'Internal server error',
            }));
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                data: errorMessages,
                others: {},
            });
        }
        // Check duplicate name if UserType is being changed
        if (parsed.data.UserType && parsed.data.UserType !== userType.UserType) {
            const duplicate = await UserTypeModel.findOne({
                where: {
                    UserType: parsed.data.UserType,
                    Id: { [sequelize_1.Op.ne]: id },
                },
            });
            if (duplicate) {
                return res.status(409).json({
                    status: 'error',
                    message: `User type "${parsed.data.UserType}" already exists`,
                    data: null,
                    others: {},
                });
            }
        }
        await userType.update(parsed.data);
        console.log(`✅ UserType updated: ID ${id} in ${req.currentDBName}`);
        return res.status(200).json({
            status: 'success',
            message: 'User type updated successfully',
            data: userType,
            others: {},
        });
    }
    catch (err) {
        console.error('❌ updateUserType error:', err.message);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error',
            data: null,
            others: {},
        });
    }
};
exports.updateUserType = updateUserType;
// ─── DELETE (Soft) ────────────────────────────────────────────────────────────
/**
 * DELETE /api/masters/user-type/:id
 *
 * Soft-deletes by setting IsActive = 0.
 * Blocks deletion if any active users in User_Portal_Test are assigned this role.
 */
const deleteUserType = async (req, res) => {
    try {
        const companyDB = requireCompanySequelize(req);
        const UserTypeModel = (0, userType_model_1.initUserTypeModel)(companyDB);
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid ID — must be a number',
                data: null,
                others: {},
            });
        }
        const userType = await UserTypeModel.findByPk(id);
        if (!userType) {
            return res.status(404).json({
                status: 'error',
                message: `User type with ID ${id} not found`,
                data: null,
                others: {},
            });
        }
        // Safety check — don't delete a role that is still assigned to active users
        // UserTypeId in tbl_Users maps to Id in tbl_User_Type
        const UserModel = (0, users_model_1.initUserModel)((0, database_config_1.getDefaultConnection)());
        const assignedCount = await UserModel.unscoped().count({
            where: { UserTypeId: id, UDel_Flag: 0 },
        });
        if (assignedCount > 0) {
            return res.status(400).json({
                status: 'error',
                message: `Cannot delete — ${assignedCount} active user(s) are still assigned this role`,
                data: null,
                others: { assignedUserCount: assignedCount },
            });
        }
        // Soft delete
        await userType.update({ IsActive: 0 });
        console.log(`✅ UserType soft-deleted: ID ${id} ("${userType.UserType}") in ${req.currentDBName}`);
        return res.status(200).json({
            status: 'success',
            message: 'User type deleted successfully',
            data: null,
            others: {},
        });
    }
    catch (err) {
        console.error('❌ deleteUserType error:', err.message);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error',
            data: null,
            others: {},
        });
    }
};
exports.deleteUserType = deleteUserType;
// ─── GET MY ROLE ──────────────────────────────────────────────────────────────
/**
 * GET /api/masters/user-type/my-role
 *
 * Reads the logged-in user's UserTypeId from User_Portal_Test.tbl_Users,
 * then fetches the matching row from the company DB's tbl_User_Type.
 *
 * This is the bridge between the two databases:
 *   User_Portal_Test.tbl_Users.UserTypeId  →  CompanyDB.tbl_User_Type.Id
 */
const getMyRole = async (req, res) => {
    try {
        const companyDB = requireCompanySequelize(req);
        const UserTypeModel = (0, userType_model_1.initUserTypeModel)(companyDB);
        if (!req.userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required',
                data: null,
                others: {},
            });
        }
        // Step 1 — Get UserTypeId from the portal database
        const UserModel = (0, users_model_1.initUserModel)((0, database_config_1.getDefaultConnection)());
        const user = await UserModel.unscoped().findOne({
            attributes: ['Global_User_ID', 'UserTypeId', 'Name', 'UserName'],
            where: { Global_User_ID: req.userId, UDel_Flag: 0 },
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
                data: null,
                others: {},
            });
        }
        if (!user.UserTypeId) {
            return res.status(404).json({
                status: 'error',
                message: 'No role assigned to this user',
                data: null,
                others: {},
            });
        }
        // Step 2 — Look up the role in the company database
        // tbl_Users.UserTypeId  →  tbl_User_Type.Id
        const role = await UserTypeModel.findOne({
            where: { Id: user.UserTypeId },
        });
        if (!role) {
            return res.status(404).json({
                status: 'error',
                message: `Role ID ${user.UserTypeId} not found in company database "${req.currentDBName}"`,
                data: null,
                others: { userTypeId: user.UserTypeId },
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Role fetched successfully',
            data: {
                user: {
                    Global_User_ID: user.Global_User_ID,
                    Name: user.Name,
                    UserName: user.UserName,
                    UserTypeId: user.UserTypeId,
                },
                role: {
                    Id: role.Id,
                    UserType: role.UserType,
                    Alias: role.Alias,
                    IsActive: role.IsActive,
                },
            },
            others: {
                companyId: req.currentCompanyId,
                dbName: req.currentDBName,
            },
        });
    }
    catch (err) {
        console.error('❌ getMyRole error:', err.message);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error',
            data: null,
            others: {},
        });
    }
};
exports.getMyRole = getMyRole;
