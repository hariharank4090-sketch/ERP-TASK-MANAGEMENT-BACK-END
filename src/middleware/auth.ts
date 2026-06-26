import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize';
import {
    getDefaultConnection,
    verifyTokenSession,
    getUserDatabaseConnectionFromToken,
    storeTokenSession,
    getCompanyConfig,
} from '../config/database.config';
import { initUserModel, UserMaster } from '../models/masters/users/users.model';

// ─── Extend Express Request ───────────────────────────────────────────────────

declare global {
    namespace Express {
        interface Request {
            user?:             UserMaster | null;
            userId?:           number;
            localUserId?:      number | null; // ADDED: Local_User_ID field
            authenticateId?:   string;
            currentDBName?:    string;
            currentCompanyId?: number;
            companyDB?:        Sequelize;
        }
    }
}

// ─── Token extractor ──────────────────────────────────────────────────────────

const extractToken = (req: Request): string | null => {
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
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const token = extractToken(req);

        if (!token) {
            res.status(401).json({
                status:  'error',
                message: 'No token provided',
                data:    null,
                others:  {},
            });
            return;
        }

        req.authenticateId = token;

        const UserModel = initUserModel(getDefaultConnection());

        // ── Fast path: session in memory ──────────────────────────────────────
        const session = verifyTokenSession(token);

        if (session) {
            // Always fetch full user row so UserTypeId is never stale/missing
            const user = await UserModel.unscoped().findOne({
                attributes: ['Global_User_ID', 'Local_User_ID', 'UserName', 'UserTypeId', 'Name', 'Company_Id', 'UDel_Flag', 'Autheticate_Id'], // ADDED: Local_User_ID
                where: { Global_User_ID: session.userId, UDel_Flag: 0 },
            });

            if (!user) {
                res.status(401).json({
                    status:  'error',
                    message: 'User not found or has been deactivated',
                    data:    null,
                    others:  {},
                });
                return;
            }

            req.user             = user;
            req.userId           = session.userId;
            req.localUserId      = session.localUserId || user.Local_User_ID; // ADDED: Get localUserId from session or user
            req.currentDBName    = session.dbName;
            req.currentCompanyId = session.companyId;

            try {
                req.companyDB = await getUserDatabaseConnectionFromToken(token);
            } catch {
                req.companyDB = getDefaultConnection();
            }

            console.log(
                `✅ Auth (cache) — user: ${user.Global_User_ID} | Global_User_ID: ${user.Global_User_ID} | Local_User_ID: ${req.localUserId || 'N/A'} | UserTypeId: ${user.UserTypeId} | DB: ${session.dbName}`,
            );
            next();
            return;
        }

        // ── Slow path: token not in cache — look up in DB ─────────────────────
        console.log('🔍 Token not in cache — checking database...');

        const user = await UserModel.unscoped().findOne({
            attributes: ['Global_User_ID', 'Local_User_ID', 'UserName', 'UserTypeId', 'Name', 'Company_Id', 'UDel_Flag', 'Autheticate_Id'], // ADDED: Local_User_ID
            where: { Autheticate_Id: token, UDel_Flag: 0 },
        });

        if (!user) {
            res.status(401).json({
                status:  'error',
                message: 'Invalid or expired token',
                data:    null,
                others:  {},
            });
            return;
        }

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

        // UPDATED: Store token session with localUserId
        storeTokenSession(token, user.Global_User_ID, localUserId, companyId, dbName, companyName);

        req.user             = user;
        req.userId           = user.Global_User_ID;
        req.localUserId      = localUserId; // ADDED: Set localUserId
        req.currentDBName    = dbName || 'default';
        req.currentCompanyId = companyId;

        if (dbName && dbName !== 'default') {
            try {
                req.companyDB = await getUserDatabaseConnectionFromToken(token);
            } catch {
                req.companyDB = getDefaultConnection();
            }
        } else {
            req.companyDB = getDefaultConnection();
        }

        console.log(
            `✅ Auth (db) — user: ${user.Global_User_ID} | Global_User_ID: ${user.Global_User_ID} | Local_User_ID: ${localUserId || 'N/A'} | UserTypeId: ${user.UserTypeId} | DB: ${dbName || 'default'}`,
        );
        next();

    } catch (err) {
        console.error('❌ authenticate error:', err);
        res.status(500).json({
            status:  'error',
            message: 'Server error during authentication',
            data:    null,
            others:  {},
        });
    }
};

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
export const authorize = (allowedRoles: number[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const user = req.user;

            // Guard: authenticate must run before authorize
            if (!user) {
                res.status(401).json({
                    status:  'error',
                    message: 'Authentication required',
                    data:    null,
                    others:  {},
                });
                return;
            }

            // Safely parse UserTypeId — null/undefined means no role assigned
            const userTypeId: number | null =
                user.UserTypeId !== null && user.UserTypeId !== undefined
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
                    status:  'error',
                    message: 'Access denied — no role assigned to this user',
                    data:    null,
                    others:  { userTypeId: null, allowedRoles },
                });
                return;
            }

            // ── Normal role check ─────────────────────────────────────────────
            if (!allowedRoles.includes(userTypeId)) {
                console.warn(
                    `🚫 Unauthorized — user: ${user.UserName} | Global_User_ID: ${user.Global_User_ID} | Local_User_ID: ${req.localUserId || 'N/A'} | UserTypeId: ${userTypeId} | allowedRoles: [${allowedRoles}]`,
                );
                res.status(403).json({
                    status:  'error',
                    message: 'Access denied — you do not have permission for this action',
                    data:    null,
                    others:  { yourRole: userTypeId, allowedRoles },
                });
                return;
            }

            console.log(`✅ Authorized — user: ${user.UserName} | Global_User_ID: ${user.Global_User_ID} | Local_User_ID: ${req.localUserId || 'N/A'} | UserTypeId: ${userTypeId}`);
            next();

        } catch (err) {
            console.error('❌ authorize error:', err);
            res.status(500).json({
                status:  'error',
                message: 'Server error during authorization',
                data:    null,
                others:  {},
            });
        }
    };
};

// ─── Helper Functions (ADDED) ─────────────────────────────────────────────────

/**
 * Get current Local_User_ID from request
 */
export const getCurrentLocalUserId = (req: Request): number | null => {
    return req.localUserId || null;
};

/**
 * Get current Global_User_ID from request
 */
export const getCurrentGlobalUserId = (req: Request): number | null => {
    return req.userId || null;
};

/**
 * Get complete user context from request
 */
export const getUserContext = (req: Request) => {
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

/**
 * Check if user is Super Admin (UserTypeId = 0)
 */
export const isSuperAdmin = (req: Request): boolean => {
    return req.user?.UserTypeId === 0;
};

/**
 * Check if user has specific role
 */
export const hasRole = (req: Request, roleId: number): boolean => {
    return req.user?.UserTypeId === roleId;
};

/**
 * Check if user has any of the allowed roles
 */
export const hasAnyRole = (req: Request, allowedRoles: number[]): boolean => {
    const userTypeId = req.user?.UserTypeId;
    if (userTypeId === undefined || userTypeId === null) return false;
    if (userTypeId === 0) return true; // Super Admin bypass
    return allowedRoles.includes(userTypeId);
};