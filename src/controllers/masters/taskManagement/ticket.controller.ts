import { Request, Response } from 'express';
import sql from 'mssql';
import {
    getCompanySqlConnection,
    getDefaultSqlConnection,
    verifyTokenSession
} from '../../../config/database.config';
import { invalidInput, failed, success, dataFound, servError } from '../../../responseObject';
import { invalidateScheduleCache } from './projectScedule.controller';

const TICKET_TABLE = '[dbo].[tbl_Ticket_Gen_Info]';
const ALLOCATION_TABLE = '[dbo].[tbl_Ticket_Alloctation]';
const ALLOCATION_EMP_TABLE = '[dbo].[tbl_Ticket_Alloctation_Employees]';
const REFERENCE_TABLE = '[dbo].[tbl_Ticket_Reference]';
const TRANSACTION_TABLE = '[dbo].[tbl_Ticket_Transaction]';
const PROJECT_TICKET_TABLE = '[dbo].[tbl_Project_Ticket]';

const toBigIntValue = (val: any): bigint | null => {
    if (val === undefined || val === null) return null;
    if (typeof val === 'bigint') return val;
    const str = String(val).trim();
    if (!str || !/^-?\d+$/.test(str)) return null;
    try {
        return BigInt(str);
    } catch {
        return null;
    }
};

const fallbackCompanyPools = new Map<string, sql.ConnectionPool>();

const getPoolForCompanyId = async (compIdOrName: number | string): Promise<sql.ConnectionPool> => {
    try {
        return await getCompanySqlConnection(compIdOrName);
    } catch (primaryErr) {
        const key = String(compIdOrName).trim();
        const cached = fallbackCompanyPools.get(key);
        if (cached && cached.connected) {
            return cached;
        }

        const defaultPool = await getDefaultSqlConnection();
        const asBig = toBigIntValue(key);
        const compReq = new sql.Request(defaultPool);
        compReq.input('CompId', sql.BigInt, asBig ?? 0n);
        compReq.input('CompStr', sql.NVarChar(150), key);
        const compRes = await compReq.query(`
            SELECT TOP (1) [DB_Name]
            FROM [dbo].[tbl_Company]
            WHERE (@CompId > 0 AND ([Global_Comp_Id] = @CompId OR [Local_Comp_Id] = @CompId))
               OR [DB_Name] = @CompStr
               OR [Company_Name] = @CompStr
        `);
        const dbName = compRes.recordset?.[0]?.DB_Name
            ? String(compRes.recordset[0].DB_Name).trim()
            : null;
        if (!dbName) {
            throw primaryErr;
        }

        try {
            const byName = await getCompanySqlConnection(dbName);
            fallbackCompanyPools.set(key, byName);
            return byName;
        } catch {
            // Connect using default server credentials with resolved DB_Name
            const rawHost = process.env.DB_HOST || process.env.SERVER || 'localhost';
            const portMatch = rawHost.match(/^([^\\,]+),(\d+)$/);
            const server = portMatch ? portMatch[1].trim() : rawHost.trim();
            const port = portMatch ? parseInt(portMatch[2], 10) : 1433;

            const pool = new sql.ConnectionPool({
                server,
                port,
                database: dbName,
                user: (process.env.DB_USER || process.env.USER) as string,
                password: (process.env.DB_PASSWORD || process.env.PASSWORD) as string,
                options: {
                    encrypt: false,
                    trustServerCertificate: true,
                    requestTimeout: 60000,
                    connectTimeout: 60000,
                    enableArithAbort: true
                },
                pool: { max: 20, min: 0, idleTimeoutMillis: 60000 }
            });
            const connected = await pool.connect();
            fallbackCompanyPools.set(key, connected);
            fallbackCompanyPools.set(dbName, connected);
            return connected;
        }
    }
};

const getTicketDbPool = async (req: any): Promise<sql.ConnectionPool> => {
    const body = (req as any).body || {};
    const queryParams = ((req as any).query || {}) as Record<string, any>;

    let tokenCompanyId: number | null = null;
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        const session = verifyTokenSession(token);
        if (session?.companyId) {
            tokenCompanyId = session.companyId;
        }
    }

    const companyIdRaw =
        queryParams.companyId ||
        queryParams.Company_Id ||
        body.companyId ||
        body.Company_Id ||
        body.CompanyId ||
        req.currentCompanyId ||
        (req as any).companyId ||
        tokenCompanyId ||
        (req as any).dbID ||
        (req.get ? (req.get('Db') || req.get('db')) : null) ||
        (req as any).user?.Company_Id ||
        queryParams.From_CompanyId ||
        queryParams.createdcompany ||
        body.From_CompanyId ||
        body.createdcompany;

    if (companyIdRaw !== undefined && companyIdRaw !== null && String(companyIdRaw).trim() !== '') {
        const rawStr = String(companyIdRaw).trim();
        const asBigInt = toBigIntValue(rawStr);
        if (asBigInt && asBigInt > 0n) {
            return await getPoolForCompanyId(Number(asBigInt));
        }
        return await getPoolForCompanyId(rawStr);
    }

    if (req.currentDBName && req.currentDBName !== 'default') {
        return await getPoolForCompanyId(req.currentDBName);
    }

    try {
        return await getPoolForCompanyId(2);
    } catch {
        return await getDefaultSqlConnection();
    }
};

const initializedPools = new WeakSet<sql.ConnectionPool>();

const ensureTicketColumnsExist = async (pool: sql.ConnectionPool): Promise<void> => {
    if (initializedPools.has(pool)) return;
    try {
        await pool.request().query(`
            IF OBJECT_ID('${TICKET_TABLE}', 'U') IS NOT NULL
            BEGIN
                IF COL_LENGTH('${TICKET_TABLE}', 'ReqPriority') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [ReqPriority] NVARCHAR(50) NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'createdcompany') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [createdcompany] BIGINT NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'From_CompanyId') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [From_CompanyId] BIGINT NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'To_CompanyId') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [To_CompanyId] BIGINT NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Organisation') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Organisation] NVARCHAR(255) NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'ReqDuedate') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [ReqDuedate] DATETIME NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Repondercompany') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Repondercompany] NVARCHAR(100) NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Contact_Name') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Contact_Name] NVARCHAR(150) NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Contactdetails') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Contactdetails] NVARCHAR(150) NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Repondername') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Repondername] NVARCHAR(150) NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Othercompany_status') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Othercompany_status] NVARCHAR(100) NULL;
                ELSE IF EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'tbl_Ticket_Gen_Info'
                      AND COLUMN_NAME = 'Othercompany_status'
                      AND DATA_TYPE IN ('bigint', 'int', 'smallint', 'tinyint', 'bit', 'numeric', 'decimal')
                )
                    ALTER TABLE ${TICKET_TABLE} ALTER COLUMN [Othercompany_status] NVARCHAR(100) NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Status_Flag') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Status_Flag] NVARCHAR(50) NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Other_Company_TicketId') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Other_Company_TicketId] BIGINT NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Admin_Acknowledged_By') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Admin_Acknowledged_By] BIGINT NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Admin_Acknowledged_At') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Admin_Acknowledged_At] DATETIME NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Admin_Priority') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Admin_Priority] NVARCHAR(50) NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Admin_Due_Time') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Admin_Due_Time] DATETIME NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Acknowledged_By') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Acknowledged_By] BIGINT NULL;
                IF COL_LENGTH('${TICKET_TABLE}', 'Acknowledged_At') IS NULL
                    ALTER TABLE ${TICKET_TABLE} ADD [Acknowledged_At] DATETIME NULL;
            END

            IF OBJECT_ID('${REFERENCE_TABLE}', 'U') IS NULL
            BEGIN
                CREATE TABLE ${REFERENCE_TABLE} (
                    [Id] BIGINT IDENTITY(1,1) PRIMARY KEY,
                    [Ticket_Id] BIGINT NOT NULL,
                    [Ref_Ticket_Id] BIGINT NOT NULL,
                    [Reference_Note] NVARCHAR(MAX) NULL,
                    [Linked_By] BIGINT NULL,
                    [Linked_At] DATETIME DEFAULT GETDATE()
                );
            END
        `);
        initializedPools.add(pool);
    } catch (err: any) {
        console.warn('⚠️ ensureTicketColumnsExist warning:', err.message);
    }
};

