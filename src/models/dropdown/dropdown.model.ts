// src/models/dropdown/dropdown.model.ts
import { QueryTypes, Sequelize } from 'sequelize';
import { verifyTokenSession, getCompanyDatabase } from '../../config/database.config';
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

export interface ProjectStageDropdownItem extends DropdownItem {
    value:       number;
    label:       string;
    Id:          number;
    Project_Id:  number | null;
    Company_Id:  number | null;
    Stage_Name:  string;
    Sort_Order:  number | null;
    IsActive:    number;
    CreatedAt?:  Date | string | null;
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

/**
 * Resolves the active company ID from query params, middleware properties, user record, or token session.
 */
function resolveCompanyId(req: Request, explicitCompanyId?: number): number | undefined {
    if (explicitCompanyId !== undefined && Number.isFinite(explicitCompanyId) && explicitCompanyId > 0) {
        return explicitCompanyId;
    }

    const queryComp = req.query?.companyId ?? req.query?.Company_Id;
    if (queryComp !== undefined && queryComp !== '' && !isNaN(Number(queryComp)) && Number(queryComp) > 0) {
        return Number(queryComp);
    }

    const reqComp = (req as any).currentCompanyId as number | undefined;
    if (reqComp && Number.isFinite(reqComp) && reqComp > 0) {
        return reqComp;
    }

    const userComp = (req as any).user?.Company_Id as number | undefined;
    if (userComp && Number.isFinite(userComp) && userComp > 0) {
        return Number(userComp);
    }

    const token = req.headers?.authorization?.split(' ')[1];
    const session = token ? verifyTokenSession(token) : null;
    if (session?.companyId && session.companyId > 0) {
        return session.companyId;
    }

    return undefined;
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
        return 'Global_User_ID';
    } catch (_) {}

