// src/middleware/database.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize';
import {
    getDefaultConnection,
    getUserDatabaseConnectionFromToken,
    verifyTokenSession,
    getDatabaseFromToken,
    storeTokenSession,
    getCompanyConfig,
} from '../config/database.config';
import { initUserModel, UserMaster } from '../models/masters/users/users.model';

// ─── Extend Express Request ───────────────────────────────────────────────────

declare global {
    namespace Express {
        interface Request {
            companyDB?:        Sequelize;       // company Sequelize instance
            currentDBName?:    string;          // e.g. "ERP_DB_SMT_TEST"
            currentCompanyId?: number;          // e.g. 1
            userId?:           number;          // Global_User_ID
            localUserId?:      number | null;   // ADDED: Local_User_ID
            authenticateId?:   string;          // Bearer token value
            user?:             UserMaster | null;
        }
    }
}

// ─── Token extractor ──────────────────────────────────────────────────────────

function extractToken(req: Request): string | null {
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
export const setCompanyDatabase = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const token = extractToken(req);

        // ── No token ─────────────────────────────────────────────────────────
        if (!token) {
            req.companyDB        = getDefaultConnection();
            req.currentDBName    = 'default';
            req.currentCompanyId = 0;
            req.localUserId      = null; // ADDED: Set localUserId to null
            console.log('🔓 No token — using default database');
            return next();
        }

        req.authenticateId = token;

        // ── Fast path: session already in memory ──────────────────────────────
        const session = verifyTokenSession(token);

        if (session) {
            req.userId           = session.userId;
            req.localUserId      = session.localUserId; // ADDED: Get localUserId from session
            req.currentCompanyId = session.companyId;
            req.currentDBName    = session.dbName;

            try {
                req.companyDB = await getUserDatabaseConnectionFromToken(token);
                console.log(`🔄 Session cache — User: ${session.userId} | LocalUser: ${session.localUserId} | Company: ${session.companyId} | DB: ${session.dbName}`);
            } catch (dbErr) {
                console.warn(`⚠️ Could not connect to ${session.dbName}, falling back to default`);
                req.companyDB     = getDefaultConnection();
                req.currentDBName = 'default';
            }

            return next();
        }

        // ── Slow path: token not in cache — check DB ──────────────────────────
        console.log('🔍 Token not in cache — looking up in User_Portal...');

        const UserModel = initUserModel(getDefaultConnection());
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
            req.companyDB        = getDefaultConnection();
            req.currentDBName    = 'default';
            req.currentCompanyId = 0;
            req.localUserId      = null; // ADDED: Set localUserId to null
            return next();
        }

        // Resolve company DB config from .env
        const companyId = user.Company_Id ?? 0;
        const localUserId = user.Local_User_ID; // ADDED: Get Local_User_ID
        let dbName      = '';
        let companyName = '';

        if (companyId) {
            const cfg = getCompanyConfig(companyId);
            if (cfg) {
                dbName      = cfg.database;
                companyName = cfg.name;
            }
        }

        // Fallback to token map if .env config missing
        if (!dbName) {
            dbName = getDatabaseFromToken(token) ?? '';
        }

        // Rebuild session in memory so next request hits fast path
        if (companyId && dbName) {
            storeTokenSession(token, user.Global_User_ID, localUserId, companyId, dbName, companyName); // UPDATED: Added localUserId
        }

        req.user             = user;
        req.userId           = user.Global_User_ID;
        req.localUserId      = localUserId; // ADDED: Set localUserId
        req.currentCompanyId = companyId;
        req.currentDBName    = dbName || 'default';

        // Connect to company DB
        if (dbName && dbName !== 'default') {
            try {
                req.companyDB = await getUserDatabaseConnectionFromToken(token);
                console.log(`✅ Connected — User: ${user.UserName} | GlobalUser: ${user.Global_User_ID} | LocalUser: ${localUserId} | Company: ${companyId} | DB: ${dbName}`);
            } catch (dbErr) {
                console.warn(`⚠️ Could not connect to ${dbName}, falling back to default`);
                req.companyDB     = getDefaultConnection();
                req.currentDBName = 'default';
            }
        } else {
            req.companyDB     = getDefaultConnection();
            req.currentDBName = 'default';
        }

        return next();

    } catch (err) {
        console.error('❌ setCompanyDatabase error:', err);
        // Never block — fall back to default
        req.companyDB        = getDefaultConnection();
        req.currentDBName    = 'default';
        req.currentCompanyId = 0;
        req.localUserId      = null; // ADDED: Set localUserId to null on error
        return next();
    }
};