const syncPoolTicketSchedules = async (pool: sql.ConnectionPool): Promise<void> => {
    try {
        await pool.request().query(`
            IF OBJECT_ID('[dbo].[tbl_Project_Schedule]', 'U') IS NOT NULL
               AND OBJECT_ID('${TICKET_TABLE}', 'U') IS NOT NULL
            BEGIN
                EXEC sp_executesql N'
                    UPDATE s
                    SET s.[Sch_Status] = mapped.[Target_Sch_Status],
                        s.[Sch_Comp_Date] = CASE WHEN mapped.[Target_Sch_Status] = 3 THEN ISNULL(s.[Sch_Comp_Date], GETDATE()) ELSE NULL END,
                        s.[Update_Date] = GETDATE()
                    FROM [dbo].[tbl_Project_Schedule] s
                    INNER JOIN ${TICKET_TABLE} tk
                        ON s.[Sch_No] LIKE ''TCK-%''
                       AND TRY_CAST(
                            REPLACE(
                                LEFT(
                                    SUBSTRING(s.[Sch_No], 5, 50),
                                    CASE
                                        WHEN CHARINDEX(''-'', SUBSTRING(s.[Sch_No], 5, 50)) > 0
                                        THEN CHARINDEX(''-'', SUBSTRING(s.[Sch_No], 5, 50)) - 1
                                        ELSE LEN(SUBSTRING(s.[Sch_No], 5, 50))
                                    END
                                ),
                                '' '',
                                ''''
                            ) AS BIGINT
                        ) = tk.[Id]
                    CROSS APPLY (
                        SELECT CASE
                            WHEN LOWER(LTRIM(RTRIM(ISNULL(tk.[Status], '''')))) = ''closed'' THEN 3
                            WHEN LOWER(LTRIM(RTRIM(ISNULL(tk.[Status], '''')))) = ''pending'' THEN 2
                            WHEN LOWER(LTRIM(RTRIM(ISNULL(tk.[Status], '''')))) IN (''new'', ''assigned'', ''inprocess'', ''in progress'', ''open'') THEN 1
                            ELSE NULL
                        END AS [Target_Sch_Status]
                    ) mapped
                    WHERE s.[Sch_Del_Flag] = 0
                      AND mapped.[Target_Sch_Status] IS NOT NULL
                      AND ISNULL(s.[Sch_Status], 0) <> mapped.[Target_Sch_Status];
                ';
            END

            IF OBJECT_ID('[dbo].[tbl_Project_Schedule]', 'U') IS NOT NULL
               AND OBJECT_ID('${PROJECT_TICKET_TABLE}', 'U') IS NOT NULL
               AND OBJECT_ID('${TICKET_TABLE}', 'U') IS NOT NULL
            BEGIN
                EXEC sp_executesql N'
                    UPDATE s
                    SET s.[Sch_Status] = mapped.[Target_Sch_Status],
                        s.[Sch_Comp_Date] = CASE WHEN mapped.[Target_Sch_Status] = 3 THEN ISNULL(s.[Sch_Comp_Date], GETDATE()) ELSE NULL END,
                        s.[Update_Date] = GETDATE()
                    FROM [dbo].[tbl_Project_Schedule] s
                    INNER JOIN ${PROJECT_TICKET_TABLE} pt ON pt.[Task_Id] = s.[Task_Id]
                    INNER JOIN ${TICKET_TABLE} tk ON TRY_CAST(pt.[Ticket_Id] AS BIGINT) = tk.[Id]
                    CROSS APPLY (
                        SELECT CASE
                            WHEN LOWER(LTRIM(RTRIM(ISNULL(tk.[Status], '''')))) = ''closed'' THEN 3
                            WHEN LOWER(LTRIM(RTRIM(ISNULL(tk.[Status], '''')))) = ''pending'' THEN 2
                            WHEN LOWER(LTRIM(RTRIM(ISNULL(tk.[Status], '''')))) IN (''new'', ''assigned'', ''inprocess'', ''in progress'', ''open'') THEN 1
                            ELSE NULL
                        END AS [Target_Sch_Status]
                    ) mapped
                    WHERE s.[Sch_Del_Flag] = 0
                      AND mapped.[Target_Sch_Status] IS NOT NULL
                      AND ISNULL(s.[Sch_Status], 0) <> mapped.[Target_Sch_Status];
                ';
            END

            IF OBJECT_ID('[dbo].[tbl_Project_Schedule]', 'U') IS NOT NULL
               AND OBJECT_ID('${ALLOCATION_TABLE}', 'U') IS NOT NULL
               AND OBJECT_ID('${TICKET_TABLE}', 'U') IS NOT NULL
            BEGIN
                EXEC sp_executesql N'
                    UPDATE s
                    SET s.[Sch_Status] = mapped.[Target_Sch_Status],
                        s.[Sch_Comp_Date] = CASE WHEN mapped.[Target_Sch_Status] = 3 THEN ISNULL(s.[Sch_Comp_Date], GETDATE()) ELSE NULL END,
                        s.[Update_Date] = GETDATE()
                    FROM [dbo].[tbl_Project_Schedule] s
                    INNER JOIN ${ALLOCATION_TABLE} a ON a.[T_Sch_Id] = s.[Sch_Id]
                    INNER JOIN ${TICKET_TABLE} tk ON a.[Ticket_Id] = tk.[Id]
                    CROSS APPLY (
                        SELECT CASE
                            WHEN LOWER(LTRIM(RTRIM(ISNULL(tk.[Status], '''')))) = ''closed'' THEN 3
                            WHEN LOWER(LTRIM(RTRIM(ISNULL(tk.[Status], '''')))) = ''pending'' THEN 2
                            WHEN LOWER(LTRIM(RTRIM(ISNULL(tk.[Status], '''')))) IN (''new'', ''assigned'', ''inprocess'', ''in progress'', ''open'') THEN 1
                            ELSE NULL
                        END AS [Target_Sch_Status]
                    ) mapped
                    WHERE s.[Sch_Del_Flag] = 0
                      AND mapped.[Target_Sch_Status] IS NOT NULL
                      AND ISNULL(s.[Sch_Status], 0) <> mapped.[Target_Sch_Status];
                ';
            END
        `);
        invalidateScheduleCache();
    } catch (err: any) {
        console.warn('⚠️ syncPoolTicketSchedules warning:', err.message);
    }
};

