// src/middleware/companyDb.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize';
import {
    getDefaultConnection,
    getUserDatabaseConnectionFromToken,
    verifyTokenSession,
    getDatabaseFromToken,
    getCompanyIdFromToken,
    storeTokenSession,
    getCompanyConfig,
    getLocalUserIdFromToken, // ADDED: Import helper
} from '../config/database.config';
import { initUserModel, UserMaster } from '../models/masters/users/users.model';

declare global {
    namespace Express {
        interface Request {
            companyDB?:        Sequelize;
            currentDBName?:    string;
            currentCompanyId?: number;
            userId?:           number;
            localUserId?:      number | null; // ADDED: Local_User_ID field
            authenticateId?:   string;
            user?:             UserMaster | null;
        }
    }
}

/**
 * Resolves the correct company Sequelize connection for every request that
 * carries a valid Bearer token and attaches it to `req.companyDB`.
 * 
 * This middleware is LENIENT - it doesn't block requests on auth failure.
 * It simply attaches default DB if token is invalid/missing.
 */
export const setCompanyDatabase = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7).trim()
            : null;

        // No token - use default connection
        if (!token) {
            req.companyDB = getDefaultConnection();
            req.currentDBName = 'default';
            req.currentCompanyId = 0;
            req.localUserId = null; // ADDED: Set localUserId to null
            console.log('🔓 No token - using default database');
            next();
            return;
        }

        // ── Fast path: session in memory ────────────────────────────────────
        const session = verifyTokenSession(token);

        if (session) {
            req.authenticateId = token;
            req.userId = session.userId;
            req.localUserId = session.localUserId; // ADDED: Get localUserId from session
            req.currentDBName = session.dbName;
            req.currentCompanyId = session.companyId;

            try {
                const dbConnection = await getUserDatabaseConnectionFromToken(token);
                if (dbConnection) {
                    req.companyDB = dbConnection;
                    console.log(`🔄 Session cache - DB: ${session.dbName} | Company: ${session.companyId} (${session.companyName}) | LocalUser: ${session.localUserId}`);
                } else {
                    req.companyDB = getDefaultConnection();
                    req.currentDBName = 'default';
                    console.log(`⚠️ Session cache - DB connection failed, using default`);
                }
            } catch (dbError) {
                console.error(`⚠️ Failed to connect to ${session.dbName}:`, dbError);
                req.companyDB = getDefaultConnection();
                req.currentDBName = 'default';
            }

            next();
            return;
        }

        // ── Slow path: not in cache — look up in User_Portal ────────────────
        console.log('🔍 Token not in cache - looking up in User_Portal_Test...');
        
        const UserModel = initUserModel(getDefaultConnection());
        const user = await UserModel.unscoped().findOne({
            attributes: ['Global_User_ID', 'Local_User_ID', 'UserName', 'UDel_Flag', 'UserTypeId', 'Name', 'Autheticate_Id', 'Company_Id'], // ADDED: Local_User_ID
            where: { Autheticate_Id: token, UDel_Flag: 0 },
        });

        if (!user) {
            // Invalid token — fall through to default
            console.log('⚠️ Invalid token - using default database');
            req.companyDB = getDefaultConnection();
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
        let dbName: string | null = null;
        let companyName: string | null = null;
        
        if (companyId) {
            const companyConfig = getCompanyConfig(companyId);
            if (companyConfig) {
                dbName = companyConfig.database;
                companyName = companyConfig.name;
                console.log(`📌 Found company config for ID ${companyId}: ${companyName} (${dbName})`);
            }
        }
        
        // If no company config found, try to get from token
        if (!dbName) {
            dbName = getDatabaseFromToken(token);
        }

        // Store session for future requests
        if (dbName && companyId) {
            storeTokenSession(token, user.Global_User_ID, localUserId, companyId, dbName, companyName || ''); // UPDATED: Added localUserId parameter
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
                const dbConnection = await getUserDatabaseConnectionFromToken(token);
                if (dbConnection) {
                    req.companyDB = dbConnection;
                    console.log(`✅ Connected to company database: ${dbName} (Company ${companyId}) | LocalUser: ${localUserId}`);
                } else {
                    req.companyDB = getDefaultConnection();
                    req.currentDBName = 'default';
                    console.log(`⚠️ Could not connect to ${dbName}, using default`);
                }
            } catch (dbError) {
                console.error(`⚠️ Failed to connect to ${dbName}:`, dbError);
                req.companyDB = getDefaultConnection();
                req.currentDBName = 'default';
            }
        } else {
            req.companyDB = getDefaultConnection();
            req.currentDBName = 'default';
        }

        next();

    } catch (err) {
        console.error('❌ setCompanyDatabase error:', err);
        // Never block the request — fall back to default
        req.companyDB = getDefaultConnection();
        req.currentDBName = 'default';
        req.currentCompanyId = 0;
        req.localUserId = null; // ADDED: Set localUserId to null on error
        next();
    }
};

/** Hard gate — use after authenticate when a company DB is strictly required */
export const requireCompanyDB = (req: Request, res: Response, next: NextFunction): void => {
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

/** Require authentication middleware - blocks unauthenticated requests */
export const requireAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
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

/** Helper to get database connection from request */
export const getDbConnection = (req: Request): Sequelize => {
    return req.companyDB || getDefaultConnection();
};

/** Helper to check if request has company context */
export const hasCompanyContext = (req: Request): boolean => {
    return !!(req.currentCompanyId && req.currentCompanyId > 0 && req.currentDBName && req.currentDBName !== 'default');
};

/** Helper to get current company info */
export const getCurrentCompanyInfo = (req: Request) => {
    return {
        companyId: req.currentCompanyId || 0,
        dbName: req.currentDBName || 'default',
        isCompanySelected: hasCompanyContext(req)
    };
};

// ADDED: Helper to get current local user ID
export const getCurrentLocalUserId = (req: Request): number | null => {
    return req.localUserId || null;
};

// ADDED: Helper to get current global user ID
export const getCurrentUserId = (req: Request): number | null => {
    return req.userId || null;
};

// ADDED: Helper to get complete user context
export const getUserContext = (req: Request) => {
    return {
        globalUserId: req.userId || null,
        localUserId: req.localUserId || null,
        companyId: req.currentCompanyId || 0,
        dbName: req.currentDBName || 'default',
        isAuthenticated: !!(req.userId && req.authenticateId),
        hasCompanyContext: hasCompanyContext(req)
    };
};