// src/controllers/configuration/login.controller.ts
import { Request, Response } from 'express';
import crypto from 'crypto';
import {
    getDefaultConnection,
    storeTokenSession,
    getCompanyDatabase,
    getCompanyConfig,
    removeTokenSession,
    verifyTokenSession,
    getTokenForCompany,
} from '../../../config/database.config';
import { initUserModel } from '../../../models/masters/users/users.model';
import { initCompanyModel } from '../../../models/masters/company/company.model';
import { verifyPasswordCombined } from '../../utils/password.utils';

// ─── Token generator ──────────────────────────────────────────────────────────

const generateToken = (): string => {
    const ts = Date.now().toString(36);
    const random = crypto.randomBytes(20).toString('hex');
    return `${ts}${random}`.substring(0, 48);
};

// ─── login ────────────────────────────────────────────────────────────────────
/**
 * POST /api/configuration/login
 *
 * Returns one token per available company so the frontend can connect to any
 * company directly without calling switch-company first.
 *
 * Response shape:
 * {
 *   user: { Global_User_ID, Local_User_ID, Name, UserName, UserTypeId },
 *   currentCompany: { companyId, companyName, dbName, dbConnected, token },
 *   availableCompanies: [
 *     { companyId, companyName, dbName, token, Local_User_ID }
 *   ],
 *   token: "<primary token for currentCompany>",
 *   serverTime
 * }
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { username, password, companyId } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Username and password are required',
                data: null,
                others: {},
            });
        }

        console.log('🔐 Login attempt:', username);

        const sequelize = getDefaultConnection();
        const UserModel = initUserModel(sequelize);
        const CompanyModel = initCompanyModel(sequelize);

        UserModel.belongsTo(CompanyModel, {
            foreignKey: 'Company_Id',
            targetKey: 'Local_Comp_Id',
            as: 'Company',
        });

        // ── Step 1: Validate credentials against the first matching user row ──
        const whereClause: any = { UserName: username, UDel_Flag: 0 };
        if (companyId && companyId > 0) {
            whereClause.Company_Id = companyId;
        }

        const user = await UserModel.unscoped().findOne({
            attributes: [
                'Global_User_ID', 'Local_User_ID', 'Company_Id', 'Name',
                'Password', 'UserTypeId', 'UserName', 'UDel_Flag', 'Autheticate_Id',
            ],
            include: [{
                model: CompanyModel,
                attributes: ['Local_Comp_Id', 'Company_Name', 'DB_Name'],
                required: false,
                as: 'Company',
            }],
            where: whereClause,
        });

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username or password',
                data: null,
                others: {},
            });
        }

        const passwordValid = await verifyPasswordCombined(password, user.Password ?? '');
        if (!passwordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username or password',
                data: null,
                others: {},
            });
        }

        // ── Step 2: Fetch ALL companies this username has access to ───────────
        const allUserRows = await UserModel.unscoped().findAll({
            attributes: ['Global_User_ID', 'Local_User_ID', 'Company_Id', 'Autheticate_Id', 'UserTypeId'],
            include: [{
                model: CompanyModel,
                attributes: ['Local_Comp_Id', 'Company_Name', 'DB_Name'],
                as: 'Company',
            }],
            where: { UserName: username, UDel_Flag: 0 },
        });

        // ── Step 3: Generate / reuse one token per company ────────────────────
        const companiesWithTokens: Array<{
            companyId: number;
            companyName: string;
            dbName: string;
            token: string;
            Local_User_ID: number | null;
            dbConnected: boolean;
            UserTypeId: number | null;  // per-company role for this user
        }> = [];

        for (const row of allUserRows) {
            const rowData = row.get({ plain: true }) as any;
            const rowCompanyId: number | null = row.Company_Id;
            const rowLocalUserId: number | null = row.Local_User_ID;
            const rowUserTypeId: number | null = row.UserTypeId ?? null;  // per-company role
            const rowCompanyName: string = rowData.Company?.Company_Name ?? '';
            const rowDbName: string = rowData.Company?.DB_Name ?? '';

            if (!rowCompanyId || !rowDbName) continue;

            // Reuse existing token stored against this user+company pair, or generate a new one
            let companyToken = getTokenForCompany(user.Global_User_ID, rowCompanyId);

            if (!companyToken) {
                // Also check if the DB row already has a token for this row's Global_User_ID
                // (same user may have different Global_User_ID per company in some schemas)
                companyToken = row.Autheticate_Id ?? generateToken();
            }

            // Pre-connect (best effort)
            let dbConnected = false;
            try {
                const conn = await getCompanyDatabase(rowDbName);
                if (conn) dbConnected = true;
            } catch {
                console.log(`⚠️ Could not pre-connect to ${rowDbName}`);
            }

            // Store / refresh the session for this company
            storeTokenSession(
                companyToken,
                user.Global_User_ID,
                rowLocalUserId,
                rowCompanyId,
                rowDbName,
                rowCompanyName,
            );

            // Persist token back to tbl_Users for this row so the slow-path
            // (token-not-in-cache lookup) also works after a server restart
            await UserModel.update(
                { Autheticate_Id: companyToken },
                { where: { Global_User_ID: row.Global_User_ID, Company_Id: rowCompanyId } },
            );

            companiesWithTokens.push({
                companyId:    rowCompanyId,
                companyName:  rowCompanyName,
                dbName:       rowDbName,
                token:        companyToken,
                Local_User_ID: rowLocalUserId,
                dbConnected,
                UserTypeId:   rowUserTypeId,  // per-company role
            });
        }

        // ── Step 4: Determine the "current" company for this login ────────────
        // Priority: explicit companyId param → first row's company → user.Company_Id
        let currentEntry = companiesWithTokens.find(c => c.companyId === (companyId ?? user.Company_Id));
        if (!currentEntry && companiesWithTokens.length > 0) {
            currentEntry = companiesWithTokens[0];
        }

        // Fall-back when user has no company rows at all (edge case)
        if (!currentEntry) {
            const fallbackToken = user.Autheticate_Id ?? generateToken();
            storeTokenSession(fallbackToken, user.Global_User_ID, user.Local_User_ID, 0, '', '');
            await UserModel.update(
                { Autheticate_Id: fallbackToken },
                { where: { Global_User_ID: user.Global_User_ID } },
            );

            return res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: {
                    user: {
                        Global_User_ID: user.Global_User_ID,
                        Local_User_ID: user.Local_User_ID,
                        Name: user.Name,
                        UserName: user.UserName,
                        UserTypeId: user.UserTypeId,
                    },
                    currentCompany: [],
                    serverTime: new Date().toISOString(),
                },
                others: {},
            });
        }

        // ── Step 5: Build response ─────────────────────────────────────────────
        // currentCompany is an ARRAY — one entry per company the user belongs to,
        // each carrying its own token. The frontend picks the right entry by
        // companyId and uses that token as the Bearer for subsequent requests.
        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    Global_User_ID: user.Global_User_ID,
                    Local_User_ID: user.Local_User_ID,
                    Name: user.Name,
                    UserName: user.UserName,
                    UserTypeId: user.UserTypeId,
                },
                currentCompany: companiesWithTokens.map(c => ({
                    companyId:   c.companyId,
                    companyName: c.companyName,
                    dbName:      c.dbName,
                    dbConnected: c.dbConnected,
                    token:       c.token,           // ← company-specific token
                    UserTypeId:  c.UserTypeId,      // ← per-company role
                })),
                serverTime: new Date().toISOString(),
            },
            others: {},
        });

    } catch (err) {
        console.error('❌ Login error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            data: null,
            others: {},
        });
    }
};

// ─── switchCompany ────────────────────────────────────────────────────────────
/**
 * POST /api/configuration/login/switch-company
 *
 * Still supported for clients that prefer the switch-company flow.
 * Returns the pre-generated token for the requested company (already stored
 * in the session map from login), so no new token is generated unnecessarily.
 */
