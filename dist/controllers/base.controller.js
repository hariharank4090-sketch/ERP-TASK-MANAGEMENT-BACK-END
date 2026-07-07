"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasCompanyDB = exports.isAuthenticated = exports.getCompanyId = exports.getAuthenticateId = exports.getUserId = exports.getCurrentDatabaseName = exports.getDbConnection = void 0;
const database_config_1 = require("../config/database.config");
/**
 * Returns the Sequelize instance that every controller should use.
 *
 * Priority:
 *  1. req.companyDB  — set by setCompanyDatabase / authenticate middleware
 *                      (points to the user's active company database)
 *  2. Default DB     — User_Portal fallback
 *
 * Usage in any controller:
 *
 *   import { getDbConnection } from '../base.controller';
 *
 *   export const getItems = async (req: Request, res: Response) => {
 *       const db     = getDbConnection(req);
 *       const Model  = initItemModel(db);
 *       const items  = await Model.findAll();
 *       ...
 *   };
 */
const getDbConnection = (req) => {
    if (req.companyDB && req.currentDBName && req.currentDBName !== 'default') {
        console.log(`📊 Controller using company DB: ${req.currentDBName}`);
        return req.companyDB;
    }
    console.log(`📊 Controller using default DB (User_Portal)`);
    return (0, database_config_1.getDefaultConnection)();
};
exports.getDbConnection = getDbConnection;
/** Convenience: name of the active database */
const getCurrentDatabaseName = (req) => req.currentDBName || 'default';
exports.getCurrentDatabaseName = getCurrentDatabaseName;
/** Convenience: authenticated user id */
const getUserId = (req) => req.userId ?? null;
exports.getUserId = getUserId;
/** Convenience: raw token */
const getAuthenticateId = (req) => req.authenticateId ?? null;
exports.getAuthenticateId = getAuthenticateId;
/** Convenience: company id */
const getCompanyId = (req) => req.currentCompanyId ?? null;
exports.getCompanyId = getCompanyId;
/** True when the user is fully authenticated and a company DB is active */
const isAuthenticated = (req) => !!(req.userId && req.authenticateId);
exports.isAuthenticated = isAuthenticated;
const hasCompanyDB = (req) => !!(req.companyDB && req.currentDBName && req.currentDBName !== 'default');
exports.hasCompanyDB = hasCompanyDB;
