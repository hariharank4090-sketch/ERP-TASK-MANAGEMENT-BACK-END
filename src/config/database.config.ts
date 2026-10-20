import fs from 'fs';
import path from 'path';
import { Sequelize, Transaction } from 'sequelize';
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

export interface CompanyDBConfig {
    id: number;
    name: string;
    host: string;
    user: string;
    password: string;
    database: string;
    port?: number;
    instance?: string;
    rawHost?: string;
}

export interface TokenSession {
    token: string;
    userId: number;
    localUserId: number | null;  // ADDED: Local_User_ID field
    companyId: number;
    dbName: string;
    companyName: string;
    createdAt: Date;
    user?: any;
}

let defaultConnection: Sequelize | null = null;
let defaultSqlPool: sql.ConnectionPool | null = null;

// Cache for SQL connection pools
const sqlConnectionPools: Map<string, sql.ConnectionPool> = new Map();

function parseHostString(raw: string): { server: string; port?: number; instance?: string } {
    let s = raw.trim().replace(/^["']|["']$/g, '');
    s = s.replace(/\\\\/g, '\\');
    
    const parts = s.split('\\');
    if (parts.length > 2) {
        s = `${parts[0]}\\${parts[parts.length - 1]}`;
        console.warn(`⚠️ Fixed malformed host string: ${raw} → ${s}`);
    }

    const instPort = s.match(/^([^\\,]+)\\([^\\,]+),(\d+)$/);
    if (instPort) {
        return { server: instPort[1].trim(), instance: instPort[2].trim(), port: parseInt(instPort[3], 10) };
    }

    const inst = s.match(/^([^\\,]+)\\([^\\,]+)$/);
    if (inst) {
        return { server: inst[1].trim(), instance: inst[2].trim() };
    }

    const port = s.match(/^([^\\,]+),(\d+)$/);
    if (port) {
        return { server: port[1].trim(), port: parseInt(port[2], 10) };
    }

    return { server: s };
}

function buildDialectOptions(instance?: string, explicitPort?: number): any {
    const opts: any = {
        options: {
            encrypt: false,
            trustServerCertificate: true,
            requestTimeout: 60000,
            connectTimeout: 60000,  // WAN-safe: remote server needs more time to connect
            enableArithAbort: true,   // Faster SQL Server query execution
            abortTransactionOnError: true,
            keepAlive: true,          // Prevent firewall from silently dropping connections
            keepAliveInitialDelay: 10000,
        },
    };
    // Only set instanceName when NO explicit port — explicit port skips Browser service lookup
    if (instance && !explicitPort) {
        opts.options.instanceName = instance;
    }
    return opts;
}

// Get default Sequelize connection
export const getDefaultConnection = (): Sequelize => {
    if (!defaultConnection) {
        const h = parseHostString(process.env.DB_HOST || process.env.SERVER || 'localhost');
        defaultConnection = new Sequelize({
            dialect: 'mssql',
            host: h.server,
            port: h.port ?? 1433,
            username: process.env.DB_USER || process.env.USER,
            password: process.env.DB_PASSWORD || process.env.PASSWORD,
            database: process.env.DATABASE,
            logging: false,
            dialectOptions: buildDialectOptions(h.instance, h.port),
            pool: { max: 50, min: 0, acquire: 60000, idle: 1000, evict: 1000 },
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
            },
            isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        });

        // Background session table initialization
        syncDatabaseSessions().catch(() => {});
    }
    return defaultConnection;
};

// Get default SQL connection pool (for mssql queries)
export const getDefaultSqlConnection = async (): Promise<sql.ConnectionPool> => {
    // Return cached pool directly — no ping to save round-trip latency
    if (defaultSqlPool && defaultSqlPool.connected) {
        return defaultSqlPool;
    }

    const rawHost = process.env.DB_HOST || process.env.SERVER || 'localhost';
    const h = parseHostString(rawHost);
    const usePort = h.port ?? (h.instance ? undefined : 1433);

    const config: sql.config = {
        server: h.server,
        ...(usePort && { port: usePort }),
        database: process.env.DATABASE as string,
        user: (process.env.DB_USER || process.env.USER) as string,
        password: (process.env.DB_PASSWORD || process.env.PASSWORD) as string,
        options: {
            encrypt: false,
            trustServerCertificate: true,
            requestTimeout: 60000,
            connectTimeout: 60000,     // WAN-safe: remote server needs more time to connect
            enableArithAbort: true,   // Faster SQL Server query execution
            ...(h.instance && !h.port && { instanceName: h.instance }),
        },
        pool: {
            max: 30,
            min: 5,
            idleTimeoutMillis: 60000
        }
    };

    defaultSqlPool = await sql.connect(config);
    return defaultSqlPool;
};

const companyConfigs: Map<number, CompanyDBConfig> = new Map();
const companyConfigsByDBName: Map<string, CompanyDBConfig> = new Map();
const dbNameMapping: Map<string, number> = new Map();

function getCompaniesFilePath(): string | null {
    const candidates = [
        process.env.COMPANIES_FILE,
        path.resolve(process.cwd(), 'companies.json'),
        path.resolve(__dirname, '../../companies.json'),
        path.resolve(__dirname, 'companies.json'),
        path.resolve(__dirname, '../companies.json'),
    ].filter(Boolean) as string[];

    for (const p of candidates) {
        if (fs.existsSync(p)) {
            return p;
        }
    }
    return null;
}

function loadCompanyConfigurations(): void {
    const jsonPath = getCompaniesFilePath();
    let loadedFromJSON = false;

    if (jsonPath) {
        try {
            const content = fs.readFileSync(jsonPath, 'utf8');
            const data = JSON.parse(content);
            const list: any[] = Array.isArray(data)
                ? data
                : Array.isArray(data.companies)
                ? data.companies
                : Object.values(data);

            for (const item of list) {
                if (!item || typeof item !== 'object') continue;
                const rawId = item.id ?? item.companyId ?? item.COMPANY_ID;
                const companyId = parseInt(String(rawId), 10);
                const dbName = item.database ?? item.dbName ?? item.DATABASE;
                const dbHost = item.host ?? item.dbHost ?? item.DB_HOST;
                const dbUser = item.user ?? item.dbUser ?? item.DB_USER;
                const dbPassword = item.password ?? item.dbPassword ?? item.DB_PASSWORD;
                const name = item.name ?? item.companyName ?? item.COMPANY_NAME ?? `Company ${companyId}`;

                if (!companyId || !dbName || !dbHost || !dbUser || !dbPassword) {
                    continue;
                }

                const h = parseHostString(dbHost);
                const config: CompanyDBConfig = {
                    id: companyId,
                    name,
                    host: h.server,
                    user: dbUser,
                    password: dbPassword,
                    database: dbName,
                    port: h.port,
                    instance: h.instance,
                    rawHost: dbHost,
                };
                companyConfigs.set(companyId, config);
                companyConfigsByDBName.set(dbName, config);
                dbNameMapping.set(dbName, companyId);
            }

            // Also load explicit dbNameMapping from JSON if present
            const rawMapping = data.dbNameMapping || data.DB_NAME_MAPPING || data.db_name_mapping;
            if (rawMapping) {
                if (typeof rawMapping === 'string') {
                    for (const pair of rawMapping.split(',')) {
                        const [db, id] = pair.split('=');
                        if (db && id) dbNameMapping.set(db.trim(), parseInt(id.trim(), 10));
                    }
                } else if (typeof rawMapping === 'object' && !Array.isArray(rawMapping)) {
                    for (const [db, id] of Object.entries(rawMapping)) {
                        dbNameMapping.set(db.trim(), parseInt(String(id), 10));
                    }
                }
            }

            if (companyConfigs.size > 0) {
                loadedFromJSON = true;
            }
        } catch (err: any) {
            console.error(`⚠️ Failed to load company configurations from ${jsonPath}:`, err.message);
        }
    }

    // Fallback: check .env for any COMPANY<N>_ variables
    const companyIndices = new Set<number>();
    for (const key of Object.keys(process.env)) {
        const match = key.match(/^COMPANY(\d+)_/);
        if (match) {
            companyIndices.add(parseInt(match[1], 10));
        }
    }
    if (companyIndices.size > 0) {
        if (!loadedFromJSON) {
        }
        const sortedIndices = Array.from(companyIndices).sort((a, b) => a - b);
        for (const i of sortedIndices) {
            const dbName = process.env[`COMPANY${i}_DATABASE`];
            const dbHost = process.env[`COMPANY${i}_DB_HOST`];
            const dbUser = process.env[`COMPANY${i}_DB_USER`];
            const dbPassword = process.env[`COMPANY${i}_DB_PASSWORD`];
            const rawCompanyId = process.env[`COMPANY${i}_ID`];
            const companyId = parseInt(rawCompanyId ?? `${i}`, 10);
            if (!companyId || !dbName || !dbHost || !dbUser || !dbPassword) continue;
            if (companyConfigs.has(companyId)) continue;

            const h = parseHostString(dbHost);
            const config: CompanyDBConfig = {
                id: companyId,
                name: process.env[`COMPANY${i}_NAME`] ?? `Company ${companyId}`,
                host: h.server,
                user: dbUser,
                password: dbPassword,
                database: dbName,
                port: h.port,
                instance: h.instance,
                rawHost: dbHost,
            };
            companyConfigs.set(companyId, config);
            companyConfigsByDBName.set(dbName, config);
            dbNameMapping.set(dbName, companyId);
        }
    }

    // Fallback: parse process.env.DB_NAME_MAPPING if present
    if (process.env.DB_NAME_MAPPING) {
        const pairs = process.env.DB_NAME_MAPPING.split(',');
        for (const pair of pairs) {
            const [db, id] = pair.split('=');
            if (db && id && !dbNameMapping.has(db.trim())) {
                dbNameMapping.set(db.trim(), parseInt(id.trim(), 10));
            }
        }
    }

}

loadCompanyConfigurations();

const companyConnections: Map<string, Sequelize> = new Map();
export const tokenSessions: Map<string, TokenSession> = new Map();
const userCompanyTokens: Map<number, Map<number, string>> = new Map();



export async function syncDatabaseSessions(): Promise<void> {
    try {
        const db = defaultConnection || getDefaultConnection();
        await db.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tbl_User_Sessions' AND xtype='U')
            CREATE TABLE tbl_User_Sessions (
                Token NVARCHAR(500) PRIMARY KEY,
                UserId BIGINT,
                LocalUserId BIGINT NULL,
                CompanyId INT,
                DbName NVARCHAR(100),
                CompanyName NVARCHAR(200),
                CreatedAt DATETIME,
                ExpiresAt DATETIME,
                UserData NVARCHAR(MAX) NULL
            )
        `);
        const [dbSessions] = await db.query(
            `SELECT * FROM tbl_User_Sessions WHERE ExpiresAt > GETDATE()`
        ) as any[];
        if (Array.isArray(dbSessions)) {
            for (const row of dbSessions) {
                if (!tokenSessions.has(row.Token)) {
                    let userObj = undefined;
                    try { if (row.UserData) userObj = JSON.parse(row.UserData); } catch {}
                    const sessionItem: TokenSession = {
                        token: row.Token,
                        userId: Number(row.UserId),
                        localUserId: row.LocalUserId ? Number(row.LocalUserId) : null,
                        companyId: Number(row.CompanyId),
                        dbName: row.DbName,
                        companyName: row.CompanyName,
                        createdAt: new Date(row.CreatedAt),
                        user: userObj,
                    };
                    tokenSessions.set(row.Token, sessionItem);
                    if (!userCompanyTokens.has(sessionItem.userId)) {
                        userCompanyTokens.set(sessionItem.userId, new Map());
                    }
                    userCompanyTokens.get(sessionItem.userId)!.set(sessionItem.companyId, sessionItem.token);
                }
            }
        }
    } catch {
        // Fallback silently if table creation/query fails
    }
}



export function getCompanyConfig(companyId: number): CompanyDBConfig | null {
    return companyConfigs.get(companyId) ?? null;
}

export function getAllCompanyIds(): number[] {
    return Array.from(companyConfigs.keys());
}

export function isCompanyConfigured(companyId: number): boolean {
    return companyConfigs.has(companyId);
}

export function getAllCompanyConfigs(): CompanyDBConfig[] {
    return Array.from(companyConfigs.values());
}

export function getCompanyRawConfig(companyId: number): {
    id: number;
    name: string;
    rawHost: string;
    user: string;
    password: string;
    database: string;
} | null {
    const c = companyConfigs.get(companyId);
    if (!c) return null;
    return {
        id: c.id,
        name: c.name,
        rawHost: c.rawHost || (c.instance ? `${c.host}\\${c.instance}${c.port ? `,${c.port}` : ''}` : (c.port ? `${c.host},${c.port}` : c.host)),
        user: c.user,
        password: c.password,
        database: c.database,
    };
}

export function getCompanyConfigByDBName(dbName: string): CompanyDBConfig | null {
    return companyConfigsByDBName.get(dbName) ?? null;
}

export function getDbNameMapping(): Record<string, number> {
    const obj: Record<string, number> = {};
    for (const [db, id] of dbNameMapping.entries()) {
        obj[db] = id;
    }
    return obj;
}

export async function getCompanyDatabase(identifier: number | string): Promise<Sequelize> {
    let config: CompanyDBConfig | null = null;
    if (typeof identifier === 'number') {
        config = getCompanyConfig(identifier);
    } else {
        config = getCompanyConfigByDBName(identifier);
    }

    if (!config && typeof identifier === 'string') {
        const parsed = parseInt(identifier, 10);
        if (!isNaN(parsed)) {
            config = getCompanyConfig(parsed);
        }
    }

    if (!config && typeof identifier === 'number') {
        for (const [db, id] of dbNameMapping.entries()) {
            if (id === identifier) {
                config = getCompanyConfigByDBName(db);
                if (config) break;
            }
        }
        if (!config && process.env.DB_NAME_MAPPING) {
            const pairs = process.env.DB_NAME_MAPPING.split(',');
            for (const pair of pairs) {
                const [db, id] = pair.split('=');
                if (parseInt(id, 10) === identifier) {
                    config = getCompanyConfigByDBName(db.trim());
                    if (config) break;
                }
            }
        }
    }

    if (!config) throw new Error(`No DB configuration found for: ${identifier}`);

    // Always use the deterministic company ID as the cache key to prevent duplicate pools
    const cacheKey = `company_${config.id}`;
    if (companyConnections.has(cacheKey)) {
        // Return cached connection directly — no authenticate() ping to save round-trip latency
        return companyConnections.get(cacheKey)!;
    }
    const usePort = config.port ?? (config.instance ? undefined : 1433);
    const seq = new Sequelize({
        dialect: 'mssql',
        host: config.host,
        port: usePort,
        username: config.user,
        password: config.password,
        database: config.database,
        logging: false,
        dialectOptions: buildDialectOptions(config.instance, config.port),
        pool: { max: 50, min: 0, acquire: 60000, idle: 1000, evict: 1000 },
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
        },
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    });
    try {
        await seq.authenticate();
        companyConnections.set(cacheKey, seq);
        return seq;
    } catch (error: any) {
        console.error(`❌ Connection FAILED: ${config.database}`, error.message);
        throw error;
    }
}

export async function getUserDatabaseConnectionFromToken(token: string): Promise<Sequelize> {
    const session = verifyTokenSession(token);
    if (!session) throw new Error('Invalid or expired token');

    if (session.companyId) {
        try {
            return await getCompanyDatabase(session.companyId);
        } catch (err) {
            console.warn(`⚠️ getCompanyDatabase failed for companyId ${session.companyId}, trying dbName ${session.dbName}:`, err);
        }
    }

    if (session.dbName) {
        try {
            return await getCompanyDatabase(session.dbName);
        } catch (err) {
            console.warn(`⚠️ getCompanyDatabase failed for dbName ${session.dbName}:`, err);
        }
    }

    return getDefaultConnection();
}

export function getDatabaseFromToken(token: string): string | null {
    return tokenSessions.get(token)?.dbName ?? null;
}

export function getCompanyIdFromToken(token: string): number | null {
    return tokenSessions.get(token)?.companyId ?? null;
}

export function getLocalUserIdFromToken(token: string): number | null {
    return tokenSessions.get(token)?.localUserId ?? null;
}

// UPDATED: Added localUserId and optional user parameter
export function storeTokenSession(
    token: string,
    userId: number,
    localUserId: number | null,  // ADDED parameter
    companyId: number,
    dbName: string,
    companyName: string,
    user?: any,
): void {
    const sessionObj: TokenSession = { 
        token, 
        userId, 
        localUserId,  // ADDED field
        companyId, 
        dbName, 
        companyName, 
        createdAt: new Date(),
        user
    };
    tokenSessions.set(token, sessionObj);
    if (!userCompanyTokens.has(userId)) userCompanyTokens.set(userId, new Map());
    userCompanyTokens.get(userId)!.set(companyId, token);

    try {
        if (defaultConnection) {
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            defaultConnection.query(`
                IF EXISTS (SELECT 1 FROM tbl_User_Sessions WHERE Token = :token)
                    UPDATE tbl_User_Sessions SET UserId = :userId, LocalUserId = :localUserId, CompanyId = :companyId, DbName = :dbName, CompanyName = :companyName, CreatedAt = :createdAt, ExpiresAt = :expiresAt, UserData = :userData WHERE Token = :token
                ELSE
                    INSERT INTO tbl_User_Sessions (Token, UserId, LocalUserId, CompanyId, DbName, CompanyName, CreatedAt, ExpiresAt, UserData)
                    VALUES (:token, :userId, :localUserId, :companyId, :dbName, :companyName, :createdAt, :expiresAt, :userData)
            `, {
                replacements: {
                    token,
                    userId,
                    localUserId: localUserId || null,
                    companyId,
                    dbName,
                    companyName,
                    createdAt: sessionObj.createdAt,
                    expiresAt,
                    userData: user ? JSON.stringify(user) : null,
                }
            }).catch(() => {});
        }
    } catch {}

}

export function verifyTokenSession(token: string): TokenSession | null {
    const s = tokenSessions.get(token);
    if (!s) return null;
    const hoursSinceCreation = (Date.now() - s.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
        removeTokenSession(token);
        return null;
    }
    return s;
}

export function getTokenForCompany(userId: number, companyId: number): string | null {
    return userCompanyTokens.get(userId)?.get(companyId) ?? null;
}

export function removeTokenSession(token: string): void {
    const s = tokenSessions.get(token);
    if (!s) return;
    const map = userCompanyTokens.get(s.userId);
    if (map) {
        map.delete(s.companyId);
        if (map.size === 0) userCompanyTokens.delete(s.userId);
    }
    tokenSessions.delete(token);

    try {
        if (defaultConnection) {
            defaultConnection.query(`DELETE FROM tbl_User_Sessions WHERE Token = :token`, { replacements: { token } }).catch(() => {});
        }
    } catch {}

}

// Connection Stats
export function getConnectionStats() {
    return {
        activeSessions: tokenSessions.size,
        activeCompanyConnections: companyConnections.size,
        loadedCompanies: companyConfigs.size,
        sqlConnections: sqlConnectionPools.size,
        companies: Array.from(companyConfigs.values()).map(c => ({
            id: c.id,
            name: c.name,
            database: c.database,
            host: c.host,
            port: c.port,
            instance: c.instance,
        })),
    };
}

// Cache for SQL connection pools
export const getCompanySqlConnection = async (companyId: number | string): Promise<sql.ConnectionPool> => {
    const key = `company_${companyId}`;

    // Return cached pool directly — no ping to save round-trip latency
    if (sqlConnectionPools.has(key)) {
        const pool = sqlConnectionPools.get(key)!;
        if (pool.connected) {
            return pool;
        }
        sqlConnectionPools.delete(key);
    }

    let config: CompanyDBConfig | null;
    if (typeof companyId === 'number') {
        config = getCompanyConfig(companyId);
    } else {
        config = getCompanyConfigByDBName(companyId);
    }

    if (!config) {
        throw new Error(`No configuration found for company: ${companyId}`);
    }

    const usePort = config.port ?? (config.instance ? undefined : 1433);


    const sqlConfig: sql.config = {
        server: config.host,
        ...(usePort && { port: usePort }),
        database: config.database,
        user: config.user,
        password: config.password,
        options: {
            encrypt: false,
            trustServerCertificate: true,
            requestTimeout: 60000,
            connectTimeout: 60000,     // WAN-safe: remote server needs more time to connect
            enableArithAbort: true,   // Faster SQL Server query execution
            ...(config.instance && !config.port && { instanceName: config.instance }),
        },
        pool: {
            max: 30,
            min: 5,
            idleTimeoutMillis: 60000
        }
    };

    try {
        const pool = await sql.connect(sqlConfig);
        sqlConnectionPools.set(key, pool);
        return pool;
    } catch (error) {
        console.error(`❌ Failed to connect to company ${config.name}:`, error);
        throw error;
    }
};

// Close all company connections
export async function closeAllCompanyConnections(): Promise<void> {
    
    // Close Sequelize connections
    for (const [key, conn] of companyConnections) {
        try {
            await conn.close();
        } catch (err) {
            console.error(`   Error closing ${key}:`, err);
        }
    }
    companyConnections.clear();
    
    // Close SQL connection pools
    for (const [key, pool] of sqlConnectionPools) {
        try {
            await pool.close();
        } catch (err) {
            console.error(`   Error closing SQL pool ${key}:`, err);
        }
    }
    sqlConnectionPools.clear();
    
    // Close default SQL pool
    if (defaultSqlPool) {
        try {
            await defaultSqlPool.close();
            defaultSqlPool = null;
        } catch (err) {
            console.error('   Error closing default SQL pool:', err);
        }
    }
    
}

export const sequelize = getDefaultConnection();