export const switchCompany = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { targetCompanyId } = req.body;
        const currentToken = req.authenticateId;

        if (!currentToken) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required',
                data: null,
                others: {},
            });
        }

        if (!targetCompanyId) {
            return res.status(400).json({
                status: 'error',
                message: 'targetCompanyId is required',
                data: null,
                others: {},
            });
        }

        const companyConfig = getCompanyConfig(parseInt(targetCompanyId));
        if (!companyConfig) {
            return res.status(404).json({
                status: 'error',
                message: 'Company configuration not found',
                data: null,
                others: {},
            });
        }

        const currentSession = verifyTokenSession(currentToken);
        if (!currentSession) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid session',
                data: null,
                others: {},
            });
        }

        const sequelize = getDefaultConnection();
        const UserModel = initUserModel(sequelize);

        const userAccess = await UserModel.findOne({
            attributes: ['Global_User_ID', 'Local_User_ID'],
            where: {
                Global_User_ID: currentSession.userId,
                Company_Id: companyConfig.id,
                UDel_Flag: 0,
            },
        });

        if (!userAccess) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have access to this company',
                data: null,
                others: {},
            });
        }

        // Reuse the token already stored for this user+company if available
        let companyToken = getTokenForCompany(currentSession.userId, companyConfig.id);

        if (!companyToken) {
            companyToken = generateToken();
            storeTokenSession(
                companyToken,
                currentSession.userId,
                userAccess.Local_User_ID,
                companyConfig.id,
                companyConfig.database,
                companyConfig.name,
            );

            await UserModel.update(
                { Autheticate_Id: companyToken },
                { where: { Global_User_ID: userAccess.Global_User_ID, Company_Id: companyConfig.id } },
            );
        }

        // Pre-connect
        let dbConnected = false;
        try {
            const connection = await getCompanyDatabase(companyConfig.id);
            if (connection) dbConnected = true;
        } catch {
            console.log(`⚠️ Could not connect to ${companyConfig.name}, will retry on first use`);
        }

        return res.status(200).json({
            status: 'success',
            message: 'Company switched successfully',
            data: {
                token: companyToken,
                user: {
                    Local_User_ID: userAccess.Local_User_ID,
                },
                company: {
                    companyId: companyConfig.id,
                    companyName: companyConfig.name,
                    dbName: companyConfig.database,
                    dbConnected,
                },
                serverTime: new Date().toISOString(),
            },
            others: {},
        });

    } catch (err) {
        console.error('❌ switchCompany error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            data: null,
            others: {},
        });
    }
};

