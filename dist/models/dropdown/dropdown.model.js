"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllActiveUsers = exports.getUsersByCompany = exports.getUsersByBranch = exports.getUsersByType = exports.getAllDropdowns = exports.getCompany = exports.getProjects = exports.getTasks = exports.searchEmployees = exports.getEmployees = exports.getProjectStatus = exports.getProjectHeads = void 0;
// src/models/dropdown/dropdown.model.ts
const sequelize_1 = require("sequelize");
const database_config_1 = require("../../config/database.config");
// ─── Internal helper ──────────────────────────────────────────────────────────
/**
 * Gets the company Sequelize instance from req.companyDB.
 * This is set by the authenticate + setCompanyDatabase middleware chain.
 * Throws clearly if middleware was not applied.
 */
function getSequelize(req) {
    const db = req.companyDB;
    if (!db) {
        throw new Error('req.companyDB is not set. ' +
            'Ensure authenticate and setCompanyDatabase middleware run before this handler.');
    }
    return db;
}
// ─── ID column resolver ───────────────────────────────────────────────────────
const idColumnCache = new Map();
async function resolveUserIdColumn(sequelize) {
    const dbName = sequelize.config.database || 'default';
    if (idColumnCache.has(dbName))
        return idColumnCache.get(dbName);
    try {
        await sequelize.query(`SELECT TOP 1 [Global_User_ID] FROM [dbo].[tbl_Users]`, {
            type: sequelize_1.QueryTypes.SELECT, raw: true,
        });
        idColumnCache.set(dbName, 'Global_User_ID');
        console.log(`[resolveUserIdColumn] Using Global_User_ID for ${dbName}`);
        return 'Global_User_ID';
    }
    catch (_) { }
    try {
        await sequelize.query(`SELECT TOP 1 [Local_User_ID] FROM [dbo].[tbl_Users]`, {
            type: sequelize_1.QueryTypes.SELECT, raw: true,
        });
        idColumnCache.set(dbName, 'Local_User_ID');
        console.log(`[resolveUserIdColumn] Using Local_User_ID for ${dbName}`);
        return 'Local_User_ID';
    }
    catch (_) { }
    idColumnCache.set(dbName, 'Global_User_ID');
    return 'Global_User_ID';
}
// ─── Shared user fetcher ──────────────────────────────────────────────────────
async function fetchUsers(sequelize, idCol, activeOnly, extraWhere = '', replacements = {}) {
    let query = `
        SELECT [${idCol}] AS value, [Name] AS label
        FROM   [dbo].[tbl_Users]
        WHERE  1 = 1
    `;
    if (activeOnly)
        query += ` AND [UDel_Flag] = 0`;
    if (extraWhere)
        query += ` ${extraWhere}`;
    query += ` ORDER BY [Name] ASC`;
    const rows = await sequelize.query(query, {
        replacements, type: sequelize_1.QueryTypes.SELECT, raw: true,
    });
    return rows
        .filter(r => r.label != null)
        .map(r => ({ value: r.value, label: r.label || '' }));
}
// ─── getProjectHeads ──────────────────────────────────────────────────────────
const getProjectHeads = async (activeOnly = true, req) => {
    if (!req)
        throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol = await resolveUserIdColumn(sequelize);
    let query = `
        SELECT [${idCol}] AS [UserId], [Name] AS [label]
        FROM   [dbo].[tbl_Users]
        WHERE  1 = 1
    `;
    if (activeOnly)
        query += ` AND [UDel_Flag] = 0`;
    query += ` ORDER BY [Name] ASC`;
    const rows = await sequelize.query(query, {
        type: sequelize_1.QueryTypes.SELECT, raw: true,
    });
    console.log(`[getProjectHeads] DB: ${sequelize.config.database} | rows: ${rows.length}`);
    return rows
        .filter(r => r.label != null)
        .map(r => ({ UserId: r.UserId, label: r.label || '' }));
};
exports.getProjectHeads = getProjectHeads;
// ─── getProjectStatus ─────────────────────────────────────────────────────────
const getProjectStatus = async () => [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' },
];
exports.getProjectStatus = getProjectStatus;
// ─── getEmployees ─────────────────────────────────────────────────────────────
const getEmployees = async (activeOnly = true, req) => {
    if (!req)
        throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol = await resolveUserIdColumn(sequelize);
    console.log(`[getEmployees] DB: ${sequelize.config.database}`);
    return fetchUsers(sequelize, idCol, activeOnly);
};
exports.getEmployees = getEmployees;
// ─── searchEmployees ──────────────────────────────────────────────────────────
const searchEmployees = async (searchTerm, activeOnly = true, req) => {
    if (!req)
        throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol = await resolveUserIdColumn(sequelize);
    return fetchUsers(sequelize, idCol, activeOnly, `AND [Name] LIKE :searchTerm`, { searchTerm: `%${searchTerm}%` });
};
exports.searchEmployees = searchEmployees;
// ─── getTasks ─────────────────────────────────────────────────────────────────
const getTasks = async (activeOnly = true, req) => {
    if (!req)
        throw new Error('Request object is required');
    try {
        const sequelize = getSequelize(req);
        let query = `
            SELECT [Task_Id] AS value, [Task_Name] AS label
            FROM   [dbo].[tbl_Task_Master]
            WHERE  1 = 1
        `;
        if (activeOnly)
            query += ` AND [IsActive] = 1`;
        query += ` ORDER BY [Task_Name] ASC`;
        const rows = await sequelize.query(query, {
            type: sequelize_1.QueryTypes.SELECT, raw: true,
        });
        return rows.filter(r => r.label != null).map(r => ({ value: r.value, label: r.label || '' }));
    }
    catch (err) {
        console.warn('[getTasks] Table not found, returning empty:', err.message);
        return [];
    }
};
exports.getTasks = getTasks;
// ─── getProjects ──────────────────────────────────────────────────────────────
const getProjects = async (activeOnly = true, req) => {
    if (!req)
        throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    let query = `
        SELECT [Project_Id] AS value, [Project_Name] AS label
        FROM   [dbo].[tbl_Project_Master]
        WHERE  1 = 1
    `;
    if (activeOnly)
        query += ` AND [IsActive] = 1`;
    query += ` ORDER BY [Project_Name] ASC`;
    const rows = await sequelize.query(query, {
        type: sequelize_1.QueryTypes.SELECT, raw: true,
    });
    console.log(`[getProjects] DB: ${sequelize.config.database} | rows: ${rows.length}`);
    return rows.filter(r => r.label != null).map(r => ({ value: r.value, label: r.label || '' }));
};
exports.getProjects = getProjects;
// ─── getCompany ───────────────────────────────────────────────────────────────
/**
 * Returns the logged-in user's company from the token session.
 * companyId and companyName are stored at login via storeTokenSession().
 * No DB query needed unless companyName is missing from session.
 *
 * Response: [{ value: 1, label: "SMT TEST" }]
 */
