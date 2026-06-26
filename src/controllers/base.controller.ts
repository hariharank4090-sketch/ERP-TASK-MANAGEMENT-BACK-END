// src/controllers/base.controller.ts
import { Request } from 'express';
import { Sequelize } from 'sequelize';
import { getDefaultConnection } from '../config/database.config';

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
export const getDbConnection = (req: Request): Sequelize => {
    if (req.companyDB && req.currentDBName && req.currentDBName !== 'default') {
        console.log(`📊 Controller using company DB: ${req.currentDBName}`);
        return req.companyDB;
    }
    console.log(`📊 Controller using default DB (User_Portal)`);
    return getDefaultConnection();
};

/** Convenience: name of the active database */
export const getCurrentDatabaseName = (req: Request): string =>
    req.currentDBName || 'default';

/** Convenience: authenticated user id */
export const getUserId = (req: Request): number | null =>
    req.userId ?? null;

/** Convenience: raw token */
export const getAuthenticateId = (req: Request): string | null =>
    req.authenticateId ?? null;

/** Convenience: company id */
export const getCompanyId = (req: Request): number | null =>
    req.currentCompanyId ?? null;

/** True when the user is fully authenticated and a company DB is active */
export const isAuthenticated = (req: Request): boolean =>
    !!(req.userId && req.authenticateId);

export const hasCompanyDB = (req: Request): boolean =>
    !!(req.companyDB && req.currentDBName && req.currentDBName !== 'default');