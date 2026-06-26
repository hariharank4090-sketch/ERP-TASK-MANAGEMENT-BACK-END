import { Sequelize } from 'sequelize';
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
}

export interface TokenSession {
    token: string;
    userId: number;
    localUserId: number | null;  // ADDED: Local_User_ID field
    companyId: number;
    dbName: string;
    companyName: string;
    createdAt: Date;
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
            connectionTimeout: 30000,
        },
    };
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
            pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
        });
    }
    return defaultConnection;
};

// Get default SQL connection pool (for mssql queries)
export const getDefaultSqlConnection = async (): Promise<sql.ConnectionPool> => {
    if (defaultSqlPool) {
        try {
            await defaultSqlPool.request().query('SELECT 1');
            console.log('♻️ Reusing default SQL connection');
            return defaultSqlPool;
        } catch (error) {
            console.warn('🔄 Stale default SQL connection, reconnecting…');
            defaultSqlPool = null;
        }
    }

    const config: sql.config = {
        server: process.env.SERVER as string,
        database: process.env.DATABASE as string,
        user: process.env.USER as string,
        password: process.env.PASSWORD as string,
        options: {
            encrypt: false,
            trustServerCertificate: true,
            requestTimeout: 60000,
            connectTimeout: 30000,
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    };

    console.log('🔌 Creating default SQL connection...');
    defaultSqlPool = await sql.connect(config);
    console.log('✅ Default SQL Connection pool created');
    return defaultSqlPool;
};

const companyConfigs: Map<number, CompanyDBConfig> = new Map();
const companyConfigsByDBName: Map<string, CompanyDBConfig> = new Map();

function loadCompanyConfigurations(): void {
    console.log('📂 Loading company configurations from .env...');
    for (let i = 1; i <= 10; i++) {
        const companyId = parseInt(process.env[`COMPANY${i}_ID`] ?? '0', 10);
        const dbName = process.env[`COMPANY${i}_DATABASE`];
        const dbHost = process.env[`COMPANY${i}_DB_HOST`];
        const dbUser = process.env[`COMPANY${i}_DB_USER`];
        const dbPassword = process.env[`COMPANY${i}_DB_PASSWORD`];
        if (!companyId || !dbName || !dbHost || !dbUser || !dbPassword) continue;
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
        };
        companyConfigs.set(companyId, config);
        companyConfigsByDBName.set(dbName, config);
        console.log(`✅ Loaded Company ${companyId}: ${config.name} (${dbName})`);
    }
    console.log(`📊 Total companies loaded: ${companyConfigs.size}`);
}

loadCompanyConfigurations();

const companyConnections: Map<string, Sequelize> = new Map();
export const tokenSessions: Map<string, TokenSession> = new Map();
const userCompanyTokens: Map<number, Map<number, string>> = new Map();

export function getCompanyConfig(companyId: number): CompanyDBConfig | null {
    return companyConfigs.get(companyId) ?? null;
}

export function getCompanyConfigByDBName(dbName: string): CompanyDBConfig | null {
    return companyConfigsByDBName.get(dbName) ?? null;
}

export async function getCompanyDatabase(identifier: number | string): Promise<Sequelize> {
    let config: CompanyDBConfig | null;
    let cacheKey: string;
    if (typeof identifier === 'number') {
        config = getCompanyConfig(identifier);
        cacheKey = `company_${identifier}`;
    } else {
        config = getCompanyConfigByDBName(identifier);
        cacheKey = `db_${identifier}`;
    }
    if (!config) throw new Error(`No DB configuration found for: ${identifier}`);
    if (companyConnections.has(cacheKey)) {
        const existing = companyConnections.get(cacheKey)!;
        try {
            await existing.authenticate();
            console.log(`♻️ Reusing connection: ${config.database}`);
            return existing;
        } catch {
            console.warn(`🔄 Stale connection for ${config.database}, reconnecting…`);
            companyConnections.delete(cacheKey);
        }
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
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    });
    try {
        await seq.authenticate();
        console.log(`✅ Connected: ${config.database} (${config.name})`);
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
    if (session.dbName) return getCompanyDatabase(session.dbName);
    if (session.companyId) return getCompanyDatabase(session.companyId);
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

// UPDATED: Added localUserId parameter
export function storeTokenSession(
    token: string,
    userId: number,
    localUserId: number | null,  // ADDED parameter
    companyId: number,
    dbName: string,
    companyName: string,
): void {
    tokenSessions.set(token, { 
        token, 
        userId, 
        localUserId,  // ADDED field
        companyId, 
        dbName, 
        companyName, 
        createdAt: new Date() 
    });
    if (!userCompanyTokens.has(userId)) userCompanyTokens.set(userId, new Map());
    userCompanyTokens.get(userId)!.set(companyId, token);
    console.log(`📝 Session stored — User: ${userId}, LocalUser: ${localUserId}, Company: ${companyId} (${companyName}), DB: ${dbName}`);
}

export function verifyTokenSession(token: string): TokenSession | null {
    const s = tokenSessions.get(token);
    if (!s) return null;
    const hoursSinceCreation = (Date.now() - s.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
        tokenSessions.delete(token);
        console.log('⏰ Session expired');
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
    console.log('🗑️ Session removed');
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
    
    if (sqlConnectionPools.has(key)) {
        const pool = sqlConnectionPools.get(key)!;
        try {
            await pool.request().query('SELECT 1');
            console.log(`♻️ Reusing SQL connection for company: ${companyId}`);
            return pool;
        } catch (error) {
            console.warn(`⚠️ Stale connection for company ${companyId}, reconnecting...`);
            sqlConnectionPools.delete(key);
        }
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
    
    console.log(`🔌 Creating SQL connection for company: ${config.name} (${config.database})`);
    
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
            connectTimeout: 30000,
            ...(config.instance && !config.port && { instanceName: config.instance }),
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    };

    try {
        const pool = await sql.connect(sqlConfig);
        sqlConnectionPools.set(key, pool);
        console.log(`✅ SQL Connection created for company: ${config.name}`);
        return pool;
    } catch (error) {
        console.error(`❌ Failed to connect to company ${config.name}:`, error);
        throw error;
    }
};

// Close all company connections
export async function closeAllCompanyConnections(): Promise<void> {
    console.log('🛑 Closing all company connections…');
    
    // Close Sequelize connections
    for (const [key, conn] of companyConnections) {
        try {
            await conn.close();
            console.log(`   Closed Sequelize: ${key}`);
        } catch (err) {
            console.error(`   Error closing ${key}:`, err);
        }
    }
    companyConnections.clear();
    
    // Close SQL connection pools
    for (const [key, pool] of sqlConnectionPools) {
        try {
            await pool.close();
            console.log(`   Closed SQL Pool: ${key}`);
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
            console.log('   Closed Default SQL Pool');
        } catch (err) {
            console.error('   Error closing default SQL pool:', err);
        }
    }
    
    console.log('✅ All connections closed');
}

export const sequelize = getDefaultConnection();