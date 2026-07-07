// controllers/authorization/appMenu.controller.ts
import { Request, Response } from 'express';
import { QueryTypes, Sequelize } from 'sequelize';
import {
    getDefaultConnection,
    getUserDatabaseConnectionFromToken,
    getCompanyIdFromToken,
} from '../../../config/database.config';
import dotenv from 'dotenv';

dotenv.config();

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuRow {
    id: number;
    name: string;
    menu_type: number;
    parent_id: number | null;
    url: string;
    tUrl: string;
    rUrl: string;
    actionType: string;
    display_order: number;
    is_active: number;
    Read_Rights: number;
    Add_Rights: number;
    Edit_Rights: number;
    Delete_Rights: number;
    Print_Rights: number;
    ParantData?: Record<string, unknown>;
    [key: string]: unknown;
}

interface MenuWithChildren extends MenuRow {
    SubMenu?: MenuWithChildren[];
    ChildMenu?: MenuWithChildren[];
    SubRoutes?: MenuWithChildren[];
}

interface ModifyUserRightsBody {
    MenuId: number;
    User: number;
    ReadRights: number;
    AddRights: number;
    EditRights: number;
    DeleteRights: number;
    PrintRights: number;
}

interface ModifyUserTypeRightsBody {
    MenuId: number;
    UserType: number;
    ReadRights: number;
    AddRights: number;
    EditRights: number;
    DeleteRights: number;
    PrintRights: number;
}

interface CreateMenuBody {
    name: string;
    menu_type: number;
    parent_id?: number | null;
    url: string;
    tUrl: string;
    rUrl: string;
    display_order: number;
    is_active?: number;
    actionType?: string;
}

interface UpdateMenuBody extends CreateMenuBody {
    id: number;
}

interface UserInfo {
    userTypeId: number;
    globalUserId: number;
    localUserId: number;
}

interface CompanyRawConfig {
    id: number;
    name: string;
    rawHost: string;
    user: string;
    password: string;
    database: string;
}

// Cache for User Portal connections per company
const userPortalConnections: Map<number, Sequelize> = new Map();

// Store raw company configurations
const companyRawConfigs: Map<number, CompanyRawConfig> = new Map();

// Load raw company configurations from environment
const loadRawCompanyConfigurations = (): void => {
    console.log('📂 Loading raw company configurations from .env...');
    
    for (let i = 1; i <= 10; i++) {
        const companyId = parseInt(process.env[`COMPANY${i}_ID`] ?? '0', 10);
        const dbName = process.env[`COMPANY${i}_DATABASE`];
        const dbHost = process.env[`COMPANY${i}_DB_HOST`];
        const dbUser = process.env[`COMPANY${i}_DB_USER`];
        const dbPassword = process.env[`COMPANY${i}_DB_PASSWORD`];
        const companyName = process.env[`COMPANY${i}_NAME`];

        if (!companyId || !dbName || !dbHost || !dbUser || !dbPassword) continue;

        const config: CompanyRawConfig = {
            id: companyId,
            name: companyName ?? `Company ${companyId}`,
            rawHost: dbHost,
            user: dbUser,
            password: dbPassword,
            database: dbName,
        };

        companyRawConfigs.set(companyId, config);
        console.log(`✅ Loaded raw config for Company ${companyId}: ${config.name}`);
        console.log(`   Raw Host: ${config.rawHost}`);
    }
    
    console.log(`📊 Total raw companies loaded: ${companyRawConfigs.size}`);
};

loadRawCompanyConfigurations();

// ─── Response helpers ────────────────────────────────────────────────────────

const dataFound = (
    res: Response,
    data: unknown,
    message = 'Data Found',
    others: Record<string, unknown> = {},
): void => {
    res.status(200).json({ status: true, message, data, ...others });
};

const failed = (res: Response, message = 'No data found'): void => {
    res.status(200).json({ status: false, message, data: [] });
};

const invalidInput = (res: Response, message = 'Invalid input'): void => {
    res.status(400).json({ status: false, message, data: null });
};

const success = (res: Response, message = 'Success'): void => {
    res.status(200).json({ status: true, message });
};