const getCompany = async (activeOnly = true, req) => {
    if (!req)
        throw new Error('Request object is required');
    // Read from req — set by authenticate + setCompanyDatabase middleware
    const companyId = req.currentCompanyId;
    const companyName = req.currentCompanyName;
    // Fallback: read directly from token session
    const token = req.headers.authorization?.split(' ')[1];
    const session = token ? (0, database_config_1.verifyTokenSession)(token) : null;
    const resolvedId = companyId ?? session?.companyId;
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
            { table: 'tbl_Company', idCol: 'Local_Comp_Id', nameCol: 'Company_Name' },
            { table: 'tbl_Company', idCol: 'Company_Id', nameCol: 'Company_Name' },
            { table: 'CompanyMaster', idCol: 'Company_Id', nameCol: 'Company_Name' },
            { table: 'tbl_CompanyInfo', idCol: 'Company_Id', nameCol: 'Company_Name' },
        ];
        for (const c of candidates) {
            try {
                const rows = await sequelize.query(`SELECT TOP 1 [${c.idCol}] AS value, [${c.nameCol}] AS label
                     FROM [dbo].[${c.table}] WHERE [${c.idCol}] = :id`, { replacements: { id: resolvedId }, type: sequelize_1.QueryTypes.SELECT, raw: true });
                if (rows.length && rows[0].label) {
                    return [{ value: rows[0].value, label: rows[0].label }];
                }
            }
            catch (_) { }
        }
    }
    catch (_) { }
    return [{ value: resolvedId, label: `Company ${resolvedId}` }];
};
exports.getCompany = getCompany;
// ─── getAllDropdowns ──────────────────────────────────────────────────────────
const getAllDropdowns = async (activeOnly = true, req) => {
    const [ph, ps, emp, tasks, proj, comp] = await Promise.allSettled([
        (0, exports.getProjectHeads)(activeOnly, req),
        (0, exports.getProjectStatus)(),
        (0, exports.getEmployees)(activeOnly, req),
        (0, exports.getTasks)(activeOnly, req),
        (0, exports.getProjects)(activeOnly, req),
        (0, exports.getCompany)(activeOnly, req),
    ]);
    return {
        projectHeads: ph.status === 'fulfilled' ? ph.value : [],
        projectStatus: ps.status === 'fulfilled' ? ps.value : [],
        employees: emp.status === 'fulfilled' ? emp.value : [],
        tasks: tasks.status === 'fulfilled' ? tasks.value : [],
        projects: proj.status === 'fulfilled' ? proj.value : [],
        companies: comp.status === 'fulfilled' ? comp.value : [],
    };
};
exports.getAllDropdowns = getAllDropdowns;
// ─── Extra helpers ────────────────────────────────────────────────────────────
const getUsersByType = async (userTypeIds, activeOnly = true, req) => {
    if (!req)
        throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol = await resolveUserIdColumn(sequelize);
    const list = userTypeIds.map(Number).filter(Number.isFinite).join(',');
    if (!list)
        return [];
    return fetchUsers(sequelize, idCol, activeOnly, `AND [UserTypeId] IN (${list})`);
};
exports.getUsersByType = getUsersByType;
const getUsersByBranch = async (branchId, activeOnly = true, req) => {
    if (!req)
        throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol = await resolveUserIdColumn(sequelize);
    return fetchUsers(sequelize, idCol, activeOnly, `AND [BranchId] = :branchId`, { branchId });
};
exports.getUsersByBranch = getUsersByBranch;
const getUsersByCompany = async (companyId, activeOnly = true, req) => {
    if (!req)
        throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol = await resolveUserIdColumn(sequelize);
    return fetchUsers(sequelize, idCol, activeOnly, `AND [Company_Id] = :companyId`, { companyId });
};
exports.getUsersByCompany = getUsersByCompany;
const getAllActiveUsers = async (req) => {
    if (!req)
        throw new Error('Request object is required');
    const sequelize = getSequelize(req);
    const idCol = await resolveUserIdColumn(sequelize);
    return fetchUsers(sequelize, idCol, true);
};
exports.getAllActiveUsers = getAllActiveUsers;
exports.default = {
    getProjectHeads: exports.getProjectHeads,
    getProjectStatus: exports.getProjectStatus,
    getEmployees: exports.getEmployees,
    searchEmployees: exports.searchEmployees,
    getTasks: exports.getTasks,
    getProjects: exports.getProjects,
    getAllDropdowns: exports.getAllDropdowns,
    getCompany: exports.getCompany,
    getUsersByType: exports.getUsersByType,
    getUsersByBranch: exports.getUsersByBranch,
    getUsersByCompany: exports.getUsersByCompany,
    getAllActiveUsers: exports.getAllActiveUsers,
};
