"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCurrentDatabase = exports.hasAnyUserRole = exports.hasUserRole = exports.getUserContext = exports.getCurrentGlobalUserId = exports.getCurrentLocalUserId = exports.getCurrentCompanyInfo = exports.hasCompanyContext = exports.getDbConnection = exports.requireCompanyDB = exports.requireAuthMiddleware = exports.setCompanyDatabase = void 0;
const database_config_1 = require("../config/database.config");
const users_model_1 = require("../models/masters/users/users.model");
// ─── Token extractor ──────────────────────────────────────────────────────────
function extractToken(req) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        return header.substring(7).trim();
    }
    return null;
}
// ─── setCompanyDatabase ───────────────────────────────────────────────────────
/**
 * LENIENT middleware — never blocks the request.
 * Attaches the correct company Sequelize instance to req.companyDB.
 *
 * Priority:
 *   1. Token found in in-memory session cache → use cached company DB
 *   2. Token found in User_Portal_Test.tbl_Users → rebuild session + use company DB
 *   3. No token / invalid token → use default connection (portal DB)
 */
const setCompanyDatabase = async (req, res, next) => {
    try {
        const token = extractToken(req);
        // ── No token ─────────────────────────────────────────────────────────
        if (!token) {
            req.companyDB = (0, database_config_1.getDefaultConnection)();
            req.currentDBName = 'default';
            req.currentCompanyId = 0;
            req.localUserId = null; // ADDED: Set localUserId to null
            console.log('🔓 No token — using default database');
            return next();
        }
        req.authenticateId = token;
        // ── Fast path: session already in memory ──────────────────────────────
        const session = (0, database_config_1.verifyTokenSession)(token);
        if (session) {
            req.userId = session.userId;
            req.localUserId = session.localUserId; // ADDED: Get localUserId from session
            req.currentCompanyId = session.companyId;
            req.currentDBName = session.dbName;
            try {
                req.companyDB = await (0, database_config_1.getUserDatabaseConnectionFromToken)(token);
                console.log(`🔄 Session cache — User: ${session.userId} | LocalUser: ${session.localUserId} | Company: ${session.companyId} | DB: ${session.dbName}`);
            }
            catch (dbErr) {
                console.warn(`⚠️ Could not connect to ${session.dbName}, falling back to default`);
                req.companyDB = (0, database_config_1.getDefaultConnection)();
                req.currentDBName = 'default';
            }
            return next();
        }
        // ── Slow path: token not in cache — check DB ──────────────────────────
        console.log('🔍 Token not in cache — looking up in User_Portal...');
        const UserModel = (0, users_model_1.initUserModel)((0, database_config_1.getDefaultConnection)());
        const user = await UserModel.unscoped().findOne({
            attributes: [
                'Global_User_ID', 'Local_User_ID', 'UserName', 'Name', // ADDED: Local_User_ID
                'UDel_Flag', 'UserTypeId', 'Autheticate_Id', 'Company_Id',
            ],
            where: { Autheticate_Id: token, UDel_Flag: 0 },
        });
        if (!user) {
            // Invalid token — fall back silently
            console.log('⚠️ Token not found in DB — using default database');
            req.companyDB = (0, database_config_1.getDefaultConnection)();
            req.currentDBName = 'default';
            req.currentCompanyId = 0;
            req.localUserId = null; // ADDED: Set localUserId to null
            return next();
        }
        // Resolve company DB config from .env
        const companyId = user.Company_Id ?? 0;
        const localUserId = user.Local_User_ID; // ADDED: Get Local_User_ID
        let dbName = '';
        let companyName = '';
        if (companyId) {
            const cfg = (0, database_config_1.getCompanyConfig)(companyId);
            if (cfg) {
                dbName = cfg.database;
                companyName = cfg.name;
            }
        }
        // Fallback to token map if .env config missing
        if (!dbName) {
            dbName = (0, database_config_1.getDatabaseFromToken)(token) ?? '';
        }
        // Rebuild session in memory so next request hits fast path
        if (companyId && dbName) {
            (0, database_config_1.storeTokenSession)(token, user.Global_User_ID, localUserId, companyId, dbName, companyName); // UPDATED: Added localUserId
        }
        req.user = user;
        req.userId = user.Global_User_ID;
        req.localUserId = localUserId; // ADDED: Set localUserId
        req.currentCompanyId = companyId;
        req.currentDBName = dbName || 'default';
        // Connect to company DB
        if (dbName && dbName !== 'default') {
            try {
                req.companyDB = await (0, database_config_1.getUserDatabaseConnectionFromToken)(token);
                console.log(`✅ Connected — User: ${user.UserName} | GlobalUser: ${user.Global_User_ID} | LocalUser: ${localUserId} | Company: ${companyId} | DB: ${dbName}`);
            }
            catch (dbErr) {
                console.warn(`⚠️ Could not connect to ${dbName}, falling back to default`);
                req.companyDB = (0, database_config_1.getDefaultConnection)();
                req.currentDBName = 'default';
            }
        }
        else {
            req.companyDB = (0, database_config_1.getDefaultConnection)();
            req.currentDBName = 'default';
        }
        return next();
    }
    catch (err) {
        console.error('❌ setCompanyDatabase error:', err);
        // Never block — fall back to default
        req.companyDB = (0, database_config_1.getDefaultConnection)();
        req.currentDBName = 'default';
        req.currentCompanyId = 0;
        req.localUserId = null; // ADDED: Set localUserId to null on error
        return next();
    }
};
exports.setCompanyDatabase = setCompanyDatabase;
// ─── requireAuthMiddleware ────────────────────────────────────────────────────
/**
 * Hard gate — blocks requests with no authenticated user.
 * Apply AFTER setCompanyDatabase.
 */