const servError = (e: unknown, res: Response): void => {
    console.error(e);
    res.status(500).json({ status: false, message: 'Server error', error: String(e) });
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

const isEqualNumber = (a: unknown, b: unknown): boolean =>
    Number(a) === Number(b);

const isValidNumber = (v: unknown): boolean =>
    v !== null && v !== undefined && v !== '' && !isNaN(Number(v));

const stringCompare = (a: unknown, b: unknown): boolean =>
    String(a).toLowerCase().trim() === String(b).toLowerCase().trim();

// ─── Token extractor ──────────────────────────────────────────────────────────

const extractToken = (req: Request): string | null => {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) return header.substring(7).trim();
    return header ?? null;
};

// ─── Route-tree builder ───────────────────────────────────────────────────────

const buildRoutesTree = (
    routes: MenuRow[],
    parentId: number | null = null,
): MenuWithChildren[] => {
    return routes
        .filter(r => r.parent_id === parentId)
        .map(r => ({
            ...r,
            SubRoutes: buildRoutesTree(routes, r.id),
        }));
};

// ─── Menu structure builder ───────────────────────────────────────────────────

const buildMenuStructure = (rows: MenuRow[]): MenuWithChildren[] => {
    const mainMenu = rows.filter(m => isEqualNumber(m.menu_type, 1)).sort((a, b) => a.display_order - b.display_order);
    const subMenu = rows.filter(m => isEqualNumber(m.menu_type, 2)).sort((a, b) => a.display_order - b.display_order);
    const childMenu = rows.filter(m => isEqualNumber(m.menu_type, 3)).sort((a, b) => a.display_order - b.display_order);
    const subRoutings = rows
        .filter(m => isEqualNumber(m.menu_type, 0))
        .sort((a, b) => (a.parent_id ?? 0) - (b.parent_id ?? 0));

    return mainMenu.map(main => ({
        ...main,
        SubMenu: subMenu
            .filter(sub => isEqualNumber(sub.parent_id, main.id))
            .map(sub => ({
                ...sub,
                ChildMenu: childMenu
                    .filter(child => isEqualNumber(child.parent_id, sub.id))
                    .map(child => ({
                        ...child,
                        SubRoutes: buildRoutesTree(subRoutings, child.id),
                    })),
                SubRoutes: buildRoutesTree(subRoutings, sub.id),
            })),
        SubRoutes: buildRoutesTree(subRoutings, main.id),
    }));
};

// ─── Helper: get company DB connection (for rights tables) ────────────────────

const getCompanyDB = async (token: string | null): Promise<Sequelize> => {
    if (!token) return getDefaultConnection();
    try {
        return await getUserDatabaseConnectionFromToken(token);
    } catch {
        return getDefaultConnection();
    }
};

// ─── Helper: parse raw host string with proper port extraction ────────────────