// ─── requireAuthMiddleware ────────────────────────────────────────────────────

/**
 * Hard gate — blocks requests with no authenticated user.
 * Apply AFTER setCompanyDatabase.
 */
export const requireAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    if (!req.userId || !req.authenticateId) {
        res.status(401).json({
            status:  'error',
            message: 'Authentication required',
            data:    null,
            others:  {},
        });
        return;
    }
    next();
};

// ─── requireCompanyDB ─────────────────────────────────────────────────────────

/**
 * Hard gate — blocks requests that have no company DB attached.
 * Apply after setCompanyDatabase when the endpoint MUST use a company database.
 *
 * Example: tbl_User_Type lives in the company DB — any route that touches it
 * must be protected by this middleware.
 */
export const requireCompanyDB = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    if (!req.companyDB || !req.currentDBName || req.currentDBName === 'default') {
        res.status(400).json({
            status:  'error',
            message: 'No company selected. Please login and select a company first.',
            data:    null,
            others:  {},
        });
        return;
    }
    next();
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

/** Returns the company DB from the request, or the default connection as fallback. */
export const getDbConnection = (req: Request): Sequelize =>
    req.companyDB ?? getDefaultConnection();

/** Returns true when the request carries a valid company context. */
export const hasCompanyContext = (req: Request): boolean =>
    !!(
        req.currentCompanyId &&
        req.currentCompanyId > 0 &&
        req.currentDBName &&
        req.currentDBName !== 'default'
    );

/** Returns a summary of the current company context. */
export const getCurrentCompanyInfo = (req: Request) => ({
    companyId:         req.currentCompanyId ?? 0,
    dbName:            req.currentDBName    ?? 'default',
    isCompanySelected: hasCompanyContext(req),
});

// ─── ADDED: User context helpers ──────────────────────────────────────────────

/** Returns the current Local_User_ID from the request */
export const getCurrentLocalUserId = (req: Request): number | null =>
    req.localUserId ?? null;

/** Returns the current Global_User_ID from the request */
export const getCurrentGlobalUserId = (req: Request): number | null =>
    req.userId ?? null;

/** Returns complete user context from the request */
export const getUserContext = (req: Request) => ({
    globalUserId:      req.userId ?? null,
    localUserId:       req.localUserId ?? null,
    userName:          req.user?.UserName ?? null,
    userTypeId:        req.user?.UserTypeId ?? null,
    companyId:         req.currentCompanyId ?? 0,
    dbName:            req.currentDBName ?? 'default',
    isAuthenticated:   !!(req.userId && req.authenticateId),
    hasUser:           !!req.user,
    hasCompanyContext: hasCompanyContext(req),
});

/** Check if user has specific role */
export const hasUserRole = (req: Request, roleId: number): boolean => {
    const userTypeId = req.user?.UserTypeId;
    if (userTypeId === undefined || userTypeId === null) return false;
    if (userTypeId === 0) return true; // Super Admin bypass
    return userTypeId === roleId;
};

/** Check if user has any of the allowed roles */
export const hasAnyUserRole = (req: Request, allowedRoles: number[]): boolean => {
    const userTypeId = req.user?.UserTypeId;
    if (userTypeId === undefined || userTypeId === null) return false;
    if (userTypeId === 0) return true; // Super Admin bypass
    return allowedRoles.includes(userTypeId);
};

/** Optional logger middleware — place before routes for request tracing. */
export const logCurrentDatabase = (
    req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    console.log(
        `📊 ${req.method} ${req.path} | DB: ${req.currentDBName ?? 'default'} | GlobalUser: ${req.userId ?? 'anonymous'} | LocalUser: ${req.localUserId ?? 'N/A'}`,
    );
    next();
};