"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAnyRole = exports.hasRole = exports.isSuperAdmin = exports.getUserContext = exports.getCurrentGlobalUserId = exports.getCurrentLocalUserId = exports.authorize = exports.authenticate = void 0;
const database_config_1 = require("../config/database.config");
const users_model_1 = require("../models/masters/users/users.model");
// ─── Token extractor ──────────────────────────────────────────────────────────
const extractToken = (req) => {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        return header.substring(7).trim();
    }
    return null;
};
// ─── authenticate ─────────────────────────────────────────────────────────────
/**
 * Verifies the Bearer token and attaches to req:
 *   req.user             — full UserMaster row (includes UserTypeId)
 *   req.userId           — Global_User_ID
 *   req.localUserId      — Local_User_ID (ADDED)
 *   req.authenticateId   — token string
 *   req.currentDBName    — company DB name
 *   req.currentCompanyId — company id
 *   req.companyDB        — Sequelize instance for company DB
 */
const authenticate = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            res.status(401).json({
                status: 'error',
                message: 'No token provided',
                data: null,
                others: {},
            });
            return;
        }
        req.authenticateId = token;
        const UserModel = (0, users_model_1.initUserModel)((0, database_config_1.getDefaultConnection)());
        // ── Fast path: session in memory ──────────────────────────────────────
        const session = (0, database_config_1.verifyTokenSession)(token);
        if (session) {
            // Always fetch full user row so UserTypeId is never stale/missing
            const defaultDb = (0, database_config_1.getDefaultConnection)();
            const [users] = await defaultDb.query(`SELECT Global_User_ID, Local_User_ID, UserName, UserTypeId, Name, Company_Id, UDel_Flag, Autheticate_Id 
                 FROM tbl_Users WITH (NOLOCK) 
                 WHERE Global_User_ID = :userId AND UDel_Flag = 0`, { replacements: { userId: session.userId } });
            const user = users.length > 0 ? users[0] : null;
            if (!user) {
                res.status(401).json({
                    status: 'error',
                    message: 'User not found or has been deactivated',
                    data: null,
                    others: {},
                });
                return;
            }
            req.user = user;
            req.userId = session.userId;
            req.localUserId = session.localUserId || user.Local_User_ID; // ADDED: Get localUserId from session or user
            req.currentDBName = session.dbName;
            req.currentCompanyId = session.companyId;
            try {
                req.companyDB = await (0, database_config_1.getUserDatabaseConnectionFromToken)(token);
            }
            catch {
                req.companyDB = (0, database_config_1.getDefaultConnection)();
            }
            console.log(`✅ Auth (cache) — user: ${user.Global_User_ID} | Global_User_ID: ${user.Global_User_ID} | Local_User_ID: ${req.localUserId || 'N/A'} | UserTypeId: ${user.UserTypeId} | DB: ${session.dbName}`);
            next();
            return;
        }
        // ── Slow path: token not in cache — look up in DB ─────────────────────
        console.log('🔍 Token not in cache — checking database...');
        const defaultDb = (0, database_config_1.getDefaultConnection)();
        const [users] = await defaultDb.query(`SELECT Global_User_ID, Local_User_ID, UserName, UserTypeId, Name, Company_Id, UDel_Flag, Autheticate_Id 
             FROM tbl_Users WITH (NOLOCK) 
             WHERE Autheticate_Id = :token AND UDel_Flag = 0`, { replacements: { token } });
        const user = users.length > 0 ? users[0] : null;
        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid or expired token',
                data: null,
                others: {},
            });
            return;
        }
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
        // UPDATED: Store token session with localUserId
        (0, database_config_1.storeTokenSession)(token, user.Global_User_ID, localUserId, companyId, dbName, companyName);
        req.user = user;
        req.userId = user.Global_User_ID;
        req.localUserId = localUserId; // ADDED: Set localUserId
        req.currentDBName = dbName || 'default';
        req.currentCompanyId = companyId;
        if (dbName && dbName !== 'default') {
            try {
                req.companyDB = await (0, database_config_1.getUserDatabaseConnectionFromToken)(token);
            }
            catch {
                req.companyDB = (0, database_config_1.getDefaultConnection)();
            }
        }
        else {
            req.companyDB = (0, database_config_1.getDefaultConnection)();
        }
        console.log(`✅ Auth (db) — user: ${user.Global_User_ID} | Global_User_ID: ${user.Global_User_ID} | Local_User_ID: ${localUserId || 'N/A'} | UserTypeId: ${user.UserTypeId} | DB: ${dbName || 'default'}`);
        next();
    }
    catch (err) {
        console.error('❌ authenticate error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server error during authentication',
            data: null,
            others: {},
        });
    }
};
exports.authenticate = authenticate;
// ─── authorize ────────────────────────────────────────────────────────────────
/**
 * Role-based access control gate.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  SUPER ADMIN RULE                                               │
 * │  UserTypeId = 0  →  Super Admin                                 │
 * │  Bypasses ALL role checks. Always allowed on every route.       │
 * │  This matches your ADMIN1 user (UserTypeId = 0 in tbl_Users).  │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Usage:
 *   authorize([])        → any authenticated user (skip role check)
 *   authorize([1])       → Super Admin (0)  OR  UserTypeId 1
 *   authorize([1, 2])    → Super Admin (0)  OR  UserTypeId 1 or 2
 *
 * Mapping:
 *   User_Portal_Test.tbl_Users.UserTypeId  →  CompanyDB.tbl_User_Type.Id
 */
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            // Guard: authenticate must run before authorize
            if (!user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Authentication required',
                    data: null,
                    others: {},
                });
                return;
            }
            // Safely parse UserTypeId — null/undefined means no role assigned
            const userTypeId = user.UserTypeId !== null && user.UserTypeId !== undefined
                ? Number(user.UserTypeId)
                : null;
            // ── Super Admin bypass (UserTypeId = 0) ───────────────────────────
            // UserTypeId 0 = Super Admin, full access to all routes
            if (userTypeId === 0) {
                console.log(`✅ Super Admin — user: ${user.UserName} (UserTypeId: 0) | Local_User_ID: ${req.localUserId || 'N/A'} — full access granted`);
                next();
                return;
            }
            // ── Allow all authenticated users (empty array) ───────────────────
            if (allowedRoles.length === 0) {
                next();
                return;
            }
            // ── No role assigned (null UserTypeId) ────────────────────────────
            if (userTypeId === null) {
                res.status(403).json({
                    status: 'error',
                    message: 'Access denied — no role assigned to this user',
                    data: null,
                    others: { userTypeId: null, allowedRoles },
                });
                return;
            }
            // ── Normal role check ─────────────────────────────────────────────
            if (!allowedRoles.includes(userTypeId)) {
                console.warn(`🚫 Unauthorized — user: ${user.UserName} | Global_User_ID: ${user.Global_User_ID} | Local_User_ID: ${req.localUserId || 'N/A'} | UserTypeId: ${userTypeId} | allowedRoles: [${allowedRoles}]`);
                res.status(403).json({
                    status: 'error',
                    message: 'Access denied — you do not have permission for this action',
                    data: null,
                    others: { yourRole: userTypeId, allowedRoles },
                });
                return;
            }
            console.log(`✅ Authorized — user: ${user.UserName} | Global_User_ID: ${user.Global_User_ID} | Local_User_ID: ${req.localUserId || 'N/A'} | UserTypeId: ${userTypeId}`);
            next();
        }
        catch (err) {
            console.error('❌ authorize error:', err);
            res.status(500).json({
                status: 'error',
                message: 'Server error during authorization',
                data: null,
                others: {},
            });
        }
    };
};
exports.authorize = authorize;
// ─── Helper Functions (ADDED) ─────────────────────────────────────────────────
/**
 * Get current Local_User_ID from request
 */
