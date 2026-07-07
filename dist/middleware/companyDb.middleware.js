"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserContext = exports.getCurrentUserId = exports.getCurrentLocalUserId = exports.getCurrentCompanyInfo = exports.hasCompanyContext = exports.getDbConnection = exports.requireAuthMiddleware = exports.requireCompanyDB = exports.setCompanyDatabase = void 0;
const database_config_1 = require("../config/database.config");
const users_model_1 = require("../models/masters/users/users.model");
/**
 * Resolves the correct company Sequelize connection for every request that
 * carries a valid Bearer token and attaches it to `req.companyDB`.
 *
 * This middleware is LENIENT - it doesn't block requests on auth failure.
 * It simply attaches default DB if token is invalid/missing.
 */
const setCompanyDatabase = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7).trim()
            : null;
        // No token - use default connection
        if (!token) {
            req.companyDB = (0, database_config_1.getDefaultConnection)();
            req.currentDBName = 'default';
            req.currentCompanyId = 0;
            req.localUserId = null; // ADDED: Set localUserId to null
            console.log('🔓 No token - using default database');
            next();
            return;
        }
        // ── Fast path: session in memory ────────────────────────────────────
        const session = (0, database_config_1.verifyTokenSession)(token);
        if (session) {
            req.authenticateId = token;
            req.userId = session.userId;
            req.localUserId = session.localUserId; // ADDED: Get localUserId from session
            req.currentDBName = session.dbName;
            req.currentCompanyId = session.companyId;
            try {
                const dbConnection = await (0, database_config_1.getUserDatabaseConnectionFromToken)(token);
                if (dbConnection) {
                    req.companyDB = dbConnection;
                    console.log(`🔄 Session cache - DB: ${session.dbName} | Company: ${session.companyId} (${session.companyName}) | LocalUser: ${session.localUserId}`);
                }
                else {
                    req.companyDB = (0, database_config_1.getDefaultConnection)();
                    req.currentDBName = 'default';
                    console.log(`⚠️ Session cache - DB connection failed, using default`);
                }
            }
            catch (dbError) {
                console.error(`⚠️ Failed to connect to ${session.dbName}:`, dbError);
                req.companyDB = (0, database_config_1.getDefaultConnection)();
                req.currentDBName = 'default';
            }
            next();
            return;
        }
        // ── Slow path: not in cache — look up in User_Portal ────────────────
        console.log('🔍 Token not in cache - looking up in User_Portal_Test...');
        const UserModel = (0, users_model_1.initUserModel)((0, database_config_1.getDefaultConnection)());
        const user = await UserModel.unscoped().findOne({
            attributes: ['Global_User_ID', 'Local_User_ID', 'UserName', 'UDel_Flag', 'UserTypeId', 'Name', 'Autheticate_Id', 'Company_Id'], // ADDED: Local_User_ID
            where: { Autheticate_Id: token, UDel_Flag: 0 },
        });
        if (!user) {
            // Invalid token — fall through to default
            console.log('⚠️ Invalid token - using default database');
            req.companyDB = (0, database_config_1.getDefaultConnection)();
            req.currentDBName = 'default';
            req.currentCompanyId = 0;
            req.localUserId = null; // ADDED: Set localUserId to null
            next();
            return;
        }
        // Get company information from the user record
        const companyId = user.Company_Id;
        const localUserId = user.Local_User_ID; // ADDED: Get Local_User_ID
        // Get company details from .env configuration
        let dbName = null;
        let companyName = null;
        if (companyId) {
            const companyConfig = (0, database_config_1.getCompanyConfig)(companyId);
            if (companyConfig) {
                dbName = companyConfig.database;
                companyName = companyConfig.name;
                console.log(`📌 Found company config for ID ${companyId}: ${companyName} (${dbName})`);
            }
        }
        // If no company config found, try to get from token
        if (!dbName) {
            dbName = (0, database_config_1.getDatabaseFromToken)(token);
        }
        // Store session for future requests
        if (dbName && companyId) {
            (0, database_config_1.storeTokenSession)(token, user.Global_User_ID, localUserId, companyId, dbName, companyName || ''); // UPDATED: Added localUserId parameter
            console.log(`📝 New session stored for user ${user.UserName}, company ${companyId}, LocalUser ${localUserId}`);
        }
        req.user = user;
        req.userId = user.Global_User_ID;
        req.localUserId = localUserId; // ADDED: Set localUserId
        req.authenticateId = token;
        req.currentDBName = dbName || 'default';
        req.currentCompanyId = companyId || 0;
        // Connect to company database if we have a dbName
        if (dbName && dbName !== 'default') {
            try {
                const dbConnection = await (0, database_config_1.getUserDatabaseConnectionFromToken)(token);
                if (dbConnection) {
                    req.companyDB = dbConnection;
                    console.log(`✅ Connected to company database: ${dbName} (Company ${companyId}) | LocalUser: ${localUserId}`);
                }
                else {
                    req.companyDB = (0, database_config_1.getDefaultConnection)();
                    req.currentDBName = 'default';
                    console.log(`⚠️ Could not connect to ${dbName}, using default`);
                }
            }
            catch (dbError) {
                console.error(`⚠️ Failed to connect to ${dbName}:`, dbError);
                req.companyDB = (0, database_config_1.getDefaultConnection)();
                req.currentDBName = 'default';
            }
        }
        else {
            req.companyDB = (0, database_config_1.getDefaultConnection)();
            req.currentDBName = 'default';
        }
        next();
    }
    catch (err) {
        console.error('❌ setCompanyDatabase error:', err);
        // Never block the request — fall back to default
        req.companyDB = (0, database_config_1.getDefaultConnection)();
        req.currentDBName = 'default';
        req.currentCompanyId = 0;
        req.localUserId = null; // ADDED: Set localUserId to null on error
        next();
    }
};
exports.setCompanyDatabase = setCompanyDatabase;
/** Hard gate — use after authenticate when a company DB is strictly required */
const requireCompanyDB = (req, res, next) => {
    if (!req.companyDB || req.currentDBName === 'default' || req.currentDBName === 'default') {
        res.status(400).json({
            status: 'error',
            message: 'No company selected. Please switch to a company first.',
            data: null,
            others: {},
        });
        return;
    }
    next();
};
exports.requireCompanyDB = requireCompanyDB;
/** Require authentication middleware - blocks unauthenticated requests */
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
/** Helper to get database connection from request */
const getDbConnection = (req) => {
    return req.companyDB || (0, database_config_1.getDefaultConnection)();
};
exports.getDbConnection = getDbConnection;
/** Helper to check if request has company context */
const hasCompanyContext = (req) => {
    return !!(req.currentCompanyId && req.currentCompanyId > 0 && req.currentDBName && req.currentDBName !== 'default');
};
exports.hasCompanyContext = hasCompanyContext;
/** Helper to get current company info */
const getCurrentCompanyInfo = (req) => {
    return {
        companyId: req.currentCompanyId || 0,
        dbName: req.currentDBName || 'default',
        isCompanySelected: (0, exports.hasCompanyContext)(req)
    };
};
exports.getCurrentCompanyInfo = getCurrentCompanyInfo;
// ADDED: Helper to get current local user ID
const getCurrentLocalUserId = (req) => {
    return req.localUserId || null;
};
exports.getCurrentLocalUserId = getCurrentLocalUserId;
// ADDED: Helper to get current global user ID
const getCurrentUserId = (req) => {
    return req.userId || null;
};
exports.getCurrentUserId = getCurrentUserId;
// ADDED: Helper to get complete user context
const getUserContext = (req) => {
    return {
        globalUserId: req.userId || null,
        localUserId: req.localUserId || null,
        companyId: req.currentCompanyId || 0,
        dbName: req.currentDBName || 'default',
        isAuthenticated: !!(req.userId && req.authenticateId),
        hasCompanyContext: (0, exports.hasCompanyContext)(req)
    };
};
exports.getUserContext = getUserContext;