const requireAuthMiddleware = (req, res, next) => {
    if (!req.userId || !req.authenticateId) {
        res.status(401).json({
            status: 'error',
            message: 'Authentication required',
            data: null,
            others: {},
        });
        return;
    }
    next();
};
exports.requireAuthMiddleware = requireAuthMiddleware;
// ─── requireCompanyDB ─────────────────────────────────────────────────────────
/**
 * Hard gate — blocks requests that have no company DB attached.
 * Apply after setCompanyDatabase when the endpoint MUST use a company database.
 *
 * Example: tbl_User_Type lives in the company DB — any route that touches it
 * must be protected by this middleware.
 */
const requireCompanyDB = (req, res, next) => {
    if (!req.companyDB || !req.currentDBName || req.currentDBName === 'default') {
        res.status(400).json({
            status: 'error',
            message: 'No company selected. Please login and select a company first.',
            data: null,
            others: {},
        });
        return;
    }
    next();
};
exports.requireCompanyDB = requireCompanyDB;
// ─── Utility helpers ──────────────────────────────────────────────────────────
/** Returns the company DB from the request, or the default connection as fallback. */
const getDbConnection = (req) => req.companyDB ?? (0, database_config_1.getDefaultConnection)();
exports.getDbConnection = getDbConnection;
/** Returns true when the request carries a valid company context. */
const hasCompanyContext = (req) => !!(req.currentCompanyId &&
    req.currentCompanyId > 0 &&
    req.currentDBName &&
    req.currentDBName !== 'default');
exports.hasCompanyContext = hasCompanyContext;
/** Returns a summary of the current company context. */
const getCurrentCompanyInfo = (req) => ({
    companyId: req.currentCompanyId ?? 0,
    dbName: req.currentDBName ?? 'default',
    isCompanySelected: (0, exports.hasCompanyContext)(req),
});
exports.getCurrentCompanyInfo = getCurrentCompanyInfo;
// ─── ADDED: User context helpers ──────────────────────────────────────────────
/** Returns the current Local_User_ID from the request */
const getCurrentLocalUserId = (req) => req.localUserId ?? null;
exports.getCurrentLocalUserId = getCurrentLocalUserId;
/** Returns the current Global_User_ID from the request */
const getCurrentGlobalUserId = (req) => req.userId ?? null;
exports.getCurrentGlobalUserId = getCurrentGlobalUserId;
/** Returns complete user context from the request */
const getUserContext = (req) => ({
    globalUserId: req.userId ?? null,
    localUserId: req.localUserId ?? null,
    userName: req.user?.UserName ?? null,
    userTypeId: req.user?.UserTypeId ?? null,
    companyId: req.currentCompanyId ?? 0,
    dbName: req.currentDBName ?? 'default',
    isAuthenticated: !!(req.userId && req.authenticateId),
    hasUser: !!req.user,
    hasCompanyContext: (0, exports.hasCompanyContext)(req),
});
exports.getUserContext = getUserContext;
/** Check if user has specific role */
const hasUserRole = (req, roleId) => {
    const userTypeId = req.user?.UserTypeId;
    if (userTypeId === undefined || userTypeId === null)
        return false;
    if (userTypeId === 0)
        return true; // Super Admin bypass
    return userTypeId === roleId;
};
exports.hasUserRole = hasUserRole;
/** Check if user has any of the allowed roles */
const hasAnyUserRole = (req, allowedRoles) => {
    const userTypeId = req.user?.UserTypeId;
    if (userTypeId === undefined || userTypeId === null)
        return false;
    if (userTypeId === 0)
        return true; // Super Admin bypass
    return allowedRoles.includes(userTypeId);
};
exports.hasAnyUserRole = hasAnyUserRole;
/** Optional logger middleware — place before routes for request tracing. */
const logCurrentDatabase = (req, _res, next) => {
    console.log(`📊 ${req.method} ${req.path} | DB: ${req.currentDBName ?? 'default'} | GlobalUser: ${req.userId ?? 'anonymous'} | LocalUser: ${req.localUserId ?? 'N/A'}`);
    next();
};
exports.logCurrentDatabase = logCurrentDatabase;