// ─── logout ───────────────────────────────────────────────────────────────────

export const logout = async (req: Request, res: Response): Promise<Response> => {
    try {
        const token = req.authenticateId;

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required',
                data: null,
                others: {},
            });
        }

        const sequelize = getDefaultConnection();
        const UserModel = initUserModel(sequelize);

        await UserModel.update(
            { Autheticate_Id: null },
            { where: { Autheticate_Id: token } },
        );

        removeTokenSession(token);

        return res.status(200).json({
            status: 'success',
            message: 'Logout successful',
            data: null,
            others: {},
        });

    } catch (err) {
        console.error('❌ Logout error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            data: null,
            others: {},
        });
    }
};

// ─── verifyToken ──────────────────────────────────────────────────────────────

export const verifyToken = async (req: Request, res: Response): Promise<Response> => {
    try {
        const token = req.authenticateId;

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No token provided',
                data: null,
                others: {},
            });
        }

        const session = verifyTokenSession(token);

        if (!session) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid or expired token',
                data: null,
                others: {},
            });
        }

        const sequelize = getDefaultConnection();
        const UserModel = initUserModel(sequelize);
        const CompanyModel = initCompanyModel(sequelize);

        const user = await UserModel.unscoped().findOne({
            attributes: ['Global_User_ID', 'Local_User_ID', 'Name', 'UserName', 'UserTypeId'],
            where: { Autheticate_Id: token, UDel_Flag: 0 },
        });

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found',
                data: null,
                others: {},
            });
        }

        UserModel.belongsTo(CompanyModel, {
            foreignKey: 'Company_Id',
            targetKey: 'Local_Comp_Id',
            as: 'Company',
        });

        const userCompanies = await UserModel.unscoped().findAll({
            attributes: ['Global_User_ID', 'Local_User_ID', 'Company_Id', 'Autheticate_Id'],
            include: [{
                model: CompanyModel,
                attributes: ['Local_Comp_Id', 'Company_Name', 'DB_Name'],
                as: 'Company',
            }],
            where: { UserName: user.UserName, UDel_Flag: 0 },
        });

        // Build currentCompany as array — same shape as login response
        const currentCompany = userCompanies
            .map(u => {
                const uData = u.get({ plain: true }) as any;
                return {
                    companyId:   u.Company_Id,
                    companyName: uData.Company?.Company_Name ?? '',
                    dbName:      uData.Company?.DB_Name ?? '',
                    token:       u.Autheticate_Id ?? '',    // each company's own token
                    dbConnected: true,
                };
            })
            .filter(c => c.companyId);

        return res.status(200).json({
            status: 'success',
            message: 'Token is valid',
            data: {
                user: {
                    Global_User_ID: user.Global_User_ID,
                    Local_User_ID:  session.localUserId ?? user.Local_User_ID,
                    Name:           user.Name,
                    UserName:       user.UserName,
                    UserTypeId:     user.UserTypeId,
                },
                currentCompany,             // array, same shape as login
                serverTime: new Date().toISOString(),
            },
            others: {},
        });

    } catch (err) {
        console.error('❌ Verify token error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            data: null,
            others: {},
        });
    }
};