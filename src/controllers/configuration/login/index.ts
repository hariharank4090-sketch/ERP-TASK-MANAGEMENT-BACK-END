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
import { verifyPasswordCombined, hashPassword } from '../../utils/password.utils';

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

        const rawCompanyId = req.body.companyId || req.body.Company_Id || req.body.company_id || req.body.CompanyId;
        const parsedCompanyId = rawCompanyId && !isNaN(parseInt(rawCompanyId.toString(), 10))
            ? parseInt(rawCompanyId.toString(), 10)
            : undefined;

        // ── Step 1: Validate credentials against the first matching user row ──
        const isNumericUsername = /^\d+$/.test(username.toString());
        let whereStr = "(u.UserName = :username";
        if (isNumericUsername) {
            whereStr += " OR u.Global_User_ID = :username";
        }
        whereStr += ") AND u.UDel_Flag = 0";

        const replacements: any = { username };
        if (parsedCompanyId && parsedCompanyId > 0) {
            whereStr += " AND u.Company_Id = :companyId";
            replacements.companyId = parsedCompanyId;
        }

        const [users] = await sequelize.query(`
            SELECT 
                u.Global_User_ID, u.Local_User_ID, u.Company_Id, u.Name,
                u.Password, u.UserTypeId, u.UserName, u.UDel_Flag, u.Autheticate_Id,
                c.Local_Comp_Id, c.Company_Name, c.DB_Name
            FROM tbl_Users u
            LEFT JOIN tbl_Company c ON u.Company_Id = c.Local_Comp_Id
            WHERE ${whereStr}
        `, { replacements }) as any[];

        let user: any = null;
        let passwordValid = false;

        for (const u of users) {
            const isValid = await verifyPasswordCombined(password, u.Password ?? '');
            if (isValid) {
                user = u;
                passwordValid = true;
                break;
            }
        }

        if (!user || !passwordValid) {
            const errMessage = parsedCompanyId
                ? 'Please select correct company'
                : 'Invalid username or password';
            return res.status(401).json({
                status: 'error',
                message: errMessage,
                data: null,
                others: {},
            });
        }

        // ── Step 2: Fetch ALL companies this username has access to ───────────
        // Query using user.UserName to ensure we fetch all companies associated with the resolved username
        const [allUserRows] = await sequelize.query(`
            SELECT 
                u.Global_User_ID, u.Local_User_ID, u.Company_Id, u.Autheticate_Id, u.UserTypeId, u.Password,
                c.Local_Comp_Id, c.Company_Name, c.DB_Name
            FROM tbl_Users u
            LEFT JOIN tbl_Company c ON u.Company_Id = c.Local_Comp_Id
            WHERE u.UserName = :username AND u.UDel_Flag = 0
        `, { replacements: { username: user.UserName } }) as any[];

        // ── Step 3: Generate / reuse one token per company ────────────────────
        const companiesWithTokens: Array<{
            companyId: number;
            companyName: string;
            dbName: string;
            token: string;
            Local_User_ID: number | null;
            Global_User_ID: number | null;
            dbConnected: boolean;
            UserTypeId: number | null;
        }> = [];

        // Run updates in parallel to slash login latency
        const updatePromises = allUserRows.map(async (row) => {
            const rowCompanyId: number | null = row.Company_Id;
            const rowLocalUserId: number | null = row.Local_User_ID;
            const rowUserTypeId: number | null = row.UserTypeId ?? null;
            const envConfig = rowCompanyId ? getCompanyConfig(rowCompanyId) : null;
            const rowCompanyName: string = envConfig?.name || row.Company_Name || '';
            const rowDbName: string = envConfig?.database || row.DB_Name || '';

            if (!rowCompanyId || !rowDbName) return null;

            // Verify if the password matches for this specific company row
            const isRowPasswordValid = await verifyPasswordCombined(password, row.Password ?? '');

            if (!isRowPasswordValid) {
                return null;
            }

            const companyToken: string = getTokenForCompany(row.Global_User_ID, rowCompanyId) 
                || row.Autheticate_Id 
                || generateToken();

            const dbConnected = true;

            storeTokenSession(
                companyToken,
                row.Global_User_ID,
                rowLocalUserId,
                rowCompanyId,
                rowDbName,
                rowCompanyName,
            );

            await UserModel.update(
                { Autheticate_Id: companyToken },
                { 
                    where: { Global_User_ID: row.Global_User_ID, Company_Id: rowCompanyId }
                }
            );

            return {
                companyId:    rowCompanyId,
                companyName:  rowCompanyName,
                dbName:       rowDbName,
                token:        companyToken,
                Local_User_ID: rowLocalUserId,
                Global_User_ID: row.Global_User_ID,
                dbConnected,
                UserTypeId:   rowUserTypeId,
            };
        });

        const results = await Promise.all(updatePromises);
        results.forEach(res => {
            if (res) companiesWithTokens.push(res);
        });

        // ── Step 4: Determine the "current" company for this login ────────────
        let currentEntry = companiesWithTokens.find(c => c.companyId === (parsedCompanyId ?? user.Company_Id));
        if (!currentEntry && companiesWithTokens.length > 0) {
            currentEntry = companiesWithTokens[0];
        }

        if (currentEntry) {
            const currentIndex = companiesWithTokens.indexOf(currentEntry);
            if (currentIndex > 0) {
                companiesWithTokens.splice(currentIndex, 1);
                companiesWithTokens.unshift(currentEntry);
            }
        }

        if (!currentEntry) {
            const fallbackToken = user.Autheticate_Id ?? generateToken();
            storeTokenSession(fallbackToken, user.Global_User_ID, user.Local_User_ID, 0, '', '');
            await UserModel.update(
                { Autheticate_Id: fallbackToken },
                { 
                    where: { Global_User_ID: user.Global_User_ID }
                }
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
                    token:       c.token,
                    UserTypeId:  c.UserTypeId,
                    Local_User_ID: c.Local_User_ID,
                    Global_User_ID: c.Global_User_ID,
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

        const currentUser = await UserModel.findOne({
            attributes: ['UserName'],
            where: { Global_User_ID: currentSession.userId }
        });

        if (!currentUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
                data: null,
                others: {},
            });
        }

        const userAccess = await UserModel.findOne({
            attributes: ['Global_User_ID', 'Local_User_ID', 'UserTypeId'],
            where: {
                UserName: currentUser.UserName,
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
        let companyToken = getTokenForCompany(userAccess.Global_User_ID, companyConfig.id);

        if (!companyToken) {
            companyToken = generateToken();
            storeTokenSession(
                companyToken,
                userAccess.Global_User_ID,
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
                    UserTypeId: userAccess.UserTypeId,
                    Global_User_ID: userAccess.Global_User_ID,
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
            attributes: ['Global_User_ID', 'Local_User_ID', 'Company_Id', 'Autheticate_Id', 'UserTypeId'],
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
                const envConfig = u.Company_Id ? getCompanyConfig(u.Company_Id) : null;
                return {
                    companyId:   u.Company_Id,
                    companyName: envConfig?.name || uData.Company?.Company_Name || '',
                    dbName:      envConfig?.database || uData.Company?.DB_Name || '',
                    token:       u.Autheticate_Id ?? '',    // each company's own token
                    dbConnected: true,
                    UserTypeId:  u.UserTypeId,
                    Local_User_ID: u.Local_User_ID,
                    Global_User_ID: u.Global_User_ID,
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

// ─── changePassword ───────────────────────────────────────────────────────────
/**
 * POST /api/configuration/login/change-password
 *
 * Changes user password in default database (for all associated companies)
 * and optional sync to the company database if req.companyDB is available.
 */
export const changePassword = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'userId, oldPassword, and newPassword are required',
                data: null,
                others: {}
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                status: 'error',
                message: 'New password must be at least 6 characters long',
                data: null,
                others: {}
            });
        }

        const sequelize = getDefaultConnection();
        const UserModel = initUserModel(sequelize);

        // Find the user by Global_User_ID
        const user = await UserModel.unscoped().findOne({
            where: {
                Global_User_ID: parseInt(userId, 10),
                UDel_Flag: 0
            }
        });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
                data: null,
                others: {}
            });
        }

        // Verify old password
        const isPasswordValid = await verifyPasswordCombined(oldPassword, user.Password ?? '');
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Old password is incorrect',
                data: null,
                others: {}
            });
        }

        // Hash the new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update the password for all entries under this UserName in default database
        // Note: The default database's Password column is nvarchar(50), so we store it
        // in plain text to avoid truncation of bcrypt hashes (which are 60 characters).
        // The login controller verifies this field using verifyPasswordCombined, which supports direct comparison.
        await UserModel.update(
            { Password: newPassword },
            {
                where: {
                    Global_User_ID: user.Global_User_ID
                }
            }
        );

        // Optionally sync with the company database
        if (req.companyDB) {
            try {
                await req.companyDB.query(
                    `UPDATE tbl_Users SET Password = :password WHERE UserName = :username`,
                    {
                        replacements: {
                            password: hashedNewPassword,
                            username: user.UserName
                        }
                    }
                );
                console.log(`✅ Synced password update for username ${user.UserName} to company database`);
            } catch (companyDbErr) {
                console.error('⚠️ Failed to sync password to company database:', companyDbErr);
            }
        }

        return res.status(200).json({
            status: 'success',
            message: 'Password changed successfully',
            data: null,
            others: {}
        });

    } catch (err: any) {
        console.error('❌ Change Password error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            data: null,
            others: {
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            }
        });
    }
};