export const getTicketsListHandler = async (req: any, res: Response) => {
    try {
        const pool = await getTicketDbPool(req);
        await ensureTicketColumnsExist(pool);
        await syncPoolTicketSchedules(pool);

        const body = req.body || {};
        const queryParams = req.query || {};

        // Resolve company ID from query, body, or login session
        const companyIdRaw =
            queryParams.companyId ||
            queryParams.Company_Id ||
            queryParams.From_CompanyId ||
            queryParams.createdcompany ||
            body.companyId ||
            body.Company_Id ||
            body.CompanyId ||
            body.From_CompanyId ||
            body.createdcompany ||
            req.currentCompanyId ||
            req.dbID ||
            (req.get ? (req.get('Db') || req.get('db')) : null);
        let companyId = toBigIntValue(companyIdRaw);
        if (!companyId || companyId <= 0n) {
            companyId = 2n;
        }

        // User_Id identifies the company-local employee allocated to tickets.
        const requestedUserId =
            queryParams.userId ??
            queryParams.User_Id ??
            req.params?.User_Id ??
            body.userId ??
            body.User_Id ??
            req.localUserId ??
            req.userId ??
            req.user?.UserId ??
            req.user?.Local_User_ID ??
            req.user?.Global_User_ID;
        const userId = toBigIntValue(requestedUserId);
        const hasRequestedUserId =
            requestedUserId !== undefined &&
            requestedUserId !== null &&
            String(requestedUserId).trim() !== '';
        const assignedOnly = String(queryParams.scope || '').toLowerCase() === 'assigned';
        const referencesOnly = String(queryParams.scope || '').toLowerCase() === 'references';

        if (hasRequestedUserId && (!userId || userId <= 0n)) {
            return invalidInput(res, 'User_Id must be a valid positive integer');
        }
        if (assignedOnly && !userId) {
            return invalidInput(res, 'User_Id is required to list assigned tickets');
        }

        // Resolve User Type ID (0 and 1 are Admin = all data listing; all other numbers are Non-Admin = only allocated data)
        const rawUserTypeId =
            queryParams.userTypeId ??
            queryParams.UserTypeId ??
            queryParams.userType ??
            queryParams.UserType ??
            body.userTypeId ??
            body.UserTypeId ??
            body.userType ??
            body.UserType;

        let resolvedUserTypeId: number | null = null;
        let localUserIdFromDb: bigint | null = toBigIntValue(req.localUserId ?? req.user?.Local_User_ID ?? req.user?.UserId);
        let globalUserIdFromDb: bigint | null = toBigIntValue(req.userId ?? req.user?.Global_User_ID);

        if (userId) {
            // Auto-detect UserTypeId and UserId / Global_User_ID mapping from tbl_Users in company database
            try {
                const uReq = new sql.Request(pool);
                uReq.input('LookupUserId', sql.BigInt, userId);
                const uRes = await uReq.query(`
                    SELECT TOP (1) UserId, Global_User_ID, UserTypeId
                    FROM [dbo].[tbl_Users]
                    WHERE UserId = @LookupUserId OR Global_User_ID = @LookupUserId
                `);
                if (uRes.recordset.length > 0) {
                    const uRow = uRes.recordset[0];
                    if (uRow.UserTypeId !== null && uRow.UserTypeId !== undefined) {
                        resolvedUserTypeId = Number(uRow.UserTypeId);
                    }
                    if (uRow.UserId !== null && uRow.UserId !== undefined) {
                        localUserIdFromDb = toBigIntValue(uRow.UserId);
                    }
                    if (uRow.Global_User_ID !== null && uRow.Global_User_ID !== undefined) {
                        globalUserIdFromDb = toBigIntValue(uRow.Global_User_ID);
                    }
                }
            } catch (uErr: any) {
                console.warn('⚠️ Could not lookup UserTypeId from tbl_Users:', uErr.message);
            }
        }

        if (resolvedUserTypeId === null) {
            if (req.userTypeId !== undefined && req.userTypeId !== null && String(req.userTypeId).trim() !== '') {
                resolvedUserTypeId = Number(req.userTypeId);
            } else if (req.user?.UserTypeId !== undefined && req.user?.UserTypeId !== null) {
                resolvedUserTypeId = Number(req.user.UserTypeId);
            } else if (rawUserTypeId !== undefined && rawUserTypeId !== null && String(rawUserTypeId).trim() !== '') {
                resolvedUserTypeId = Number(rawUserTypeId);
            }
        }

        // If no user or userTypeId was resolved, default to Admin (1) to show all company tickets
        if (resolvedUserTypeId === null) {
            resolvedUserTypeId = 1;
        }

        // 0 and 1 are Admin (all data listing); all other numbers are Non-Admin (only allocated data listing)
        const isAdmin = resolvedUserTypeId === 0 || resolvedUserTypeId === 1;

        const pageRaw = queryParams.page || body.page;
        const pageSizeRaw = queryParams.pageSize || body.pageSize;
        const page = Math.max(parseInt(pageRaw, 10) || 1, 1);
        const pageSize = Math.min(Math.max(parseInt(pageSizeRaw, 10) || 50, 1), 100);
        const offset = (page - 1) * pageSize;

        const request = new sql.Request(pool);
        request.input('Offset', sql.Int, offset);
        request.input('PageSize', sql.Int, pageSize);
        request.input('Alt_Local_User_Id', sql.BigInt, localUserIdFromDb ?? userId ?? 0n);
        request.input('Alt_Global_User_Id', sql.BigInt, globalUserIdFromDb ?? userId ?? 0n);

        const whereConditions: string[] = [];
        if (companyId) {
            request.input('Company_Id', sql.BigInt, companyId);
            whereConditions.push('(t.createdcompany = @Company_Id OR t.From_CompanyId = @Company_Id OR t.Repondercompany = CAST(@Company_Id AS NVARCHAR(50)) OR t.To_CompanyId = @Company_Id)');
        }

        // Reference selection uses created tickets for users; admins retain company scope.
        if (referencesOnly && !isAdmin) {
            if (!userId) return invalidInput(res, 'User_Id is required to list reference tickets');
            request.input('Reference_Creator_Id', sql.BigInt, userId);
            whereConditions.push('(t.Created_By = @Reference_Creator_Id OR t.Created_By = @Alt_Local_User_Id OR t.Created_By = @Alt_Global_User_Id)');
        } else if (assignedOnly) {
            // Explicitly requested assigned tickets only
            if (userId) {
                request.input('User_Id', sql.BigInt, userId);
                whereConditions.push(`
                    EXISTS (
                        SELECT 1
                        FROM ${ALLOCATION_TABLE} a_chk
                        INNER JOIN ${ALLOCATION_EMP_TABLE} ae_chk
                            ON ae_chk.T_Sch_Id = a_chk.T_Sch_Id
                        WHERE a_chk.Ticket_Id = t.Id
                          AND ae_chk.Employee_Involved_Id IN (@User_Id, @Alt_Local_User_Id, @Alt_Global_User_Id)
                          AND LTRIM(RTRIM(ISNULL(ae_chk.Is_Active, ''))) = '1'
                    )
                `);
            } else {
                whereConditions.push('1 = 0');
            }
        } else if (!isAdmin) {
            // Non-Admin (userTypeId not 0 or 1): List tickets created by this user OR assigned to this user (Employee_Involved_Id)
            if (userId) {
                request.input('User_Id', sql.BigInt, userId);
                whereConditions.push(`
                    (
                        t.Created_By IN (@User_Id, @Alt_Local_User_Id, @Alt_Global_User_Id)
                        OR EXISTS (
                            SELECT 1
                            FROM ${ALLOCATION_TABLE} a_chk
                            INNER JOIN ${ALLOCATION_EMP_TABLE} ae_chk
                                ON ae_chk.T_Sch_Id = a_chk.T_Sch_Id
                            WHERE a_chk.Ticket_Id = t.Id
                              AND ae_chk.Employee_Involved_Id IN (@User_Id, @Alt_Local_User_Id, @Alt_Global_User_Id)
                              AND LTRIM(RTRIM(ISNULL(ae_chk.Is_Active, ''))) = '1'
                        )
                    )
                `);
            } else {
                whereConditions.push('1 = 0');
            }
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const query = `
            SELECT
                t.[Id],
                t.[Description],
                t.[Category],
                t.[Subject],
                t.[ReqPriority],
                t.[Image_Url],
                t.[Created_By],
                t.[Created_At],
                t.[Updated_By],
                t.[Updated_At],
                t.[Status],
                t.[createdcompany],
                t.[From_CompanyId],
                t.[To_CompanyId],
                t.[Organisation],
                t.[ReqDuedate],
                t.[Repondercompany],
                t.[Contact_Name],
                t.[Contactdetails],
                t.[Repondername],
                t.[Othercompany_status],
                t.[Status_Flag],
                t.[Other_Company_TicketId],
                t.[Admin_Acknowledged_By],
                t.[Admin_Acknowledged_At],
                t.[Admin_Priority],
                t.[Admin_Due_Time],
                t.[Acknowledged_By],
                t.[Acknowledged_At],
                u.Name AS Created_By_Name,
                -- tbl_Ticket_Alloctation columns
                a.[T_Sch_Id],
                a.[T_Asign_Date],
                a.[Ticket_Id],
                a.[Est_Sch_Start_Date],
                a.[Est_Sch_End_Date],
                a.[Sch_Comp_Date],
                a.[Allocated_By],
                a.[Created_Date],
                a.[Altered_Date],
                -- tbl_Ticket_Alloctation_Employees columns
                ae.[Employee_Involved_Id],
                ae.[Assigned_By],
                ae.[Assigned_At],
                ae.[Ack_Status],
                ae.[Ack_At],
                RTRIM(ae.[Ack_Remarks]) AS [Ack_Remarks],
                RTRIM(ae.[Is_Active]) AS [Is_Active],
                -- tbl_Ticket_Reference columns
                ref.[Ref_Ticket_Id],
                ref.[Reference_Note],
                ref.[Linked_By],
                ref.[Linked_At]
            FROM ${TICKET_TABLE} t
            -- Each lookup returns at most one row so pagination counts tickets,
            -- including tickets with no allocation, rather than joined children.
            OUTER APPLY (
                SELECT TOP (1) creator.Name
                FROM [dbo].[tbl_Users] creator
                WHERE creator.Global_User_Id = t.Created_By OR creator.UserId = t.Created_By
                ORDER BY creator.UserId DESC
            ) u
            OUTER APPLY (
                SELECT TOP (1)
                    allocation.T_Sch_Id, allocation.T_Asign_Date, allocation.Ticket_Id,
                    allocation.Est_Sch_Start_Date, allocation.Est_Sch_End_Date,
                    allocation.Sch_Comp_Date, allocation.Allocated_By,
                    allocation.Created_Date, allocation.Altered_Date
                FROM ${ALLOCATION_TABLE} allocation
                WHERE allocation.Ticket_Id = t.Id
                ORDER BY allocation.T_Sch_Id DESC
            ) a
            OUTER APPLY (
                SELECT TOP (1)
                    employee.Employee_Involved_Id, employee.Assigned_By,
                    employee.Assigned_At, employee.Ack_Status, employee.Ack_At,
                    employee.Ack_Remarks, employee.Is_Active
                FROM ${ALLOCATION_EMP_TABLE} employee
                WHERE employee.T_Sch_Id = a.T_Sch_Id
                ORDER BY
                    CASE WHEN LTRIM(RTRIM(ISNULL(employee.Is_Active, ''))) = '1' THEN 0 ELSE 1 END,
                    employee.Assigned_At DESC, employee.Employee_Involved_Id DESC
            ) ae
            OUTER APPLY (
                SELECT TOP (1)
                    reference.Ref_Ticket_Id, reference.Reference_Note,
                    reference.Linked_By, reference.Linked_At
                FROM ${REFERENCE_TABLE} reference
                WHERE reference.Ticket_Id = t.Id
                ORDER BY reference.Linked_At DESC, reference.Ref_Ticket_Id DESC
            ) ref
            ${whereClause}
            ORDER BY t.Id DESC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
        `;

        const result = await request.query(query);
        const rows = result.recordset || [];

        // Fetch structured References array for each unique ticket in the result page
        const ticketIds = [...new Set(rows.map((r: any) => r.Id).filter((id: any) => id !== null && id !== undefined))];
        const referencesByTicketId = new Map<string, any[]>();
        if (ticketIds.length > 0) {
            try {
                const refReq = new sql.Request(pool);
                const idParams = ticketIds.map((id, idx) => {
                    refReq.input(`tId_${idx}`, sql.BigInt, id);
                    return `@tId_${idx}`;
                });
                const refQuery = `
                    SELECT
                        r.[Ticket_Id],
                        r.[Ref_Ticket_Id],
                        r.[Reference_Note],
                        r.[Linked_By],
                        r.[Linked_At],
                        t.[Subject] AS [Ref_Ticket_Subject],
                        t.[Status] AS [Ref_Ticket_Status],
                        t.[Category] AS [Ref_Ticket_Category],
                        t.[ReqPriority] AS [Ref_Ticket_Priority],
                        u.[Name] AS [Linked_By_Name]
                    FROM ${REFERENCE_TABLE} r
                    LEFT JOIN ${TICKET_TABLE} t ON t.Id = r.Ref_Ticket_Id
                    LEFT JOIN [dbo].[tbl_Users] u ON u.Global_User_Id = r.Linked_By
                    WHERE r.Ticket_Id IN (${idParams.join(', ')})
                    ORDER BY r.Linked_At DESC
                `;
                const refRes = await refReq.query(refQuery);
                for (const refRow of refRes.recordset || []) {
                    const tidKey = String(refRow.Ticket_Id);
                    if (!referencesByTicketId.has(tidKey)) {
                        referencesByTicketId.set(tidKey, []);
                    }
                    referencesByTicketId.get(tidKey)!.push(refRow);
                }
            } catch (refErr: any) {
                console.warn('⚠️ Could not fetch batch ticket references:', refErr.message);
            }
        }

        // Deduplicate rows by Ticket Id (tbl_Ticket_Gen_Info) so each ticket appears exactly once
        const uniqueTicketsMap = new Map<string, any>();
        for (const row of rows) {
            const tKey = String(row.Id);
            if (!uniqueTicketsMap.has(tKey)) {
                const ticketRefs = referencesByTicketId.get(tKey) || [];
                row.References = ticketRefs;
                row.Ref_Ticket_Ids = ticketRefs.map((r: any) => r.Ref_Ticket_Id).join(', ');
                row.ReferenceTicketId = row.Ref_Ticket_Ids;
                row.Reference_Ticket_Id = ticketRefs.length > 0 ? ticketRefs[0].Ref_Ticket_Id : null;
                row.Ref_Ticket_Id = ticketRefs.length > 0 ? ticketRefs[0].Ref_Ticket_Id : null;

                // Ensure frontend compatibility fields (Priority, Category_Name, From_Company_Name, Company IDs, Image_Url)
                row.Priority = row.Priority ?? row.ReqPriority ?? row.Admin_Priority ?? 'Low';
                row.Category_Name = row.Category_Name ?? row.Category ?? null;
                row.From_Company_Name = row.From_Company_Name ?? row.Organisation ?? null;
                if (row.From_CompanyId === null || row.From_CompanyId === undefined || row.From_CompanyId === '') {
                    row.From_CompanyId = row.createdcompany ?? Number(companyId);
                }
                if (row.To_CompanyId === null || row.To_CompanyId === undefined || row.To_CompanyId === '') {
                    row.To_CompanyId = Number(companyId);
                } else if (String(row.To_CompanyId) !== String(companyId)) {
                    if (String(row.From_CompanyId) === String(companyId)) {
                        row.From_CompanyId = Number(row.To_CompanyId);
                    }
                    row.To_CompanyId = Number(companyId);
                }
                if (!isAdmin && userId && row.Employee_Involved_Id !== null && row.Employee_Involved_Id !== undefined) {
                    const empIdStr = String(row.Employee_Involved_Id);
                    if (
                        (localUserIdFromDb && empIdStr === String(localUserIdFromDb)) ||
                        (globalUserIdFromDb && empIdStr === String(globalUserIdFromDb))
                    ) {
                        row.Employee_Involved_Id = Number(userId);
                    }
                }
                if (typeof row.Image_Url === 'string' && row.Image_Url.trim() !== '') {
                    const img = row.Image_Url.trim().replace(/\\/g, '/');
                    if (img.startsWith('uploads/')) {
                        row.Image_Url = `/${img}`;
                    } else {
                        row.Image_Url = img;
                    }
                }

                uniqueTicketsMap.set(tKey, row);
            }
        }

        const uniqueRows = Array.from(uniqueTicketsMap.values());
        return dataFound(res, uniqueRows);
    } catch (err) {
        console.error('Error in getTicketsListHandler:', err);
        return servError(err, res);
    }
};

export const getTickets = getTicketsListHandler;

export interface TicketSyncParams {
    ticketId?: number | string | bigint | null;
    taskId?: number | string | bigint | null;
    schId?: number | string | bigint | null;
    schNo?: string | null;
    taskName?: string | null;
    empId?: number | string | bigint | null;
    workStatus?: number | string | null;
    ticketStatus?: string | null;
    workDone?: string | null;
    fromCompanyId?: number | string | bigint | null;
    toCompanyId?: number | string | bigint | null;
    updatedBy?: number | string | bigint | null;
}

const extractTicketIdFromSchNo = (schNo: any): bigint | null => {
    if (!schNo || typeof schNo !== 'string') return null;
    const tckMatch = schNo.match(/TCK-0*(\d+)/i);
    if (tckMatch && tckMatch[1]) {
        return toBigIntValue(tckMatch[1]);
    }
    return null;
};

export const resolveLinkedTicketInfo = async (req: any, params: TicketSyncParams) => {
    const pool = await getTicketDbPool(req);
    await ensureTicketColumnsExist(pool);

    let resolvedTicketId = toBigIntValue(params.ticketId);
    const taskId = toBigIntValue(params.taskId);
    const schId = toBigIntValue(params.schId);
    let fromCompanyId = toBigIntValue(params.fromCompanyId);
    let toCompanyId = toBigIntValue(params.toCompanyId);

    // 1. Check tbl_Project_Ticket by Task_Id or Ticket_Id (using TRY_CAST since Ticket_Id can be nvarchar)
    if ((taskId && taskId > 0n) || (resolvedTicketId && resolvedTicketId > 0n)) {
        try {
            const ptReq = new sql.Request(pool);
            ptReq.input('TaskId', sql.BigInt, taskId ?? 0n);
            ptReq.input('TicketId', sql.BigInt, resolvedTicketId ?? 0n);
            const ptRes = await ptReq.query(`
                IF OBJECT_ID('${PROJECT_TICKET_TABLE}', 'U') IS NOT NULL
                BEGIN
                    SELECT TOP (1)
                        TRY_CAST([Ticket_Id] AS BIGINT) AS [Ticket_Id],
                        [From_CompanyId],
                        [To_CompanyId],
                        [Employee_Involved_Id],
                        [Task_Id]
                    FROM ${PROJECT_TICKET_TABLE}
                    WHERE (@TaskId > 0 AND [Task_Id] = @TaskId)
                       OR (@TicketId > 0 AND TRY_CAST([Ticket_Id] AS BIGINT) = @TicketId)
                    ORDER BY [id] DESC
                END
            `);
            if (ptRes.recordset && ptRes.recordset.length > 0) {
                const ptRow = ptRes.recordset[0];
                if (!resolvedTicketId && ptRow.Ticket_Id) {
                    resolvedTicketId = toBigIntValue(ptRow.Ticket_Id);
                }
                if (!fromCompanyId && ptRow.From_CompanyId) {
                    fromCompanyId = toBigIntValue(ptRow.From_CompanyId);
                }
                if (!toCompanyId && ptRow.To_CompanyId) {
                    toCompanyId = toBigIntValue(ptRow.To_CompanyId);
                }
            }
        } catch (err: any) {
            console.warn('⚠️ resolveLinkedTicketInfo tbl_Project_Ticket lookup warning:', err.message);
        }
    }

    // 2. Check Sch_No passed in params or in tbl_Project_Schedule
    if (!resolvedTicketId && params.schNo) {
        resolvedTicketId = extractTicketIdFromSchNo(params.schNo);
    }

    if (!resolvedTicketId && ((schId && schId > 0n) || (taskId && taskId > 0n))) {
        try {
            const schReq = new sql.Request(pool);
            schReq.input('SchId', sql.BigInt, schId ?? 0n);
            schReq.input('TaskId', sql.BigInt, taskId ?? 0n);
            const schRes = await schReq.query(`
                IF OBJECT_ID('[dbo].[tbl_Project_Schedule]', 'U') IS NOT NULL
                BEGIN
                    SELECT TOP (1) [Sch_Id], [Sch_No], [Task_Id]
                    FROM [dbo].[tbl_Project_Schedule] WITH (NOLOCK)
                    WHERE (@SchId > 0 AND [Sch_Id] = @SchId)
                       OR (@TaskId > 0 AND [Task_Id] = @TaskId)
                    ORDER BY [Sch_Id] DESC
                END
            `);
            if (schRes.recordset && schRes.recordset.length > 0) {
                const dbSchNo = schRes.recordset[0]?.Sch_No;
                resolvedTicketId = extractTicketIdFromSchNo(dbSchNo);
            }
        } catch (err: any) {
            console.warn('⚠️ resolveLinkedTicketInfo tbl_Project_Schedule lookup warning:', err.message);
        }
    }

    // 3. Check tbl_Ticket_Alloctation by T_Sch_Id = Sch_Id
    if (!resolvedTicketId && schId && schId > 0n) {
        try {
            const allocReq = new sql.Request(pool);
            allocReq.input('SchId', sql.BigInt, schId);
            const allocRes = await allocReq.query(`
                IF OBJECT_ID('${ALLOCATION_TABLE}', 'U') IS NOT NULL
                BEGIN
                    SELECT TOP (1) [Ticket_Id], [T_Sch_Id]
                    FROM ${ALLOCATION_TABLE}
                    WHERE [T_Sch_Id] = @SchId
                END
            `);
            if (allocRes.recordset && allocRes.recordset.length > 0) {
                resolvedTicketId = toBigIntValue(allocRes.recordset[0]?.Ticket_Id);
            }
        } catch (err: any) {
            console.warn('⚠️ resolveLinkedTicketInfo tbl_Ticket_Alloctation lookup warning:', err.message);
        }
    }

    // 4. Fallback: Match tbl_Task (Task_Name / Task_Desc) against tbl_Ticket_Gen_Info (Subject / Description)
    if (!resolvedTicketId && ((taskId && taskId > 0n) || (params.taskName && String(params.taskName).trim() !== ''))) {
        try {
            const fbReq = new sql.Request(pool);
            fbReq.input('TaskId', sql.BigInt, taskId ?? 0n);
            fbReq.input('ParamTaskName', sql.NVarChar(255), params.taskName ? String(params.taskName).trim() : '');
            const fbRes = await fbReq.query(`
                DECLARE @TName NVARCHAR(255) = @ParamTaskName;
                DECLARE @TDesc NVARCHAR(MAX) = '';
                DECLARE @ProjId BIGINT = 0;

                IF @TaskId > 0 AND OBJECT_ID('[dbo].[tbl_Task]', 'U') IS NOT NULL
                BEGIN
                    SELECT TOP (1)
                        @TName = COALESCE(NULLIF(LTRIM(RTRIM([Task_Name])), ''), @TName),
                        @TDesc = LTRIM(RTRIM(ISNULL([Task_Desc], ''))),
                        @ProjId = ISNULL([Project_Id], 0)
                    FROM [dbo].[tbl_Task] WITH (NOLOCK)
                    WHERE [Task_Id] = @TaskId;
                END

                IF (@TName <> '' OR @TDesc <> '') AND OBJECT_ID('${TICKET_TABLE}', 'U') IS NOT NULL
                BEGIN
                    SELECT TOP (1) t.[Id], t.[From_CompanyId], t.[To_CompanyId]
                    FROM ${TICKET_TABLE} t
                    WHERE (@TName <> '' AND LTRIM(RTRIM(t.[Subject])) = @TName)
                       OR (@TDesc <> '' AND LTRIM(RTRIM(ISNULL(t.[Description], ''))) = @TDesc)
                       OR (
                           @ProjId > 0
                           AND OBJECT_ID('[dbo].[tbl_Project_Master]', 'U') IS NOT NULL
                           AND EXISTS (
                               SELECT 1
                               FROM [dbo].[tbl_Project_Master] pm WITH (NOLOCK)
                               WHERE pm.[Project_Id] = @ProjId
                                 AND UPPER(LTRIM(RTRIM(pm.[Project_Name]))) = 'UN ASSIGNED WORK'
                           )
                       )
                    ORDER BY
                        CASE
                            WHEN (@TName <> '' AND LTRIM(RTRIM(t.[Subject])) = @TName)
                              OR (@TDesc <> '' AND LTRIM(RTRIM(ISNULL(t.[Description], ''))) = @TDesc)
                            THEN 0
                            WHEN EXISTS (SELECT 1 FROM ${ALLOCATION_TABLE} a WHERE a.[Ticket_Id] = t.[Id])
                            THEN 1
                            ELSE 2
                        END,
                        t.[Id] DESC;
                END
            `);
            if (fbRes.recordset && fbRes.recordset.length > 0) {
                const matchedRow = fbRes.recordset[0];
                resolvedTicketId = toBigIntValue(matchedRow.Id);

                // Backfill tbl_Project_Ticket if Task_Id is known so future lookups are direct
                if (resolvedTicketId && taskId && taskId > 0n) {
                    try {
                        const healReq = new sql.Request(pool);
                        healReq.input('TicketId', sql.BigInt, resolvedTicketId);
                        healReq.input('TaskId', sql.BigInt, taskId);
                        healReq.input('FromComp', sql.BigInt, toBigIntValue(matchedRow.From_CompanyId) ?? 1n);
                        healReq.input('ToComp', sql.BigInt, toBigIntValue(matchedRow.To_CompanyId) ?? 2n);
                        await healReq.query(`
                            IF OBJECT_ID('${PROJECT_TICKET_TABLE}', 'U') IS NOT NULL
                               AND NOT EXISTS (SELECT 1 FROM ${PROJECT_TICKET_TABLE} WHERE [Task_Id] = @TaskId)
                            BEGIN
                                IF COLUMNPROPERTY(OBJECT_ID('tbl_Project_Ticket'), 'id', 'IsIdentity') = 1
                                BEGIN
                                    INSERT INTO ${PROJECT_TICKET_TABLE} ([project_id], [Ticket_Id], [From_CompanyId], [To_CompanyId], [Task_Id], [ticket_acc_date])
                                    VALUES (1, @TicketId, @FromComp, @ToComp, @TaskId, CONVERT(varchar(19), GETDATE(), 120));
                                END
                                ELSE
                                BEGIN
                                    DECLARE @NextPtId BIGINT = (SELECT ISNULL(MAX([id]), 0) + 1 FROM ${PROJECT_TICKET_TABLE});
                                    INSERT INTO ${PROJECT_TICKET_TABLE} ([id], [project_id], [Ticket_Id], [From_CompanyId], [To_CompanyId], [Task_Id], [ticket_acc_date])
                                    VALUES (@NextPtId, 1, @TicketId, @FromComp, @ToComp, @TaskId, CONVERT(varchar(19), GETDATE(), 120));
                                END
                            END
                        `);
                    } catch { /* ignore backfill errors */ }
                }
            }
        } catch (err: any) {
            console.warn('⚠️ resolveLinkedTicketInfo tbl_Task fallback warning:', err.message);
        }
    }

    if (!resolvedTicketId || resolvedTicketId <= 0n) {
        return null;
    }

    // 5. Fetch the ticket row from tbl_Ticket_Gen_Info
    let ticketRow: any = null;
    const candidatePools: sql.ConnectionPool[] = [pool];
    if (toCompanyId && toCompanyId > 0n) {
        try {
            const p = await getPoolForCompanyId(Number(toCompanyId));
            if (!candidatePools.includes(p)) candidatePools.push(p);
        } catch { /* ignore */ }
    }
    if (fromCompanyId && fromCompanyId > 0n) {
        try {
            const p = await getPoolForCompanyId(Number(fromCompanyId));
            if (!candidatePools.includes(p)) candidatePools.push(p);
        } catch { /* ignore */ }
    }

    for (const candidatePool of candidatePools) {
        try {
            await ensureTicketColumnsExist(candidatePool);
            const tReq = new sql.Request(candidatePool);
            tReq.input('TicketId', sql.BigInt, resolvedTicketId);
            const tRes = await tReq.query(`
                SELECT TOP (1)
                    t.[Id],
                    t.[Subject],
                    t.[Status],
                    t.[Othercompany_status],
                    t.[Other_Company_TicketId],
                    t.[From_CompanyId],
                    t.[To_CompanyId],
                    t.[createdcompany],
                    t.[Repondercompany],
                    t.[Status_Flag],
                    a.[T_Sch_Id]
                FROM ${TICKET_TABLE} t
                OUTER APPLY (
                    SELECT TOP (1) allocation.[T_Sch_Id]
                    FROM ${ALLOCATION_TABLE} allocation
                    WHERE allocation.[Ticket_Id] = t.[Id]
                    ORDER BY allocation.[T_Sch_Id] DESC
                ) a
                WHERE t.[Id] = @TicketId OR t.[Other_Company_TicketId] = @TicketId
                ORDER BY CASE WHEN t.[Id] = @TicketId THEN 0 ELSE 1 END, t.[Id] DESC
            `);
            if (tRes.recordset && tRes.recordset.length > 0) {
                ticketRow = tRes.recordset[0];
                break;
            }
        } catch (err: any) {
            console.warn('⚠️ resolveLinkedTicketInfo tbl_Ticket_Gen_Info query warning:', err.message);
        }
    }

    const responderCompBigInt =
        ticketRow?.Repondercompany && /^\d+$/.test(String(ticketRow.Repondercompany).trim())
            ? toBigIntValue(ticketRow.Repondercompany)
            : null;

    // Collect all company IDs associated with this ticket (both sender and receiver companies)
    const allInvolvedCompanyIds = [
        toBigIntValue(ticketRow?.From_CompanyId),
        toBigIntValue(ticketRow?.To_CompanyId),
        toBigIntValue(ticketRow?.createdcompany),
        responderCompBigInt,
        fromCompanyId,
        toCompanyId
    ]
        .filter((v): v is bigint => v !== null && v > 0n)
        .map((v) => Number(v));

    const uniqueCompanyIds = [...new Set(allInvolvedCompanyIds)];
    const finalFromCompanyId =
        toBigIntValue(ticketRow?.From_CompanyId ?? ticketRow?.createdcompany) ?? fromCompanyId;
    const finalToCompanyId =
        toBigIntValue(ticketRow?.To_CompanyId) ?? responderCompBigInt ?? toCompanyId;

    return {
        isTicketSchedule: true,
        Ticket_Id: Number(ticketRow?.Id ?? resolvedTicketId),
        Subject: ticketRow?.Subject ? String(ticketRow.Subject).trim() : null,
        Other_Company_TicketId: ticketRow?.Other_Company_TicketId ? Number(ticketRow.Other_Company_TicketId) : null,
        From_CompanyId: finalFromCompanyId ? Number(finalFromCompanyId) : (uniqueCompanyIds[0] ?? null),
        To_CompanyId: finalToCompanyId ? Number(finalToCompanyId) : (uniqueCompanyIds[1] ?? uniqueCompanyIds[0] ?? null),
        Involved_CompanyIds: uniqueCompanyIds,
        Status: ticketRow?.Status || 'Assigned',
        Othercompany_status: ticketRow?.Othercompany_status || null,
        T_Sch_Id: ticketRow?.T_Sch_Id ? Number(ticketRow.T_Sch_Id) : null
    };
};

export const getTicketByTaskOrSchedule = async (req: Request, res: Response) => {
    try {
        const query = req.query || {};
        const info = await resolveLinkedTicketInfo(req, {
            ticketId: (query.ticketId || query.Ticket_Id) as any,
            taskId: (query.taskId || query.Task_Id) as any,
            schId: (query.schId || query.Sch_Id) as any,
            schNo: (query.schNo || query.Sch_No) as any,
            taskName: (query.taskName || query.Task_Name) as any
        });

        if (!info) {
            return res.status(200).json({
                success: true,
                message: 'Not a ticket schedule',
                data: { isTicketSchedule: false }
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Ticket schedule info retrieved successfully',
            data: info
        });
    } catch (err) {
        console.error('Error in getTicketByTaskOrSchedule:', err);
        return servError(err, res);
    }
};

const mapTicketStatusToScheduleStatus = (status: string | null | undefined): number | null => {
    if (!status) return null;
    const normalized = String(status).trim().toLowerCase();
    if (normalized === 'closed') return 3; // Completed
    if (normalized === 'pending') return 2; // Pending
    if (['new', 'assigned', 'inprocess', 'in progress', 'open'].includes(normalized)) return 1; // Inprocess
    return null;
};

export const syncTicketWorkAndStatus = async (req: any, params: TicketSyncParams) => {
    try {
        const rawTicketStatus = params.ticketStatus ?? req.body?.Ticket_Status ?? req.body?.Status;
        const ticketStatus =
            rawTicketStatus !== undefined && rawTicketStatus !== null && String(rawTicketStatus).trim() !== ''
                ? String(rawTicketStatus).trim()
                : null;
        const isTicketClosed = ticketStatus !== null && ticketStatus.toLowerCase() === 'closed';
        const initialTargetSchStatus = mapTicketStatusToScheduleStatus(ticketStatus);

        const paramSchId = toBigIntValue(params.schId ?? req.body?.Sch_Id);
        const paramTaskId = toBigIntValue(params.taskId ?? req.body?.Task_Id);
        const paramSchNo =
            params.schNo !== undefined && params.schNo !== null && String(params.schNo).trim() !== ''
                ? String(params.schNo).trim()
                : req.body?.Sch_No && String(req.body.Sch_No).trim() !== ''
                    ? String(req.body.Sch_No).trim()
                    : '';

        const updatedBy = toBigIntValue(
            params.updatedBy ??
            req.body?.Update_By ??
            req.body?.Entry_By ??
            req.body?.Updated_By ??
            req.userId ??
            req.localUserId
        );

        const info = await resolveLinkedTicketInfo(req, params);
        if (!info || !info.Ticket_Id) {
            if (initialTargetSchStatus !== null && ((paramSchId && paramSchId > 0n) || (paramTaskId && paramTaskId > 0n) || paramSchNo !== '')) {
                try {
                    const fallbackPool = await getTicketDbPool(req);
                    const fbSchReq = new sql.Request(fallbackPool);
                    fbSchReq.input('TargetSchStatus', sql.Int, initialTargetSchStatus);
                    fbSchReq.input('ParamSchId', sql.BigInt, paramSchId ?? 0n);
                    fbSchReq.input('ParamTaskId', sql.BigInt, paramTaskId ?? 0n);
                    fbSchReq.input('ParamSchNo', sql.NVarChar(100), paramSchNo);
                    fbSchReq.input('UpdatedBy', sql.BigInt, updatedBy);
                    await fbSchReq.query(`
                        IF OBJECT_ID('[dbo].[tbl_Project_Schedule]', 'U') IS NOT NULL
                        BEGIN
                            UPDATE [dbo].[tbl_Project_Schedule]
                            SET [Sch_Status] = @TargetSchStatus,
                                [Sch_Comp_Date] = CASE WHEN @TargetSchStatus = 3 THEN ISNULL([Sch_Comp_Date], GETDATE()) ELSE NULL END,
                                [Update_By] = COALESCE(TRY_CAST(@UpdatedBy AS INT), [Update_By]),
                                [Update_Date] = GETDATE()
                            WHERE [Sch_Del_Flag] = 0
                              AND (
                                  (@ParamSchId > 0 AND [Sch_Id] = @ParamSchId)
                                  OR (@ParamTaskId > 0 AND [Task_Id] = @ParamTaskId)
                                  OR (@ParamSchNo <> '' AND [Sch_No] = @ParamSchNo)
                              );
                        END
                    `);
                    invalidateScheduleCache();
                } catch (fbSchErr: any) {
                    console.warn('⚠️ syncTicketWorkAndStatus fallback schedule status update warning:', fbSchErr.message);
                }
            }
            return { synced: false };
        }

        const effectiveTicketStatus = ticketStatus || info.Status || null;
        const targetSchStatus = mapTicketStatusToScheduleStatus(effectiveTicketStatus);

        const primaryTicketId = BigInt(info.Ticket_Id);
        const otherCompanyTicketId = info.Other_Company_TicketId ? BigInt(info.Other_Company_TicketId) : null;
        const ticketSubject = info.Subject || '';

        // Map Work_Status -> Othercompany_status ('completed', 'pending', 'inprogress')
        const rawWorkStatus = params.workStatus ?? req.body?.Work_Status ?? req.body?.workStatus;
        let otherCompanyStatus: string | null = null;
        let workStatusInt: number | null = null;
        let isCompleted = 0;

        if (rawWorkStatus !== undefined && rawWorkStatus !== null && String(rawWorkStatus).trim() !== '') {
            const wsStr = String(rawWorkStatus).toLowerCase().trim();
            if (wsStr === '3' || wsStr === 'completed') {
                otherCompanyStatus = 'completed';
                workStatusInt = 3;
                isCompleted = 1;
            } else if (wsStr === '2' || wsStr === 'in progress' || wsStr === 'inprogress' || wsStr === 'in process') {
                otherCompanyStatus = 'inprogress';
                workStatusInt = 2;
                isCompleted = 0;
            } else if (wsStr === '1' || wsStr === 'pending') {
                otherCompanyStatus = 'pending';
                workStatusInt = 1;
                isCompleted = 0;
            }
        }

        if (isTicketClosed) {
            isCompleted = 1;
            if (!otherCompanyStatus) {
                otherCompanyStatus = 'completed';
            }
            if (workStatusInt === null) {
                workStatusInt = 3;
            }
        }

        const workDone =
            params.workDone !== undefined && params.workDone !== null && String(params.workDone).trim() !== ''
                ? String(params.workDone).trim()
                : null;

        // Gather all company DB pools (current, From_CompanyId, To_CompanyId, Involved_CompanyIds)
        const currentPool = await getTicketDbPool(req);
        const poolsToUpdate: sql.ConnectionPool[] = [currentPool];

        const companyIdsToConnect = [
            ...(info.Involved_CompanyIds || []),
            info.From_CompanyId,
            info.To_CompanyId,
            Number(toBigIntValue(params.fromCompanyId) || 0),
            Number(toBigIntValue(params.toCompanyId) || 0)
        ].filter((id): id is number => Boolean(id && !isNaN(Number(id)) && Number(id) > 0));

        for (const compId of [...new Set(companyIdsToConnect)]) {
            try {
                const compPool = await getPoolForCompanyId(compId);
                if (!poolsToUpdate.includes(compPool)) {
                    poolsToUpdate.push(compPool);
                }
            } catch (connErr: any) {
                console.warn(`⚠️ Could not connect to company ${compId} DB for ticket sync:`, connErr.message);
            }
        }

        const newValueForTxn = ticketStatus || otherCompanyStatus;

        for (const targetPool of poolsToUpdate) {
            try {
                await ensureTicketColumnsExist(targetPool);

                // Resolve matching ticket ID(s) in this company DB
                const targetTicketIds = new Set<bigint>();

                if (targetPool === currentPool) {
                    targetTicketIds.add(primaryTicketId);
                } else {
                    const matchReq = new sql.Request(targetPool);
                    matchReq.input('PrimaryTicketId', sql.BigInt, primaryTicketId);
                    matchReq.input('OtherTicketId', sql.BigInt, otherCompanyTicketId ?? 0n);
                    matchReq.input('TicketSubject', sql.NVarChar(255), ticketSubject);
                    const matchRes = await matchReq.query(`
                        SELECT [Id]
                        FROM ${TICKET_TABLE}
                        WHERE (@OtherTicketId > 0 AND [Id] = @OtherTicketId)
                           OR [Other_Company_TicketId] = @PrimaryTicketId
                           OR (@TicketSubject <> '' AND LTRIM(RTRIM([Subject])) = LTRIM(RTRIM(@TicketSubject)))
                    `);
                    if (matchRes.recordset && matchRes.recordset.length > 0) {
                        for (const r of matchRes.recordset) {
                            const tid = toBigIntValue(r.Id);
                            if (tid && tid > 0n) targetTicketIds.add(tid);
                        }
                    } else {
                        targetTicketIds.add(primaryTicketId);
                    }
                }

                for (const targetTicketId of targetTicketIds) {
                    // 1. Update tbl_Ticket_Gen_Info (Status & Othercompany_status)
                    try {
                        const ocTypeRes = await new sql.Request(targetPool).query(`
                            SELECT TOP (1) DATA_TYPE
                            FROM INFORMATION_SCHEMA.COLUMNS
                            WHERE TABLE_NAME = 'tbl_Ticket_Gen_Info'
                              AND COLUMN_NAME = 'Othercompany_status'
                        `);
                        const ocDataType = String(ocTypeRes.recordset?.[0]?.DATA_TYPE || 'nvarchar').toLowerCase();
                        const isNumericOc = ['int', 'bigint', 'smallint', 'tinyint', 'bit', 'numeric', 'decimal'].includes(ocDataType);

                        const uTicketReq = new sql.Request(targetPool);
                        uTicketReq.input('TargetTicketId', sql.BigInt, targetTicketId);
                        uTicketReq.input('TicketStatus', sql.NVarChar(100), ticketStatus);
                        if (isNumericOc) {
                            uTicketReq.input('OtherCompanyStatus', sql.BigInt, workStatusInt !== null ? BigInt(workStatusInt) : null);
                        } else {
                            uTicketReq.input('OtherCompanyStatus', sql.NVarChar(100), otherCompanyStatus);
                        }
                        uTicketReq.input('UpdatedBy', sql.BigInt, updatedBy);
                        await uTicketReq.query(`
                            UPDATE ${TICKET_TABLE}
                            SET [Status] = COALESCE(@TicketStatus, [Status]),
                                [Othercompany_status] = COALESCE(@OtherCompanyStatus, [Othercompany_status]),
                                [Updated_By] = COALESCE(@UpdatedBy, [Updated_By]),
                                [Updated_At] = GETDATE()
                            WHERE [Id] = @TargetTicketId
                        `);
                    } catch (genErr: any) {
                        console.warn('⚠️ syncTicketWorkAndStatus tbl_Ticket_Gen_Info update warning:', genErr.message);
                    }

                    // 2. Update tbl_Ticket_Alloctation
                    try {
                        const uAllocReq = new sql.Request(targetPool);
                        uAllocReq.input('TargetTicketId', sql.BigInt, targetTicketId);
                        uAllocReq.input('IsCompleted', sql.Int, isCompleted);
                        await uAllocReq.query(`
                            IF OBJECT_ID('${ALLOCATION_TABLE}', 'U') IS NOT NULL
                            BEGIN
                                UPDATE ${ALLOCATION_TABLE}
                                SET [Sch_Comp_Date] = CASE WHEN @IsCompleted = 1 THEN GETDATE() ELSE [Sch_Comp_Date] END,
                                    [Altered_Date] = GETDATE()
                                WHERE [Ticket_Id] = @TargetTicketId;
                            END
                        `);
                    } catch (allocErr: any) {
                        console.warn('⚠️ syncTicketWorkAndStatus tbl_Ticket_Alloctation update warning:', allocErr.message);
                    }

                    // 3. Update tbl_Ticket_Alloctation_Employees
                    try {
                        const colTypeRes = await new sql.Request(targetPool).query(`
                            SELECT TOP (1) DATA_TYPE
                            FROM INFORMATION_SCHEMA.COLUMNS
                            WHERE TABLE_NAME = 'tbl_Ticket_Alloctation_Employees'
                              AND COLUMN_NAME = 'Ack_Status'
                        `);
                        if (colTypeRes.recordset && colTypeRes.recordset.length > 0) {
                            const dataType = String(colTypeRes.recordset[0].DATA_TYPE || '').toLowerCase();
                            const isNumericAck = ['int', 'bigint', 'smallint', 'tinyint', 'bit', 'numeric', 'decimal'].includes(dataType);
                            const uEmpReq = new sql.Request(targetPool);
                            uEmpReq.input('TargetTicketId', sql.BigInt, targetTicketId);
                            uEmpReq.input('WorkDone', sql.NVarChar(sql.MAX), workDone);
                            if (isNumericAck) {
                                const numVal = dataType === 'bit' ? (isCompleted === 1 ? 1 : 0) : (workStatusInt ?? 1);
                                uEmpReq.input('AckVal', sql.Int, numVal);
                            } else {
                                uEmpReq.input('AckVal', sql.NVarChar(100), otherCompanyStatus || ticketStatus);
                            }
                            await uEmpReq.query(`
                                UPDATE ae
                                SET ae.[Ack_Status] = COALESCE(@AckVal, ae.[Ack_Status]),
                                    ae.[Ack_At] = GETDATE(),
                                    ae.[Ack_Remarks] = COALESCE(LEFT(@WorkDone, 10), ae.[Ack_Remarks])
                                FROM ${ALLOCATION_EMP_TABLE} ae
                                INNER JOIN ${ALLOCATION_TABLE} a ON a.[T_Sch_Id] = ae.[T_Sch_Id]
                                WHERE a.[Ticket_Id] = @TargetTicketId
                            `);
                        }
                    } catch (empErr: any) {
                        console.warn('⚠️ syncTicketWorkAndStatus tbl_Ticket_Alloctation_Employees update warning:', empErr.message);
                    }

                    // 4. Update tbl_Ticket_Transaction (New_Value column in From_CompanyId and To_CompanyId DBs)
                    if (newValueForTxn) {
                        try {
                            const uTxnReq = new sql.Request(targetPool);
                            uTxnReq.input('TargetTicketId', sql.BigInt, targetTicketId);
                            uTxnReq.input('NewValue', sql.NVarChar(200), newValueForTxn.slice(0, 200));
                            uTxnReq.input('WorkDone', sql.NVarChar(500), workDone ? workDone.slice(0, 500) : null);
                            uTxnReq.input('UpdatedBy', sql.BigInt, updatedBy);
                            await uTxnReq.query(`
                                IF OBJECT_ID('${TRANSACTION_TABLE}', 'U') IS NOT NULL
                                BEGIN
                                    IF EXISTS (SELECT 1 FROM ${TRANSACTION_TABLE} WHERE [Ticket_Id] = @TargetTicketId)
                                    BEGIN
                                        UPDATE ${TRANSACTION_TABLE}
                                        SET [Old_Value] = COALESCE([New_Value], [Old_Value]),
                                            [New_Value] = @NewValue,
                                            [Performed_At] = GETDATE(),
                                            [Performed_By] = COALESCE(TRY_CAST(@UpdatedBy AS INT), [Performed_By]),
                                            [Remarks] = COALESCE(@WorkDone, [Remarks])
                                        WHERE [Ticket_Id] = @TargetTicketId;
                                    END
                                    ELSE
                                    BEGIN
                                        IF COLUMNPROPERTY(OBJECT_ID('tbl_Ticket_Transaction'), 'Txn_Id', 'IsIdentity') = 1
                                        BEGIN
                                            INSERT INTO ${TRANSACTION_TABLE} ([Ticket_Id], [Event_Type_Id], [Performed_By], [Performed_At], [Old_Value], [New_Value], [Remarks])
                                            VALUES (TRY_CAST(@TargetTicketId AS INT), 1, ISNULL(TRY_CAST(@UpdatedBy AS INT), 1), GETDATE(), 'Assigned', @NewValue, @WorkDone);
                                        END
                                        ELSE
                                        BEGIN
                                            DECLARE @NextTxnId INT = (SELECT ISNULL(MAX([Txn_Id]), 0) + 1 FROM ${TRANSACTION_TABLE});
                                            INSERT INTO ${TRANSACTION_TABLE} ([Txn_Id], [Ticket_Id], [Event_Type_Id], [Performed_By], [Performed_At], [Old_Value], [New_Value], [Remarks])
                                            VALUES (@NextTxnId, TRY_CAST(@TargetTicketId AS INT), 1, ISNULL(TRY_CAST(@UpdatedBy AS INT), 1), GETDATE(), 'Assigned', @NewValue, @WorkDone);
                                        END
                                    END
                                END
                            `);
                        } catch (txnErr: any) {
                            console.warn('⚠️ syncTicketWorkAndStatus tbl_Ticket_Transaction update warning:', txnErr.message);
                        }
                    }

                    // 5. Update tbl_Project_Ticket completion date when completed
                    if (isCompleted === 1) {
                        try {
                            const uPtReq = new sql.Request(targetPool);
                            uPtReq.input('TargetTicketId', sql.BigInt, targetTicketId);
                            await uPtReq.query(`
                                IF OBJECT_ID('${PROJECT_TICKET_TABLE}', 'U') IS NOT NULL
                                BEGIN
                                    UPDATE ${PROJECT_TICKET_TABLE}
                                    SET [tick_com_date] = CONVERT(varchar(19), GETDATE(), 120)
                                    WHERE TRY_CAST([Ticket_Id] AS BIGINT) = @TargetTicketId;
                                END
                            `);
                        } catch (ptErr: any) {
                            console.warn('⚠️ syncTicketWorkAndStatus tbl_Project_Ticket update warning:', ptErr.message);
                        }
                    }

                    // 6. Automatically update tbl_Project_Schedule status based on ticket status:
                    //    Closed -> 3 (Completed), Pending -> 2 (Pending), New / Assigned -> 1 (Inprocess)
                    if (targetSchStatus !== null) {
                        try {
                            const uSchReq = new sql.Request(targetPool);
                            uSchReq.input('TargetSchStatus', sql.Int, targetSchStatus);
                            uSchReq.input('TargetTicketId', sql.BigInt, targetTicketId);
                            uSchReq.input('IsCurrentPool', sql.Bit, targetPool === currentPool ? 1 : 0);
                            uSchReq.input('ParamSchId', sql.BigInt, paramSchId ?? 0n);
                            uSchReq.input('ParamTaskId', sql.BigInt, paramTaskId ?? 0n);
                            uSchReq.input('ParamSchNo', sql.NVarChar(100), paramSchNo);
                            uSchReq.input('UpdatedBy', sql.BigInt, updatedBy);
                            await uSchReq.query(`
                                IF OBJECT_ID('[dbo].[tbl_Project_Schedule]', 'U') IS NOT NULL
                                BEGIN
                                    UPDATE [dbo].[tbl_Project_Schedule]
                                    SET [Sch_Status] = @TargetSchStatus,
                                        [Sch_Comp_Date] = CASE WHEN @TargetSchStatus = 3 THEN ISNULL([Sch_Comp_Date], GETDATE()) ELSE NULL END,
                                        [Update_By] = COALESCE(TRY_CAST(@UpdatedBy AS INT), [Update_By]),
                                        [Update_Date] = GETDATE()
                                    WHERE [Sch_Del_Flag] = 0
                                      AND (
                                          (@IsCurrentPool = 1 AND @ParamSchId > 0 AND [Sch_Id] = @ParamSchId)
                                          OR (@IsCurrentPool = 1 AND @ParamTaskId > 0 AND [Task_Id] = @ParamTaskId)
                                          OR (@ParamSchNo <> '' AND [Sch_No] = @ParamSchNo)
                                          OR (
                                              [Sch_No] LIKE 'TCK-%'
                                              AND TRY_CAST(
                                                  REPLACE(
                                                      LEFT(
                                                          SUBSTRING([Sch_No], 5, 50),
                                                          CASE
                                                              WHEN CHARINDEX('-', SUBSTRING([Sch_No], 5, 50)) > 0
                                                              THEN CHARINDEX('-', SUBSTRING([Sch_No], 5, 50)) - 1
                                                              ELSE LEN(SUBSTRING([Sch_No], 5, 50))
                                                          END
                                                      ),
                                                      ' ',
                                                      ''
                                                  ) AS BIGINT
                                              ) = @TargetTicketId
                                          )
                                          OR (
                                              OBJECT_ID('${PROJECT_TICKET_TABLE}', 'U') IS NOT NULL
                                              AND [Task_Id] IN (
                                                  SELECT [Task_Id]
                                                  FROM ${PROJECT_TICKET_TABLE}
                                                  WHERE TRY_CAST([Ticket_Id] AS BIGINT) = @TargetTicketId
                                                    AND [Task_Id] IS NOT NULL
                                              )
                                          )
                                          OR (
                                              OBJECT_ID('${ALLOCATION_TABLE}', 'U') IS NOT NULL
                                              AND [Sch_Id] IN (
                                                  SELECT [T_Sch_Id]
                                                  FROM ${ALLOCATION_TABLE}
                                                  WHERE [Ticket_Id] = @TargetTicketId
                                                    AND [T_Sch_Id] IS NOT NULL
                                              )
                                          )
                                      );
                                END
                            `);
                            invalidateScheduleCache();
                        } catch (schErr: any) {
                            console.warn('⚠️ syncTicketWorkAndStatus tbl_Project_Schedule status update warning:', schErr.message);
                        }
                    }
                }
            } catch (poolErr: any) {
                console.warn('⚠️ Error updating ticket tables in pool:', poolErr.message);
            }
        }

        return {
            synced: true,
            Ticket_Id: info.Ticket_Id,
            Status: ticketStatus || info.Status,
            Othercompany_status: otherCompanyStatus || info.Othercompany_status
        };
    } catch (err: any) {
        console.warn('⚠️ syncTicketWorkAndStatus error:', err.message);
        return { synced: false };
    }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
    try {
        const {
            Id,
            Status,
            Ticket_Status,
            Work_Status,
            Work_Done,
            Task_Id,
            Task_Name,
            Sch_Id,
            Sch_No,
            From_CompanyId,
            To_CompanyId
        } = req.body;

        if (!Id && !Task_Id && !Sch_Id) {
            return invalidInput(res, "Id is required");
        }
        if (!Status && !Ticket_Status && !Work_Status) {
            return invalidInput(res, "Status is required");
        }

        const effectiveStatus = Status || Ticket_Status;
        const pool = await getTicketDbPool(req);
        await ensureTicketColumnsExist(pool);

        let updatedRows = 0;
        if (Id && effectiveStatus) {
            const result = await pool.request()
                .input("Id", sql.BigInt, Id)
                .input("Status", sql.VarChar, effectiveStatus)
                .query(`
                    UPDATE ${TICKET_TABLE}
                    SET Status = @Status,
                        Updated_At = GETDATE()
                    WHERE Id = @Id
                `);
            updatedRows = result.rowsAffected[0] || 0;
        }

        const syncRes = await syncTicketWorkAndStatus(req, {
            ticketId: Id,
            taskId: Task_Id,
            taskName: Task_Name,
            schId: Sch_Id,
            schNo: Sch_No,
            ticketStatus: effectiveStatus,
            workStatus: Work_Status,
            workDone: Work_Done,
            fromCompanyId: From_CompanyId,
            toCompanyId: To_CompanyId
        });

        if (updatedRows === 0 && !syncRes.synced) {
            return failed(res, "Ticket not found or status not updated");
        }

        return success(res, "Ticket status updated successfully", [{
            Id: Id || syncRes.Ticket_Id,
            Status: effectiveStatus || syncRes.Status,
            Othercompany_status: syncRes.Othercompany_status
        }]);
    } catch (err) {
        console.error('Update ticket status error:', err);
        return servError(err, res);
    }
};


