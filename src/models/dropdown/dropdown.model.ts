// src/models/dropdown/dropdown.model.ts
import { QueryTypes, Sequelize } from 'sequelize';
import { verifyTokenSession }    from '../../config/database.config';
import { Request }               from 'express';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface DropdownItem {
    value: string | number;
    label: string;
}

export interface ProjectHeadItem {
    UserId: string | number;
    label:  string;
}

// ─── Internal helper ──────────────────────────────────────────────────────────

/**
 * Gets the company Sequelize instance from req.companyDB.
 * This is set by the authenticate + setCompanyDatabase middleware chain.
 * Throws clearly if middleware was not applied.
 */
function getSequelize(req: Request): Sequelize {
    const db = (req as any).companyDB as Sequelize | undefined;
    if (!db) {
        throw new Error(
            'req.companyDB is not set. ' +
            'Ensure authenticate and setCompanyDatabase middleware run before this handler.'
        );
    }
    return db;
}

// ─── ID column resolver ───────────────────────────────────────────────────────

const idColumnCache = new Map<string, string>();

async function resolveUserIdColumn(sequelize: Sequelize): Promise<string> {
    const dbName = sequelize.config.database || 'default';
    if (idColumnCache.has(dbName)) return idColumnCache.get(dbName)!;

    try {
        await sequelize.query(`SELECT TOP 1 [Global_User_ID] FROM [dbo].[tbl_Users]`, {
            type: QueryTypes.SELECT, raw: true,
        });
        idColumnCache.set(dbName, 'Global_User_ID');
        console.log(`[resolveUserIdColumn] Using Global_User_ID for ${dbName}`);
        return 'Global_User_ID';
    } catch (_) {}

    try {
        await sequelize.query(`SELECT TOP 1 [Local_User_ID] FROM [dbo].[tbl_Users]`, {
            type: QueryTypes.SELECT, raw: true,
        });
        idColumnCache.set(dbName, 'Local_User_ID');
        console.log(`[resolveUserIdColumn] Using Local_User_ID for ${dbName}`);
        return 'Local_User_ID';
    } catch (_) {}

    idColumnCache.set(dbName, 'Global_User_ID');
    return 'Global_User_ID';
}

// ─── Shared user fetcher ──────────────────────────────────────────────────────

async function fetchUsers(
    sequelize:    Sequelize,
    idCol:        string,
    activeOnly:   boolean,
    extraWhere:   string              = '',
    replacements: Record<string, any> = {},
): Promise<DropdownItem[]> {
    let query = `
        SELECT [${idCol}] AS value, [Name] AS label
        FROM   [dbo].[tbl_Users]
        WHERE  1 = 1
    `;
    if (activeOnly) query += ` AND [UDel_Flag] = 0`;
    if (extraWhere) query += ` ${extraWhere}`;
    query += ` ORDER BY [Name] ASC`;

    const rows = await sequelize.query<{ value: number; label: string }>(query, {
        replacements, type: QueryTypes.SELECT, raw: true,
    });

    return rows
        .filter(r => r.label != null)
        .map(r => ({ value: r.value, label: r.label || '' }));
}

// ─── getProjectHeads ──────────────────────────────────────────────────────────

export const getProjectHeads = async (
    activeOnly: boolean = true,
    req?: Request,
): Promise<ProjectHeadItem[]> => {
    if (!req) throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol     = await resolveUserIdColumn(sequelize);

    let query = `
        SELECT [${idCol}] AS [UserId], [Name] AS [label]
        FROM   [dbo].[tbl_Users]
        WHERE  1 = 1
    `;
    if (activeOnly) query += ` AND [UDel_Flag] = 0`;
    query += ` ORDER BY [Name] ASC`;

    const rows = await sequelize.query<{ UserId: number; label: string }>(query, {
        type: QueryTypes.SELECT, raw: true,
    });

    console.log(`[getProjectHeads] DB: ${sequelize.config.database} | rows: ${rows.length}`);
    return rows
        .filter(r => r.label != null)
        .map(r => ({ UserId: r.UserId, label: r.label || '' }));
};

// ─── getProjectStatus ─────────────────────────────────────────────────────────