const parseRawHostString = (raw: string): { server: string; port?: number; instance?: string } => {
    let s = raw.trim().replace(/^["']|["']$/g, '');
    s = s.replace(/\\\\/g, '\\');
    
    // Handle format "122.165.240.65\SQL_2019,1435" - instance with explicit port
    const instanceWithPortMatch = s.match(/^([^\\,]+)\\([^,]+),(\d+)$/);
    if (instanceWithPortMatch) {
        return {
            server: instanceWithPortMatch[1].trim(),
            instance: instanceWithPortMatch[2].trim(),
            port: parseInt(instanceWithPortMatch[3], 10)
        };
    }
    
    // Handle format "server\instance" only
    const instanceOnlyMatch = s.match(/^([^\\,]+)\\([^\\,]+)$/);
    if (instanceOnlyMatch) {
        return {
            server: instanceOnlyMatch[1].trim(),
            instance: instanceOnlyMatch[2].trim()
        };
    }
    
    // Handle format "server,port"
    const portOnlyMatch = s.match(/^([^\\,]+),(\d+)$/);
    if (portOnlyMatch) {
        return {
            server: portOnlyMatch[1].trim(),
            port: parseInt(portOnlyMatch[2], 10)
        };
    }
    
    // Plain server/IP
    return { server: s };
};

const buildDialectOptions = (instance?: string, explicitPort?: number): any => {
    const opts: any = {
        options: {
            encrypt: false,
            trustServerCertificate: true,
            requestTimeout: 60000,
            connectionTimeout: 30000,
        },
    };
    // Only use instance name if we have an instance AND no explicit port
    if (instance && !explicitPort) {
        opts.options.instanceName = instance;
    }
    return opts;
};

// ─── Helper: get company raw config by ID ─────────────────────────────────────

const getCompanyRawConfig = (companyId: number): CompanyRawConfig | null => {
    return companyRawConfigs.get(companyId) ?? null;
};

// ─── Helper: get User Portal connection via COMPANY HOST using RAW config ──────

const getUserPortalViaCompanyHost = async (token: string | null): Promise<Sequelize> => {
    if (!token) return getDefaultConnection();
    
    try {
        // Get company ID from token
        const companyId = getCompanyIdFromToken(token);
        if (!companyId) {
            console.log('No company ID found in token, using default connection');
            return getDefaultConnection();
        }
        
        // Check cache
        if (userPortalConnections.has(companyId)) {
            const cached = userPortalConnections.get(companyId)!;
            console.log(`♻️ Reusing User Portal connection for company ${companyId}`);
            return cached;
        }
        
        // Get raw company configuration
        const companyRawConfig = getCompanyRawConfig(companyId);
        if (!companyRawConfig) {
            console.log(`No raw company config found for ID ${companyId}, using default connection`);
            return getDefaultConnection();
        }
        
        console.log(`Company ${companyId} raw config:`, {
            rawHost: companyRawConfig.rawHost,
            database: companyRawConfig.database,
            user: companyRawConfig.user
        });
        
        // Parse raw host string
        const h = parseRawHostString(companyRawConfig.rawHost);
        
        console.log(`Parsed host:`, {
            server: h.server,
            port: h.port,
            instance: h.instance
        });
        
        // Determine the port to use
        const usePort = h.port !== undefined ? h.port : (h.instance ? undefined : 1433);
        
        console.log(`Connection settings for User_Portal:`, {
            server: h.server,
            port: usePort,
            instance: h.instance,
            database: 'User_Portal',
            user: companyRawConfig.user
        });
        
        const baseOpts = buildDialectOptions(h.instance, h.port);
        const userPortalConnection = new Sequelize({
            dialect: 'mssql',
            host: h.server,
            port: usePort,
            username: companyRawConfig.user,
            password: companyRawConfig.password,
            database: 'User_Portal',
            logging: false,
            dialectOptions: {
                ...baseOpts,
                options: {
                    ...baseOpts.options,
                    connectionTimeout: 300
                }
            },
            // Aggressive idle timeout (1s) to prevent firewall dropping stale connections 
            // and causing 21s ECONNRESET hangs when pulled from the pool.
            pool: { max: 10, min: 0, acquire: 30000, idle: 1000, evict: 1000 },
            retry: {
                match: [
                    /ECONNRESET/,
                    /ConnectionError/,
                    /SequelizeConnectionError/,
                    /SequelizeConnectionRefusedError/,
                    /SequelizeHostNotFoundError/,
                    /SequelizeHostNotReachableError/,
                    /SequelizeInvalidConnectionError/,
                    /SequelizeConnectionAcquireTimeoutError/,
                    /ETIMEOUT/,
                    /EINVALIDSTATE/,
                    /LoggedIn state/
                ],
                max: 3
            }
        });
        
        await userPortalConnection.authenticate();
        console.log(`✅ Connected to User_Portal on company host: ${companyRawConfig.rawHost}`);
        
        // Cache the connection
        userPortalConnections.set(companyId, userPortalConnection);
        return userPortalConnection;
        
    } catch (error) {
        console.error('Error connecting to User_Portal via company host:', error);
        console.log('⚠️ Falling back to default User Portal connection');
        return getDefaultConnection();
    }
};

// ─── Helper: get user info from token (from default User Portal) ──────────────

const getUserInfoFromToken = async (token: string | null): Promise<UserInfo | null> => {
    if (!token) return null;
    try {
        const defaultDB = getDefaultConnection();
        const rows = await defaultDB.query(
            `SELECT UserTypeId, Global_User_ID, Local_User_ID 
             FROM tbl_Users 
             WHERE Autheticate_Id = :token AND UDel_Flag = 0`,
            { replacements: { token }, type: QueryTypes.SELECT },
        ) as any[];
        
        if (rows.length > 0) {
            return {
                userTypeId: Number(rows[0].UserTypeId),
                globalUserId: Number(rows[0].Global_User_ID),
                localUserId: Number(rows[0].Local_User_ID)
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
};

// ─── getUserMenuRights ────────────────────────────────────────────────────────

const getUserMenuRights = async (token: string | null): Promise<MenuRow[] | false> => {
    try {
        const [userInfo, companyDB, portalDB] = await Promise.all([
            getUserInfoFromToken(token),
            getCompanyDB(token),
            getUserPortalViaCompanyHost(token)
        ]);

        // Admin / management → full rights
        if (userInfo && (isEqualNumber(userInfo.userTypeId, 0) || isEqualNumber(userInfo.userTypeId, 1))) {
            const rows = await portalDB.query(
                `SELECT *,
                    1 AS Read_Rights,
                    1 AS Add_Rights,
                    1 AS Edit_Rights,
                    1 AS Delete_Rights,
                    1 AS Print_Rights
                 FROM tbl_AppMenu`,
                { type: QueryTypes.SELECT }
            ) as MenuRow[];
            return rows;
        }

        // Use Local_User_ID for rights query
        const localUserId = userInfo ? userInfo.localUserId : null;

        // Run menu and rights queries in parallel
        const [menus, userRights, userTypeRights] = await Promise.all([
            portalDB.query(
                `SELECT * FROM tbl_AppMenu`,
                { type: QueryTypes.SELECT }
            ) as Promise<MenuRow[]>,
            
            localUserId ? companyDB.query(
                `SELECT
                    ur.MenuId,
                    ur.Read_Rights,
                    ur.Add_Rights,
                    ur.Edit_Rights,
                    ur.Delete_Rights,
                    ur.Print_Rights
                 FROM tbl_AppMenu_UserRights ur
                 WHERE ur.UserId = :localUserId`,
                { replacements: { localUserId }, type: QueryTypes.SELECT }
            ) as Promise<any[]> : Promise.resolve([]),
            
            companyDB.query(
                `SELECT
                    utr.MenuId,
                    utr.Read_Rights,
                    utr.Add_Rights,
                    utr.Edit_Rights,
                    utr.Delete_Rights,
                    utr.Print_Rights
                 FROM tbl_AppMenu_UserTypeRights utr
                 WHERE utr.UserTypeId = :userTypeId`,
                { replacements: { userTypeId: userInfo?.userTypeId || 0 }, type: QueryTypes.SELECT }
            ) as Promise<any[]>
        ]);

        // Build lookup maps
        const urMap = new Map(userRights.map(r => [r.MenuId, r]));
        const utrMap = new Map(userTypeRights.map(r => [r.MenuId, r]));

        // Merge rights
        const rows: MenuRow[] = menus.map(m => {
            const ur = urMap.get(m.id);
            const utr = utrMap.get(m.id);
            return {
                ...m,
                Read_Rights: ur?.Read_Rights ?? utr?.Read_Rights ?? 0,
                Add_Rights: ur?.Add_Rights ?? utr?.Add_Rights ?? 0,
                Edit_Rights: ur?.Edit_Rights ?? utr?.Edit_Rights ?? 0,
                Delete_Rights: ur?.Delete_Rights ?? utr?.Delete_Rights ?? 0,
                Print_Rights: ur?.Print_Rights ?? utr?.Print_Rights ?? 0,
            };
        });

        return rows;
    } catch (e) {
        console.error('Error in getUserMenuRights:', e);
        return false;
    }
};

// ─── getUserRightsForSpecificUser ─────────────────────────────────────────────

const getUserRightsForSpecificUser = async (targetUserId: number, token: string | null): Promise<MenuRow[] | false> => {
    try {
        const currentUserInfo = await getUserInfoFromToken(token);
        const companyDB = await getCompanyDB(token);
        const portalDB = await getUserPortalViaCompanyHost(token);

        const menus = await portalDB.query(
            `SELECT * FROM tbl_AppMenu`,
            { type: QueryTypes.SELECT }
        ) as MenuRow[];

        const isAdmin = currentUserInfo && (isEqualNumber(currentUserInfo.userTypeId, 0) || isEqualNumber(currentUserInfo.userTypeId, 1));
        
        if (isAdmin) {
            const rows: MenuRow[] = menus.map(m => ({
                ...m,
                Read_Rights: 1,
                Add_Rights: 1,
                Edit_Rights: 1,
                Delete_Rights: 1,
                Print_Rights: 1,
            }));
            return rows;
        }

        const userRights = await companyDB.query(
            `SELECT
                ur.MenuId,
                ur.Read_Rights,
                ur.Add_Rights,
                ur.Edit_Rights,
                ur.Delete_Rights,
                ur.Print_Rights
             FROM tbl_AppMenu_UserRights ur
             WHERE ur.UserId = :targetUserId`,
            { replacements: { targetUserId }, type: QueryTypes.SELECT },
        ) as any[];

        const defaultPortalDB = getDefaultConnection();
        const targetUserInfo = await defaultPortalDB.query(
            `SELECT UserTypeId, Local_User_ID FROM tbl_Users WHERE Global_User_ID = :targetUserId AND UDel_Flag = 0`,
            { replacements: { targetUserId }, type: QueryTypes.SELECT },
        ) as any[];
        
        let userTypeRights: Array<any> = [];
        
        if (targetUserInfo.length > 0) {
            const targetUserTypeId = targetUserInfo[0].UserTypeId;
            userTypeRights = await companyDB.query(
                `SELECT
                    utr.MenuId,
                    utr.Read_Rights,
                    utr.Add_Rights,
                    utr.Edit_Rights,
                    utr.Delete_Rights,
                    utr.Print_Rights
                 FROM tbl_AppMenu_UserTypeRights utr
                 WHERE utr.UserTypeId = :targetUserTypeId`,
                { replacements: { targetUserTypeId }, type: QueryTypes.SELECT },
            ) as any[];
        }

        const urMap = new Map(userRights.map(r => [r.MenuId, r]));
        const utrMap = new Map(userTypeRights.map(r => [r.MenuId, r]));

        const rows: MenuRow[] = menus.map(m => {
            const ur = urMap.get(m.id);
            const utr = utrMap.get(m.id);
            return {
                ...m,
                Read_Rights: ur?.Read_Rights ?? utr?.Read_Rights ?? 0,
                Add_Rights: ur?.Add_Rights ?? utr?.Add_Rights ?? 0,
                Edit_Rights: ur?.Edit_Rights ?? utr?.Edit_Rights ?? 0,
                Delete_Rights: ur?.Delete_Rights ?? utr?.Delete_Rights ?? 0,
                Print_Rights: ur?.Print_Rights ?? utr?.Print_Rights ?? 0,
            };
        });

        return rows;
    } catch (e) {
        console.error('Error in getUserRightsForSpecificUser:', e);
        return false;
    }
};

const getUserBasedRights = async (userId: number, token: string | null): Promise<MenuRow[] | false> => {
    try {
        const companyDB = await getCompanyDB(token);
        const portalDB = await getUserPortalViaCompanyHost(token);

        const menus = await portalDB.query(
            `SELECT * FROM tbl_AppMenu`,
            { type: QueryTypes.SELECT }
        ) as MenuRow[];

        const userRights = await companyDB.query(
            `SELECT MenuId, Read_Rights, Add_Rights, Edit_Rights, Delete_Rights, Print_Rights
             FROM tbl_AppMenu_UserRights
             WHERE UserId = :userId`,
            { replacements: { userId }, type: QueryTypes.SELECT },
        ) as any[];

        const urMap = new Map(userRights.map(r => [r.MenuId, r]));

        const rows: MenuRow[] = menus.map(m => {
            const ur = urMap.get(m.id);
            return {
                ...m,
                Read_Rights: ur?.Read_Rights ?? 0,
                Add_Rights: ur?.Add_Rights ?? 0,
                Edit_Rights: ur?.Edit_Rights ?? 0,
                Delete_Rights: ur?.Delete_Rights ?? 0,
                Print_Rights: ur?.Print_Rights ?? 0,
            };
        });

        return rows;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const getUserTypeBasedRights = async (userType: number, token: string | null): Promise<MenuRow[] | false> => {
    try {
        const companyDB = await getCompanyDB(token);
        const portalDB = await getUserPortalViaCompanyHost(token);

        const menus = await portalDB.query(
            `SELECT * FROM tbl_AppMenu`,
            { type: QueryTypes.SELECT }
        ) as MenuRow[];

        const typeRights = await companyDB.query(
            `SELECT MenuId, Read_Rights, Add_Rights, Edit_Rights, Delete_Rights, Print_Rights
             FROM tbl_AppMenu_UserTypeRights
             WHERE UserTypeId = :userType`,
            { replacements: { userType }, type: QueryTypes.SELECT },
        ) as any[];

        const utrMap = new Map(typeRights.map(r => [r.MenuId, r]));

        const rows: MenuRow[] = menus.map(m => {
            const utr = utrMap.get(m.id);
            return {
                ...m,
                Read_Rights: utr?.Read_Rights ?? 0,
                Add_Rights: utr?.Add_Rights ?? 0,
                Edit_Rights: utr?.Edit_Rights ?? 0,
                Delete_Rights: utr?.Delete_Rights ?? 0,
                Print_Rights: utr?.Print_Rights ?? 0,
            };
        });

        return rows;
    } catch (e) {
        console.error(e);
        return false;
    }
};

// ─── Controller ───────────────────────────────────────────────────────────────

const appMenu = () => {

    const newAppMenu = async (req: Request, res: Response): Promise<void> => {
        try {
            const { MenuName, MenuId } = req.query as Record<string, string>;
            const token = extractToken(req);
            
            if (!token) {
                invalidInput(res, 'Authorization token required');
                return;
            }
            
            const userRights = await getUserMenuRights(token);

            if (!Array.isArray(userRights)) {
                failed(res, 'Unable to fetch menu rights');
                return;
            }

            const activeMenus = userRights.filter(m => isEqualNumber(m.is_active, 2));
            const subRoutings = activeMenus
                .filter(m => isEqualNumber(m.menu_type, 0))
                .sort((a, b) => (a.parent_id ?? 0) - (b.parent_id ?? 0));
            const nestedRoutes = buildRoutesTree(subRoutings);
            const menuStructure = buildMenuStructure(activeMenus);

            const filteredMenu = MenuName
                ? menuStructure.filter(m => stringCompare(m.name, MenuName))
                : isValidNumber(MenuId)
                    ? menuStructure.filter(m => isEqualNumber(m.id, MenuId))
                    : menuStructure;

            dataFound(res, filteredMenu, 'Data Found', { subRoutings, nestedRoutes });
        } catch (e) {
            servError(e, res);
        }
    };

    const userRights = async (req: Request, res: Response): Promise<void> => {
        try {
            const { UserId, MenuName, MenuId } = req.query as Record<string, string>;
            const token = extractToken(req);
            
            if (!token) {
                invalidInput(res, 'Authorization token required');
                return;
            }
            
            let userRightsData: MenuRow[] | false;
            
            if (UserId && isValidNumber(UserId)) {
                userRightsData = await getUserRightsForSpecificUser(Number(UserId), token);
            } else if (UserId && !isValidNumber(UserId)) {
                invalidInput(res, 'Invalid UserId parameter');
                return;
            } else {
                userRightsData = await getUserMenuRights(token);
            }

            if (!Array.isArray(userRightsData)) {
                failed(res, 'Unable to fetch user rights');
                return;
            }

            const activeMenus = userRightsData.filter(m => isEqualNumber(m.is_active, 2));
            const subRoutings = activeMenus
                .filter(m => isEqualNumber(m.menu_type, 0))
                .sort((a, b) => (a.parent_id ?? 0) - (b.parent_id ?? 0));
            const nestedRoutes = buildRoutesTree(subRoutings);
            const menuStructure = buildMenuStructure(activeMenus);

            const filteredMenu = MenuName
                ? menuStructure.filter(m => stringCompare(m.name, MenuName))
                : isValidNumber(MenuId)
                    ? menuStructure.filter(m => isEqualNumber(m.id, MenuId))
                    : menuStructure;

            dataFound(res, filteredMenu, 'Data Found', { subRoutings, nestedRoutes });
        } catch (e) {
            console.error('Error in userRights endpoint:', e);
            servError(e, res);
        }
    };

    const getNewUserBasedRights = async (req: Request, res: Response): Promise<void> => {
        try {
            const { UserId } = req.query as Record<string, string>;
            if (!isValidNumber(UserId)) {
                invalidInput(res, 'UserId is required');
                return;
            }

            const token = extractToken(req);
            const result = await getUserBasedRights(Number(UserId), token);

            if (!Array.isArray(result)) {
                failed(res);
                return;
            }

            const subRoutings = result.filter(m => isEqualNumber(m.menu_type, 0)).sort((a, b) => (a.parent_id ?? 0) - (b.parent_id ?? 0));
            const nestedRoutes = buildRoutesTree(subRoutings);
            const menuStructure = buildMenuStructure(result);

            dataFound(res, menuStructure, 'Data Found', { subRoutings, nestedRoutes });
        } catch (e) {
            console.error(e);
            servError(e, res);
        }
    };

    const getNewAuthBasedRights = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = extractToken(req);
            const userInfo = await getUserInfoFromToken(token);
            const localUserId = userInfo?.localUserId || null;
            
            if (!localUserId) {
                failed(res, 'User not found');
                return;
            }

            const result = await getUserBasedRights(localUserId, token);

            if (!Array.isArray(result)) {
                failed(res);
                return;
            }

            const subRoutings = result.filter(m => isEqualNumber(m.menu_type, 0)).sort((a, b) => (a.parent_id ?? 0) - (b.parent_id ?? 0));
            const nestedRoutes = buildRoutesTree(subRoutings);
            const menuStructure = buildMenuStructure(result);

            dataFound(res, menuStructure, 'Data Found', { subRoutings, nestedRoutes });
        } catch (e) {
            console.error(e);
            servError(e, res);
        }
    };

    const newModifyUserRights = async (req: Request, res: Response): Promise<void> => {
        const { MenuId, User, ReadRights, AddRights, EditRights, DeleteRights, PrintRights } =
            req.body as ModifyUserRightsBody;
        const token = extractToken(req);
        const companyDB = await getCompanyDB(token);

        try {
            await companyDB.transaction(async (t) => {
                await companyDB.query(
                    `DELETE FROM tbl_AppMenu_UserRights WHERE UserId = :User AND MenuId = :MenuId`,
                    { replacements: { User, MenuId }, type: QueryTypes.DELETE, transaction: t },
                );

                await companyDB.query(
                    `INSERT INTO tbl_AppMenu_UserRights
                        (UserId, MenuId, Read_Rights, Add_Rights, Edit_Rights, Delete_Rights, Print_Rights)
                     VALUES
                        (:User, :MenuId, :ReadRights, :AddRights, :EditRights, :DeleteRights, :PrintRights)`,
                    {
                        replacements: { User, MenuId, ReadRights, AddRights, EditRights, DeleteRights, PrintRights },
                        type: QueryTypes.INSERT,
                        transaction: t,
                    },
                );
            });

            success(res, 'Changes saved successfully.');
        } catch (e) {
            servError(e, res);
        }
    };

    const getNewUserTypeBasedRights = async (req: Request, res: Response): Promise<void> => {
        const { UserType } = req.query as Record<string, string>;
        if (!UserType) {
            invalidInput(res, 'UserType is required');
            return;
        }

        try {
            const token = extractToken(req);
            const result = await getUserTypeBasedRights(Number(UserType), token);

            if (!Array.isArray(result)) {
                failed(res);
                return;
            }

            const subRoutings = result.filter(m => isEqualNumber(m.menu_type, 0)).sort((a, b) => (a.parent_id ?? 0) - (b.parent_id ?? 0));
            const nestedRoutes = buildRoutesTree(subRoutings);
            const menuStructure = buildMenuStructure(result);

            dataFound(res, menuStructure, 'Data Found', { subRoutings, nestedRoutes });
        } catch (e) {
            console.error(e);
            servError(e, res);
        }
    };

    const newModifyUserTypeRights = async (req: Request, res: Response): Promise<void> => {
        const { MenuId, UserType, ReadRights, AddRights, EditRights, DeleteRights, PrintRights } =
            req.body as ModifyUserTypeRightsBody;
        const token = extractToken(req);
        const companyDB = await getCompanyDB(token);

        try {
            await companyDB.transaction(async (t) => {
                await companyDB.query(
                    `DELETE FROM tbl_AppMenu_UserTypeRights WHERE UserTypeId = :UserType AND MenuId = :MenuId`,
                    { replacements: { UserType, MenuId }, type: QueryTypes.DELETE, transaction: t },
                );

                await companyDB.query(
                    `INSERT INTO tbl_AppMenu_UserTypeRights
                        (UserTypeId, MenuId, Read_Rights, Add_Rights, Edit_Rights, Delete_Rights, Print_Rights)
                     VALUES
                        (:UserType, :MenuId, :ReadRights, :AddRights, :EditRights, :DeleteRights, :PrintRights)`,
                    {
                        replacements: { UserType, MenuId, ReadRights, AddRights, EditRights, DeleteRights, PrintRights },
                        type: QueryTypes.INSERT,
                        transaction: t,
                    },
                );
            });

            success(res, 'Changes saved successfully.');
        } catch (e) {
            servError(e, res);
        }
    };

    const createNewMenu = async (req: Request, res: Response): Promise<void> => {
        const {
            name, menu_type, parent_id, url, tUrl, rUrl,
            display_order, is_active = 2, actionType = 'internal',
        } = req.body as CreateMenuBody;

        const token = extractToken(req);
        
        if (!token) {
            invalidInput(res, 'Authorization token required');
            return;
        }

        const portalDB = await getUserPortalViaCompanyHost(token);

        try {
            await portalDB.query(
                `INSERT INTO tbl_AppMenu
                    (name, menu_type, parent_id, url, tUrl, rUrl, actionType, display_order, is_active)
                 VALUES
                    (:name, :menu_type, :parent_id, :url, :tUrl, :rUrl, :actionType, :display_order, :is_active)`,
                {
                    replacements: {
                        name, menu_type,
                        parent_id: parent_id ?? null,
                        url, tUrl, rUrl, actionType, display_order, is_active,
                    },
                    type: QueryTypes.INSERT,
                },
            );

            success(res, 'New Menu Added');
        } catch (e) {
            servError(e, res);
        }
    };

    const updateMenu = async (req: Request, res: Response): Promise<void> => {
        const {
            id, name, menu_type, parent_id, url, tUrl, rUrl,
            display_order, is_active = 2, actionType = 'internal',
        } = req.body as UpdateMenuBody;

        const token = extractToken(req);
        
        if (!token) {
            invalidInput(res, 'Authorization token required');
            return;
        }

        const portalDB = await getUserPortalViaCompanyHost(token);

        try {
            await portalDB.query(
                `UPDATE tbl_AppMenu SET
                    name = :name,
                    menu_type = :menu_type,
                    parent_id = :parent_id,
                    url = :url,
                    tUrl = :tUrl,
                    rUrl = :rUrl,
                    actionType = :actionType,
                    display_order = :display_order,
                    is_active = :is_active
                 WHERE id = :id`,
                {
                    replacements: {
                        id, name, menu_type,
                        parent_id: parent_id ?? null,
                        url, tUrl, rUrl, actionType, display_order, is_active,
                    },
                    type: QueryTypes.UPDATE,
                },
            );

            success(res, 'Changes Saved');
        } catch (e) {
            servError(e, res);
        }
    };

    const listMenu = async (req: Request, res: Response): Promise<void> => {
        const token = extractToken(req);
        
        if (!token) {
            invalidInput(res, 'Authorization token required');
            return;
        }

        const portalDB = await getUserPortalViaCompanyHost(token);

        try {
            const allMenus = await portalDB.query(
                `SELECT * FROM tbl_AppMenu`,
                { type: QueryTypes.SELECT }
            ) as MenuRow[];

            if (!allMenus.length) {
                failed(res);
                return;
            }

            const menuMap = new Map<number, MenuRow>(allMenus.map(m => [m.id, m]));

            const result: (MenuRow & { ParantData: MenuRow | Record<string, never> })[] =
                allMenus.map(m => ({
                    ...m,
                    ParantData: m.parent_id != null ? (menuMap.get(m.parent_id) ?? {}) : {},
                }));

            const menuStructure = buildMenuStructure(result);

            if (menuStructure.length > 0) {
                dataFound(res, menuStructure);
            } else {
                failed(res);
            }
        } catch (e) {
            servError(e, res);
        }
    };

    return {
        newAppMenu,
        userRights,
        getNewUserBasedRights,
        getNewAuthBasedRights,
        newModifyUserRights,
        getNewUserTypeBasedRights,
        newModifyUserTypeRights,
        createNewMenu,
        updateMenu,
        listMenu,
    };
};

export default appMenu();