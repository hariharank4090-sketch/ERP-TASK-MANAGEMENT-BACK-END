// src/controllers/configuration/login.controller.ts
import { Request, Response } from 'express';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import JWT_SECRET from '../../../config/jwtSecret';
import {
    getDefaultConnection,
    storeTokenSession,
    getCompanyDatabase,
    getCompanyConfig,
    removeTokenSession,
    verifyTokenSession,
    getTokenForCompany,
    getAllCompanyIds,
    isCompanyConfigured,
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

// ─── Sync user record and Autheticate_Id to Company DB ────────────────────────

export const syncUserAuthToCompanyDb = async (
    companyId: number,
    userRow: any,
    companyToken: string,
): Promise<number | null> => {
    const fallbackLocalId = userRow?.Local_User_ID != null ? Number(userRow.Local_User_ID) : null;
    if (!companyId || !companyToken) return fallbackLocalId;

    try {
        const defaultDb = getDefaultConnection();
        const globalUserId = userRow?.Global_User_ID != null ? Number(userRow.Global_User_ID) : null;
        const userName = String(userRow?.UserName ?? '').trim();
        const name = String(userRow?.Name || userName || 'User').trim();
        const userTypeId = userRow?.UserTypeId != null ? Number(userRow.UserTypeId) : 0;
        const password = String(userRow?.Password ?? '');

        // Ensure no other row in User_Portal shares this exact token
        if (globalUserId !== null) {
            try {
                await defaultDb.query(
                    `UPDATE [dbo].[tbl_Users]
                     SET [Autheticate_Id] = NULL
                     WHERE [Autheticate_Id] = :token
                       AND NOT ([Global_User_ID] = :globalUserId AND [Company_Id] = :companyId)`,
                    {
                        replacements: {
                            token: companyToken,
                            globalUserId,
                            companyId,
                        },
                    },
                );
            } catch {}
        }

        const companyDb = await getCompanyDatabase(companyId);
        if (!companyDb) return fallbackLocalId;

        const [existingRows] = await companyDb.query(
            `SELECT TOP 1 [UserId]
             FROM [dbo].[tbl_Users]
             WHERE (
                 (:globalUserId IS NOT NULL AND [Global_User_ID] = :globalUserId)
                 OR (:userName <> '' AND LOWER(LTRIM(RTRIM([UserName]))) = LOWER(LTRIM(RTRIM(:userName))))
             )
             ORDER BY
                 CASE WHEN :globalUserId IS NOT NULL AND [Global_User_ID] = :globalUserId THEN 0 ELSE 1 END,
                 ISNULL([UDel_Flag], 0) ASC,
                 [UserId] ASC`,
            {
                replacements: {
                    globalUserId,
                    userName,
                },
            },
        ) as any[];

        if (Array.isArray(existingRows) && existingRows.length > 0 && existingRows[0]?.UserId != null) {
            const targetUserId = Number(existingRows[0].UserId);

            await companyDb.query(
                `UPDATE [dbo].[tbl_Users]
                 SET [Autheticate_Id] = NULL
                 WHERE [Autheticate_Id] = :token AND [UserId] <> :targetUserId;

                 UPDATE [dbo].[tbl_Users]
                 SET [Autheticate_Id] = :token,
                     [UDel_Flag] = 0,
                     [Global_User_ID] = COALESCE([Global_User_ID], :globalUserId),
                     [Company_Id] = COALESCE([Company_Id], :companyId),
                     [BranchId] = COALESCE([BranchId], 1),
                     [UserTypeId] = COALESCE(:userTypeId, [UserTypeId])
                 WHERE [UserId] = :targetUserId;`,
                {
                    replacements: {
                        token: companyToken,
                        targetUserId,
                        globalUserId,
                        companyId,
                        userTypeId,
                    },
                },
            );

            return targetUserId;
        }

        // User exists in User_Portal for this company, but is missing from the company DB's tbl_Users
        const [insertedRows] = await companyDb.query(
            `UPDATE [dbo].[tbl_Users]
             SET [Autheticate_Id] = NULL
             WHERE [Autheticate_Id] = :token;

             DECLARE @outUserId INT = NULL;
             DECLARE @safePwd NVARCHAR(255) = LEFT(
                 ISNULL(:password, ''),
                 CASE
                     WHEN COL_LENGTH('dbo.tbl_Users', 'Password') IS NOT NULL AND COL_LENGTH('dbo.tbl_Users', 'Password') > 0
                     THEN COL_LENGTH('dbo.tbl_Users', 'Password') / 2
                     ELSE 50
                 END
             );

             IF COLUMNPROPERTY(OBJECT_ID('dbo.tbl_Users'), 'UserId', 'IsIdentity') = 1
             BEGIN
                 INSERT INTO [dbo].[tbl_Users] (
                     [Global_User_ID], [UserTypeId], [Name], [UserName], [Password],
                     [Company_Id], [BranchId], [UDel_Flag], [Autheticate_Id]
                 )
                 VALUES (
                     :globalUserId, :userTypeId, :name, :userName, @safePwd,
                     :companyId, 1, 0, :token
                 );
                 SET @outUserId = CAST(SCOPE_IDENTITY() AS INT);
             END
             ELSE
             BEGIN
                 SET @outUserId = ISNULL(:localUserId, 0);
                 IF @outUserId <= 0 OR EXISTS (SELECT 1 FROM [dbo].[tbl_Users] WHERE [UserId] = @outUserId)
                 BEGIN
                     SELECT @outUserId = ISNULL(MAX([UserId]), 0) + 1 FROM [dbo].[tbl_Users];
                 END
                 INSERT INTO [dbo].[tbl_Users] (
                     [UserId], [Global_User_ID], [UserTypeId], [Name], [UserName], [Password],
                     [Company_Id], [BranchId], [UDel_Flag], [Autheticate_Id]
                 )
                 VALUES (
                     @outUserId, :globalUserId, :userTypeId, :name, :userName, @safePwd,
                     :companyId, 1, 0, :token
                 );
             END

             SELECT @outUserId AS UserId;`,
            {
                replacements: {
                    token: companyToken,
                    password,
                    globalUserId,
                    userTypeId,
                    name,
                    userName,
                    companyId,
                    localUserId: fallbackLocalId,
                },
            },
        ) as any[];

        const createdUserId =
            Array.isArray(insertedRows) && insertedRows.length > 0 && insertedRows[0]?.UserId != null
                ? Number(insertedRows[0].UserId)
                : fallbackLocalId;

        if (createdUserId && !fallbackLocalId && globalUserId !== null) {
            try {
                await defaultDb.query(
                    `UPDATE [dbo].[tbl_Users]
                     SET [Local_User_ID] = :createdUserId
                     WHERE [Global_User_ID] = :globalUserId AND [Company_Id] = :companyId AND [Local_User_ID] IS NULL`,
                    {
                        replacements: {
                            createdUserId,
                            globalUserId,
                            companyId,
                        },
                    },
                );
            } catch {}
        }

        return createdUserId;
    } catch (syncErr) {
        console.warn(`⚠️ Failed to sync user auth to company ${companyId} DB:`, syncErr);
        return fallbackLocalId;
    }
};

// ─── AES Decryption Helper for Hidden Network Payloads ───────────────────────

const tryDecryptText = (val: any): string => {
    if (!val || typeof val !== 'string') return val;
    const keys = [process.env.passwordKey, JWT_SECRET].filter(Boolean) as string[];
    for (const key of keys) {
        try {
            const bytes = CryptoJS.AES.decrypt(val, key);
            const dec = bytes.toString(CryptoJS.enc.Utf8);
            if (dec && dec.length > 0) return dec;
        } catch {}
    }
    return val;
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
        let body = req.body || {};

        // Support encrypted payload envelope: { payload: "..." } or { data: "..." }
        if (!body.username && !body.password && (body.payload || body.data || typeof body === 'string')) {
            const rawCipher = body.payload || body.data || body;
            const decryptedRaw = tryDecryptText(rawCipher);
            if (decryptedRaw && typeof decryptedRaw === 'string') {
                try {
                    body = JSON.parse(decryptedRaw);
                } catch {}
            }
        }

        let username = body.username ?? body.UserName ?? body.user;
        let password = body.password ?? body.Password;

        // Automatically decrypt username and password if sent encrypted from frontend
        username = tryDecryptText(username);
        password = tryDecryptText(password);

        if (!username || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Username and password are required',
                data: null,
                others: {},
            });
        }

        const configuredCompanyIds = getAllCompanyIds();
        if (configuredCompanyIds.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'No company configurations loaded',
                data: null,
                others: {},
            });
        }

        const rawCompanyId = req.body.companyId || req.body.Company_Id || req.body.company_id || req.body.CompanyId;
        const parsedCompanyId = rawCompanyId && !isNaN(parseInt(rawCompanyId.toString(), 10))
            ? parseInt(rawCompanyId.toString(), 10)
            : undefined;

        // If a specific company was requested, verify it is present in companies.json
        if (parsedCompanyId !== undefined && !isCompanyConfigured(parsedCompanyId)) {
            return res.status(401).json({
                status: 'error',
                message: 'Please select correct company',
                data: null,
                others: {},
            });
        }

        const sequelize = getDefaultConnection();
        const UserModel = initUserModel(sequelize);
        const CompanyModel = initCompanyModel(sequelize);

        if (!UserModel.associations.Company) {
            UserModel.belongsTo(CompanyModel, {
                foreignKey: 'Company_Id',
                targetKey: 'Local_Comp_Id',
                as: 'Company',
            });
        }

        // ── Step 1: Validate credentials against the first matching user row in configured companies ──
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
        } else {
            whereStr += " AND u.Company_Id IN (:configuredCompanyIds)";
            replacements.configuredCompanyIds = configuredCompanyIds;
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

        // ── Step 2: Fetch ALL companies this username has access to (configured only) ───────────
        const [allUserRows] = await sequelize.query(`
            SELECT 
                u.Global_User_ID, u.Local_User_ID, u.Company_Id, u.Autheticate_Id, u.UserTypeId, u.Password,
                u.Name, u.UserName,
                c.Local_Comp_Id, c.Company_Name, c.DB_Name
            FROM tbl_Users u
            LEFT JOIN tbl_Company c ON u.Company_Id = c.Local_Comp_Id
            WHERE u.UserName = :username AND u.UDel_Flag = 0 AND u.Company_Id IN (:configuredCompanyIds)
        `, { replacements: { username: user.UserName, configuredCompanyIds } }) as any[];

        // ── Step 3: Generate / reuse one token per configured company ────────────────────
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

        const usedTokens = new Set<string>();
        const assignedTokens = allUserRows.map((row) => {
            const rowCompanyId: number | null = row.Company_Id;
            if (!rowCompanyId) return '';
            let tok: string =
                getTokenForCompany(row.Global_User_ID, rowCompanyId) ||
                row.Autheticate_Id ||
                generateToken();
            if (!tok || usedTokens.has(tok)) {
                tok = generateToken();
            }
            usedTokens.add(tok);
            return tok;
        });

        // Run updates in parallel to slash login latency
        const updatePromises = allUserRows.map(async (row, idx) => {
            const rowCompanyId: number | null = row.Company_Id;
            let rowLocalUserId: number | null = row.Local_User_ID;
            const rowUserTypeId: number | null = row.UserTypeId ?? null;
            const envConfig = rowCompanyId ? getCompanyConfig(rowCompanyId) : null;

            // Strictly require company to be configured in companies.json
            if (!rowCompanyId || !envConfig) return null;

            const rowCompanyName: string = envConfig.name;
            const rowDbName: string = envConfig.database;

            // Verify if the password matches for this specific company row
            const isRowPasswordValid = await verifyPasswordCombined(password, row.Password ?? '');

            if (!isRowPasswordValid) {
                return null;
            }

            const companyToken: string = assignedTokens[idx] || generateToken();

            const dbConnected = true;

            await UserModel.update(
                { Autheticate_Id: companyToken },
                { 
                    where: { Global_User_ID: row.Global_User_ID, Company_Id: rowCompanyId }
                }
            );

            const syncedLocalUserId = await syncUserAuthToCompanyDb(
                rowCompanyId,
                {
                    ...row,
                    Name: row.Name ?? user.Name,
                    UserName: row.UserName ?? user.UserName,
                },
                companyToken,
            );
            if (syncedLocalUserId !== null) {
                rowLocalUserId = syncedLocalUserId;
            }

            storeTokenSession(
                companyToken,
                row.Global_User_ID,
                rowLocalUserId,
                rowCompanyId,
                rowDbName,
                rowCompanyName,
                row,
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

        // ── Step 4: Ensure at least one configured company is available ────────────
        if (companiesWithTokens.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: parsedCompanyId ? 'Please select correct company' : 'Invalid username or password',
                data: null,
                others: {},
            });
        }

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

        // ── Step 5: Build response ─────────────────────────────────────────────
        const companyList = companiesWithTokens.map(c => ({
            companyId:   c.companyId,
            companyName: c.companyName,
            dbName:      c.dbName,
            dbConnected: c.dbConnected,
            token:       c.token,
            UserTypeId:  c.UserTypeId,
            Local_User_ID: c.Local_User_ID,
            Global_User_ID: c.Global_User_ID,
        }));

        const encryptedCompany = CryptoJS.AES.encrypt(
            JSON.stringify(companyList),
            JWT_SECRET
        ).toString();

        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    Global_User_ID: currentEntry?.Global_User_ID ?? user.Global_User_ID,
                    Local_User_ID: currentEntry?.Local_User_ID ?? user.Local_User_ID,
                    Name: user.Name,
                    UserName: user.UserName,
                    UserTypeId: currentEntry?.UserTypeId ?? user.UserTypeId,
                },
                currentCompany: encryptedCompany,
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
            attributes: ['Global_User_ID', 'Local_User_ID', 'UserTypeId', 'Name', 'UserName', 'Password', 'Autheticate_Id', 'Company_Id'],
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
        let companyToken =
            getTokenForCompany(userAccess.Global_User_ID, companyConfig.id) ||
            userAccess.Autheticate_Id ||
            generateToken();

        if (!companyToken || companyToken === currentToken) {
            companyToken = generateToken();
        }

        await UserModel.update(
            { Autheticate_Id: companyToken },
            { where: { Global_User_ID: userAccess.Global_User_ID, Company_Id: companyConfig.id } },
        );

        const syncedLocalId = await syncUserAuthToCompanyDb(companyConfig.id, userAccess, companyToken);
        const resolvedLocalUserId = syncedLocalId ?? userAccess.Local_User_ID;

        storeTokenSession(
            companyToken,
            userAccess.Global_User_ID,
            resolvedLocalUserId,
            companyConfig.id,
            companyConfig.database,
            companyConfig.name,
            userAccess,
        );

        // Pre-connect
        let dbConnected = false;
        try {
            const connection = await getCompanyDatabase(companyConfig.id);
            if (connection) dbConnected = true;
        } catch {
        }

        return res.status(200).json({
            status: 'success',
            message: 'Company switched successfully',
            data: {
                token: companyToken,
                user: {
                    Local_User_ID: resolvedLocalUserId,
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

        const configuredCompanyIds = getAllCompanyIds();
        const userCompanies = await UserModel.unscoped().findAll({
            attributes: ['Global_User_ID', 'Local_User_ID', 'Company_Id', 'Autheticate_Id', 'UserTypeId', 'Name', 'UserName', 'Password'],
            include: [{
                model: CompanyModel,
                attributes: ['Local_Comp_Id', 'Company_Name', 'DB_Name'],
                as: 'Company',
            }],
            where: {
                UserName: user.UserName,
                UDel_Flag: 0,
                Company_Id: configuredCompanyIds,
            },
        });

        const usedVerifyTokens = new Set<string>([token]);
        const currentCompanyRaw = await Promise.all(
            userCompanies.map(async (u) => {
                const compId = u.Company_Id;
                const envConfig = compId ? getCompanyConfig(compId) : null;
                if (!compId || !envConfig) return null;

                let compToken =
                    compId === session.companyId
                        ? token
                        : getTokenForCompany(u.Global_User_ID, compId) || u.Autheticate_Id || '';

                if (!compToken || (compId !== session.companyId && usedVerifyTokens.has(compToken))) {
                    compToken = generateToken();
                }
                usedVerifyTokens.add(compToken);

                if (u.Autheticate_Id !== compToken) {
                    await UserModel.update(
                        { Autheticate_Id: compToken },
                        { where: { Global_User_ID: u.Global_User_ID, Company_Id: compId } },
                    );
                }

                const syncedLocalId = await syncUserAuthToCompanyDb(
                    compId,
                    {
                        Global_User_ID: u.Global_User_ID,
                        Local_User_ID: u.Local_User_ID,
                        UserTypeId: u.UserTypeId,
                        Name: u.Name ?? user.Name,
                        UserName: u.UserName ?? user.UserName,
                        Password: (u as any).Password ?? '',
                    },
                    compToken,
                );

                const resolvedLocalId = syncedLocalId ?? u.Local_User_ID;

                storeTokenSession(
                    compToken,
                    u.Global_User_ID,
                    resolvedLocalId,
                    compId,
                    envConfig.database,
                    envConfig.name,
                    u,
                );

                return {
                    companyId:      compId,
                    companyName:    envConfig.name,
                    dbName:         envConfig.database,
                    token:          compToken,
                    dbConnected:    true,
                    UserTypeId:     u.UserTypeId,
                    Local_User_ID:  resolvedLocalId,
                    Global_User_ID: u.Global_User_ID,
                };
            }),
        );

        // Build currentCompany as array — only companies configured in companies.json
        const currentCompany = currentCompanyRaw.filter((c): c is NonNullable<typeof c> => c !== null);

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
        let { userId, oldPassword, newPassword } = req.body;
        oldPassword = tryDecryptText(oldPassword);
        newPassword = tryDecryptText(newPassword);

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

        // Ensure Password column supports at least 255 chars for bcrypt hash
        try {
            await sequelize.query(`ALTER TABLE tbl_Users ALTER COLUMN Password NVARCHAR(255)`);
        } catch {
            // Column may already be NVARCHAR(255)
        }

        // Update the password for all entries under this UserName in default database
        await UserModel.update(
            { Password: hashedNewPassword },
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