export const getProjectStatus = async (): Promise<DropdownItem[]> => [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' },
];

// ─── getEmployees ─────────────────────────────────────────────────────────────

export const getEmployees = async (
    activeOnly: boolean = true,
    req?: Request,
): Promise<DropdownItem[]> => {
    if (!req) throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol     = await resolveUserIdColumn(sequelize);
    console.log(`[getEmployees] DB: ${sequelize.config.database}`);
    return fetchUsers(sequelize, idCol, activeOnly);
};

// ─── searchEmployees ──────────────────────────────────────────────────────────

export const searchEmployees = async (
    searchTerm: string,
    activeOnly: boolean = true,
    req?: Request,
): Promise<DropdownItem[]> => {
    if (!req) throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol     = await resolveUserIdColumn(sequelize);
    return fetchUsers(sequelize, idCol, activeOnly,
        `AND [Name] LIKE :searchTerm`, { searchTerm: `%${searchTerm}%` });
};

// ─── getTasks ─────────────────────────────────────────────────────────────────

export const getTasks = async (
    activeOnly: boolean = true,
    req?: Request,
): Promise<DropdownItem[]> => {
    if (!req) throw new Error('Request object is required');
    try {
        const sequelize = getSequelize(req);
        let query = `
            SELECT [Task_Id] AS value, [Task_Name] AS label
            FROM   [dbo].[tbl_Task_Master]
            WHERE  1 = 1
        `;
        if (activeOnly) query += ` AND [IsActive] = 1`;
        query += ` ORDER BY [Task_Name] ASC`;

        const rows = await sequelize.query<{ value: number; label: string }>(query, {
            type: QueryTypes.SELECT, raw: true,
        });
        return rows.filter(r => r.label != null).map(r => ({ value: r.value, label: r.label || '' }));
    } catch (err) {
        console.warn('[getTasks] Table not found, returning empty:', (err as Error).message);
        return [];
    }
};

// ─── getProjects ──────────────────────────────────────────────────────────────

export const getProjects = async (
    activeOnly: boolean = true,
    req?: Request,
): Promise<DropdownItem[]> => {
    if (!req) throw new Error('Request object is required');
    const sequelize = getSequelize(req);

    let query = `
        SELECT [Project_Id] AS value, [Project_Name] AS label
        FROM   [dbo].[tbl_Project_Master]
        WHERE  1 = 1
    `;
    if (activeOnly) query += ` AND [IsActive] = 1`;
    query += ` ORDER BY [Project_Name] ASC`;

    const rows = await sequelize.query<{ value: number; label: string }>(query, {
        type: QueryTypes.SELECT, raw: true,
    });

    console.log(`[getProjects] DB: ${sequelize.config.database} | rows: ${rows.length}`);
    return rows.filter(r => r.label != null).map(r => ({ value: r.value, label: r.label || '' }));
};

// ─── getCompany ───────────────────────────────────────────────────────────────

/**
 * Returns the logged-in user's company from the token session.
 * companyId and companyName are stored at login via storeTokenSession().
 * No DB query needed unless companyName is missing from session.
 *
 * Response: [{ value: 1, label: "SMT TEST" }]
 */