const getCurrentLocalUserId = (req) => {
    return req.localUserId || null;
};
exports.getCurrentLocalUserId = getCurrentLocalUserId;
/**
 * Get current Global_User_ID from request
 */
const getCurrentGlobalUserId = (req) => {
    return req.userId || null;
};
exports.getCurrentGlobalUserId = getCurrentGlobalUserId;
/**
 * Get complete user context from request
 */
const getUserContext = (req) => {
    return {
        globalUserId: req.userId || null,
        localUserId: req.localUserId || null,
        userName: req.user?.UserName || null,
        userTypeId: req.user?.UserTypeId || null,
        companyId: req.currentCompanyId || 0,
        dbName: req.currentDBName || 'default',
        isAuthenticated: !!(req.userId && req.authenticateId),
        hasUser: !!req.user
    };
};
exports.getUserContext = getUserContext;
/**
 * Check if user is Super Admin (UserTypeId = 0)
 */
const isSuperAdmin = (req) => {
    return req.user?.UserTypeId === 0;
};
exports.isSuperAdmin = isSuperAdmin;
/**
 * Check if user has specific role
 */
const hasRole = (req, roleId) => {
    return req.user?.UserTypeId === roleId;
};
exports.hasRole = hasRole;
/**
 * Check if user has any of the allowed roles
 */
const hasAnyRole = (req, allowedRoles) => {
    const userTypeId = req.user?.UserTypeId;
    if (userTypeId === undefined || userTypeId === null)
        return false;
    if (userTypeId === 0)
        return true; // Super Admin bypass
    return allowedRoles.includes(userTypeId);
};
exports.hasAnyRole = hasAnyRole;