    try {
        await sequelize.query(`SELECT TOP 1 [Local_User_ID] FROM [dbo].[tbl_Users]`, {
            type: QueryTypes.SELECT, raw: true,
        });
        idColumnCache.set(dbName, 'Local_User_ID');
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
    const sequelize = getSequelize(req);
    const companyId = resolveCompanyId(req);

    // Primary table in this codebase is tbl_Task; fallback to tbl_Task_Master
    try {
        let query = `
            SELECT [Task_Id] AS value, [Task_Name] AS label
            FROM   [dbo].[tbl_Task] WITH (NOLOCK)
            WHERE  1 = 1
        `;
        const replacements: Record<string, any> = {};
        if (companyId) {
            query += ` AND ([Company_Id] = :companyId OR [Company_Id] IS NULL)`;
            replacements.companyId = companyId;
        }
        query += ` ORDER BY [Task_Name] ASC`;

        const rows = await sequelize.query<{ value: number; label: string }>(query, {
            replacements,
            type: QueryTypes.SELECT,
            raw: true,
        });
        return rows.filter(r => r.label != null).map(r => ({ value: r.value, label: r.label || '' }));
    } catch (_) {
        try {
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
    }
};

// ─── getProjects ──────────────────────────────────────────────────────────────

export const getProjects = async (
    activeOnly: boolean = true,
    req?: Request,
): Promise<DropdownItem[]> => {
    if (!req) throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const companyId = resolveCompanyId(req);

    let query = `
        SELECT [Project_Id] AS value, [Project_Name] AS label
        FROM   [dbo].[tbl_Project_Master]
        WHERE  1 = 1
    `;
    const replacements: Record<string, any> = {};
    if (activeOnly) query += ` AND [IsActive] = 1`;
    if (companyId) {
        query += ` AND ([Company_Id] = :companyId OR [Company_Id] IS NULL)`;
        replacements.companyId = companyId;
    }
    query += ` ORDER BY [Project_Name] ASC`;

    const rows = await sequelize.query<{ value: number; label: string }>(query, {
        replacements,
        type: QueryTypes.SELECT,
        raw: true,
    });

    return rows.filter(r => r.label != null).map(r => ({ value: r.value, label: r.label || '' }));
};

// ─── getProjectStages ─────────────────────────────────────────────────────────

function mapProjectStageRows(rows: any[]): ProjectStageDropdownItem[] {
    return (rows || [])
        .filter(r => (r?.Stage_Name ?? r?.label) != null)
        .map(r => {
            const id = Number(r.Id ?? r.value ?? 0);
            const stageName = String(r.Stage_Name ?? r.label ?? '').trim();
            const isActiveRaw = r.IsActive;
            const isActive =
                isActiveRaw === true || isActiveRaw === 1 || isActiveRaw === '1'
                    ? 1
                    : isActiveRaw === false || isActiveRaw === 0 || isActiveRaw === '0'
                    ? 0
                    : 1;

            return {
                value:      id,
                label:      stageName,
                Id:         id,
                Project_Id: r.Project_Id != null ? Number(r.Project_Id) : null,
                Company_Id: r.Company_Id != null ? Number(r.Company_Id) : null,
                Stage_Name: stageName,
                Sort_Order: r.Sort_Order != null ? Number(r.Sort_Order) : null,
                IsActive:   isActive,
                CreatedAt:  r.CreatedAt ?? null,
            };
        });
}

async function queryProjectStageTable(
    db: Sequelize,
    tableRef: string,
    activeOnly: boolean,
    companyId?: number,
    projectId?: number,
): Promise<any[]> {
    let query = `
        SELECT TOP (1000)
            [Id],
            [Project_Id],
            [Company_Id],
            [Stage_Name],
            [Sort_Order],
            CAST([IsActive] AS INT) AS [IsActive],
            [CreatedAt],
            [Id] AS [value],
            [Stage_Name] AS [label]
        FROM ${tableRef} WITH (NOLOCK)
        WHERE 1 = 1
    `;
    const replacements: Record<string, any> = {};

    if (activeOnly) {
        query += ` AND [IsActive] = 1`;
    }
    if (companyId !== undefined && Number.isFinite(companyId) && companyId > 0) {
        query += ` AND [Company_Id] = :companyId`;
        replacements.companyId = companyId;
    }
    if (projectId !== undefined && Number.isFinite(projectId) && projectId > 0) {
        query += ` AND [Project_Id] = :projectId`;
        replacements.projectId = projectId;
    }

    query += ` ORDER BY ISNULL([Sort_Order], 2147483647) ASC, [Id] ASC`;

    return db.query<any>(query, {
        replacements,
        type: QueryTypes.SELECT,
        raw: true,
    });
}

/**
 * Retrieves project stages from [dbo].[tbl_Project_Stage] for the logged-in company.
 * Connects to the company DB via req.companyDB (or explicit companyId) and filters by Company_Id,
 * optional Project_Id, and IsActive status, ordered by Sort_Order ASC.
 */
export const getProjectStages = async (
    activeOnly: boolean = true,
    req?: Request,
    projectId?: number,
    companyId?: number,
): Promise<ProjectStageDropdownItem[]> => {
    if (!req) throw new Error('Request object is required');

    let sequelize = getSequelize(req);
    const resolvedCompanyId = resolveCompanyId(req, companyId);

    const queryProj = req.query?.projectId ?? req.query?.Project_Id;
    const resolvedProjectId =
        projectId !== undefined && Number.isFinite(projectId) && projectId > 0
            ? projectId
            : queryProj !== undefined && queryProj !== '' && !isNaN(Number(queryProj)) && Number(queryProj) > 0
            ? Number(queryProj)
            : undefined;

    // If an explicit companyId was requested that differs from req.currentCompanyId, try switching DB connection
    if (
        companyId &&
        (req as any).currentCompanyId &&
        companyId !== (req as any).currentCompanyId
    ) {
        try {
            const targetDb = await getCompanyDatabase(companyId);
            if (targetDb) sequelize = targetDb;
        } catch (_) {}
    }

    // 1. Primary lookup: [dbo].[tbl_Project_Stage] on the connected company DB
    try {
        const rows = await queryProjectStageTable(
            sequelize,
            '[dbo].[tbl_Project_Stage]',
            activeOnly,
            resolvedCompanyId,
            resolvedProjectId,
        );
        if (rows.length > 0) {
            return mapProjectStageRows(rows);
        }
    } catch (_) {}

    // 2. Same-server fallback: [ERP_DB_TEST_25_09_2026].[dbo].[tbl_Project_Stage]
    try {
        const rows = await queryProjectStageTable(
            sequelize,
            '[ERP_DB_TEST_25_09_2026].[dbo].[tbl_Project_Stage]',
            activeOnly,
            resolvedCompanyId,
            resolvedProjectId,
        );
        if (rows.length > 0) {
            return mapProjectStageRows(rows);
        }
    } catch (_) {}

    // 3. Cross-server fallback if table resides on Company 1's SQL instance (ERP_DB_TEST_25_09_2026)
    try {
        const comp1Db = await getCompanyDatabase(1);
        if (comp1Db && comp1Db !== sequelize) {
            try {
                const rows = await queryProjectStageTable(
                    comp1Db,
                    '[ERP_DB_TEST_25_09_2026].[dbo].[tbl_Project_Stage]',
                    activeOnly,
                    resolvedCompanyId,
                    resolvedProjectId,
                );
                if (rows.length > 0) {
                    return mapProjectStageRows(rows);
                }
            } catch (_) {}

            try {
                const rows = await queryProjectStageTable(
                    comp1Db,
                    '[dbo].[tbl_Project_Stage]',
                    activeOnly,
                    resolvedCompanyId,
                    resolvedProjectId,
                );
                if (rows.length > 0) {
                    return mapProjectStageRows(rows);
                }
            } catch (_) {}
        }
    } catch (_) {}

    return [];
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
    projectStages: ProjectStageDropdownItem[];
    companies:     DropdownItem[];
}> => {
    const [ph, ps, emp, tasks, proj, stages, comp] = await Promise.allSettled([
        getProjectHeads(activeOnly, req),
        getProjectStatus(),
        getEmployees(activeOnly, req),
        getTasks(activeOnly, req),
        getProjects(activeOnly, req),
        getProjectStages(activeOnly, req),
        getCompany(activeOnly, req),
    ]);

    return {
        projectHeads:  ph.status     === 'fulfilled' ? ph.value     : [],
        projectStatus: ps.status     === 'fulfilled' ? ps.value     : [],
        employees:     emp.status    === 'fulfilled' ? emp.value    : [],
        tasks:         tasks.status  === 'fulfilled' ? tasks.value  : [],
        projects:      proj.status   === 'fulfilled' ? proj.value   : [],
        projectStages: stages.status === 'fulfilled' ? stages.value : [],
        companies:     comp.status   === 'fulfilled' ? comp.value   : [],
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
    getProjectStages,
    getAllDropdowns,
    getCompany,
    getUsersByType,
    getUsersByBranch,
    getUsersByCompany,
    getAllActiveUsers,
};