export const getCompany = async (
    activeOnly: boolean = true,
    req?: Request,
): Promise<DropdownItem[]> => {
    if (!req) throw new Error('Request object is required');

    // Read from req — set by authenticate + setCompanyDatabase middleware
    const companyId   = (req as any).currentCompanyId as number | undefined;
    const companyName = (req as any).currentCompanyName as string | undefined;

    // Fallback: read directly from token session
    const token   = req.headers.authorization?.split(' ')[1];
    const session = token ? verifyTokenSession(token) : null;

    const resolvedId   = companyId   ?? session?.companyId;
    const resolvedName = companyName ?? session?.companyName;

    console.log(`[getCompany] companyId=${resolvedId} | companyName=${resolvedName}`);

    if (!resolvedId) {
        console.warn('[getCompany] No companyId found');
        return [];
    }

    // Return directly from session — no DB call needed
    if (resolvedName) {
        return [{ value: resolvedId, label: resolvedName }];
    }

    // Fallback: query company DB for name
    try {
        const sequelize = getSequelize(req);
        const candidates = [
            { table: 'tbl_Company',     idCol: 'Local_Comp_Id', nameCol: 'Company_Name' },
            { table: 'tbl_Company',     idCol: 'Company_Id',    nameCol: 'Company_Name' },
            { table: 'CompanyMaster',   idCol: 'Company_Id',    nameCol: 'Company_Name' },
            { table: 'tbl_CompanyInfo', idCol: 'Company_Id',    nameCol: 'Company_Name' },
        ];
        for (const c of candidates) {
            try {
                const rows = await sequelize.query<{ value: number; label: string }>(
                    `SELECT TOP 1 [${c.idCol}] AS value, [${c.nameCol}] AS label
                     FROM [dbo].[${c.table}] WHERE [${c.idCol}] = :id`,
                    { replacements: { id: resolvedId }, type: QueryTypes.SELECT, raw: true },
                );
                if (rows.length && rows[0].label) {
                    return [{ value: rows[0].value, label: rows[0].label }];
                }
            } catch (_) {}
        }
    } catch (_) {}

    return [{ value: resolvedId, label: `Company ${resolvedId}` }];
};

// ─── getAllDropdowns ──────────────────────────────────────────────────────────

export const getAllDropdowns = async (
    activeOnly: boolean = true,
    req?: Request,
): Promise<{
    projectHeads:  ProjectHeadItem[];
    projectStatus: DropdownItem[];
    employees:     DropdownItem[];
    tasks:         DropdownItem[];
    projects:      DropdownItem[];
    companies:     DropdownItem[];
}> => {
    const [ph, ps, emp, tasks, proj, comp] = await Promise.allSettled([
        getProjectHeads(activeOnly, req),
        getProjectStatus(),
        getEmployees(activeOnly, req),
        getTasks(activeOnly, req),
        getProjects(activeOnly, req),
        getCompany(activeOnly, req),
    ]);

    return {
        projectHeads:  ph.status    === 'fulfilled' ? ph.value    : [],
        projectStatus: ps.status    === 'fulfilled' ? ps.value    : [],
        employees:     emp.status   === 'fulfilled' ? emp.value   : [],
        tasks:         tasks.status === 'fulfilled' ? tasks.value : [],
        projects:      proj.status  === 'fulfilled' ? proj.value  : [],
        companies:     comp.status  === 'fulfilled' ? comp.value  : [],
    };
};

// ─── Extra helpers ────────────────────────────────────────────────────────────

export const getUsersByType = async (
    userTypeIds: number[], activeOnly = true, req?: Request,
): Promise<DropdownItem[]> => {
    if (!req) throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol     = await resolveUserIdColumn(sequelize);
    const list      = userTypeIds.map(Number).filter(Number.isFinite).join(',');
    if (!list) return [];
    return fetchUsers(sequelize, idCol, activeOnly, `AND [UserTypeId] IN (${list})`);
};

export const getUsersByBranch = async (
    branchId: number, activeOnly = true, req?: Request,
): Promise<DropdownItem[]> => {
    if (!req) throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol     = await resolveUserIdColumn(sequelize);
    return fetchUsers(sequelize, idCol, activeOnly, `AND [BranchId] = :branchId`, { branchId });
};

export const getUsersByCompany = async (
    companyId: number, activeOnly = true, req?: Request,
): Promise<DropdownItem[]> => {
    if (!req) throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol     = await resolveUserIdColumn(sequelize);
    return fetchUsers(sequelize, idCol, activeOnly, `AND [Company_Id] = :companyId`, { companyId });
};

export const getAllActiveUsers = async (req?: Request): Promise<DropdownItem[]> => {
    if (!req) throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol     = await resolveUserIdColumn(sequelize);
    return fetchUsers(sequelize, idCol, true);
};

export default {
    getProjectHeads,
    getProjectStatus,
    getEmployees,
    searchEmployees,
    getTasks,
    getProjects,
    getAllDropdowns,
    getCompany,
    getUsersByType,
    getUsersByBranch,
    getUsersByCompany,
    getAllActiveUsers,
};