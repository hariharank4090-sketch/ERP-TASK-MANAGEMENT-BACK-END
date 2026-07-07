"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.getCompanySqlConnection = exports.tokenSessions = exports.getDefaultSqlConnection = exports.getDefaultConnection = void 0;
exports.getCompanyConfig = getCompanyConfig;
exports.getCompanyConfigByDBName = getCompanyConfigByDBName;
exports.getCompanyDatabase = getCompanyDatabase;
exports.getUserDatabaseConnectionFromToken = getUserDatabaseConnectionFromToken;
exports.getDatabaseFromToken = getDatabaseFromToken;
exports.getCompanyIdFromToken = getCompanyIdFromToken;
exports.getLocalUserIdFromToken = getLocalUserIdFromToken;
exports.storeTokenSession = storeTokenSession;
exports.verifyTokenSession = verifyTokenSession;
exports.getTokenForCompany = getTokenForCompany;
exports.removeTokenSession = removeTokenSession;
exports.getConnectionStats = getConnectionStats;
exports.closeAllCompanyConnections = closeAllCompanyConnections;
const sequelize_1 = require("sequelize");
const mssql_1 = __importDefault(require("mssql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let defaultConnection = null;
let defaultSqlPool = null;
// Cache for SQL connection pools
const sqlConnectionPools = new Map();
function parseHostString(raw) {
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
function buildDialectOptions(instance, explicitPort) {
    const opts = {
        options: {
            encrypt: false,
            trustServerCertificate: true,
            requestTimeout: 60000,
            connectTimeout: 60000, // WAN-safe: remote server needs more time to connect
            enableArithAbort: true, // Faster SQL Server query execution
            abortTransactionOnError: true,
            keepAlive: true, // Prevent firewall from silently dropping connections
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
const getDefaultConnection = () => {
    if (!defaultConnection) {
        const h = parseHostString(process.env.DB_HOST || process.env.SERVER || 'localhost');
        defaultConnection = new sequelize_1.Sequelize({
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
            isolationLevel: sequelize_1.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
        });
    }
    return defaultConnection;
};
exports.getDefaultConnection = getDefaultConnection;
// Get default SQL connection pool (for mssql queries)
const getDefaultSqlConnection = async () => {
    // Return cached pool directly — no ping to save round-trip latency
    if (defaultSqlPool && defaultSqlPool.connected) {
        return defaultSqlPool;
    }
    const config = {
        server: process.env.SERVER,
        database: process.env.DATABASE,
        user: process.env.USER,
        password: process.env.PASSWORD,
        options: {
            encrypt: false,
            trustServerCertificate: true,
            requestTimeout: 60000,
            connectTimeout: 60000, // WAN-safe: remote server needs more time to connect
            enableArithAbort: true, // Faster SQL Server query execution
        },
        pool: {
            max: 30,
            min: 5,
            idleTimeoutMillis: 60000
        }
    };
    console.log('🔌 Creating default SQL connection...');
    defaultSqlPool = await mssql_1.default.connect(config);
    console.log('✅ Default SQL Connection pool created');
    return defaultSqlPool;
};
exports.getDefaultSqlConnection = getDefaultSqlConnection;
const companyConfigs = new Map();
const companyConfigsByDBName = new Map();
function loadCompanyConfigurations() {
    console.log('📂 Loading company configurations from .env...');
    for (let i = 1; i <= 10; i++) {
        const companyId = parseInt(process.env[`COMPANY${i}_ID`] ?? '0', 10);
        const dbName = process.env[`COMPANY${i}_DATABASE`];
        const dbHost = process.env[`COMPANY${i}_DB_HOST`];
        const dbUser = process.env[`COMPANY${i}_DB_USER`];
        const dbPassword = process.env[`COMPANY${i}_DB_PASSWORD`];
        if (!companyId || !dbName || !dbHost || !dbUser || !dbPassword)
            continue;
        const h = parseHostString(dbHost);
        const config = {
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
const companyConnections = new Map();
exports.tokenSessions = new Map();
const userCompanyTokens = new Map();
function getCompanyConfig(companyId) {
    return companyConfigs.get(companyId) ?? null;
}
function getCompanyConfigByDBName(dbName) {
    return companyConfigsByDBName.get(dbName) ?? null;
}
async function getCompanyDatabase(identifier) {
    let config;
    if (typeof identifier === 'number') {
        config = getCompanyConfig(identifier);
    }
    else {
        config = getCompanyConfigByDBName(identifier);
    }
    if (!config)
        throw new Error(`No DB configuration found for: ${identifier}`);
    // Always use the deterministic company ID as the cache key to prevent duplicate pools
    const cacheKey = `company_${config.id}`;
    if (companyConnections.has(cacheKey)) {
        // Return cached connection directly — no authenticate() ping to save round-trip latency
        console.log(`♻️ Reusing connection: ${config.database}`);
        return companyConnections.get(cacheKey);
    }
    const usePort = config.port ?? (config.instance ? undefined : 1433);
    const seq = new sequelize_1.Sequelize({
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
        isolationLevel: sequelize_1.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
    });
    try {
        await seq.authenticate();
        console.log(`✅ Connected: ${config.database} (${config.name})`);
        companyConnections.set(cacheKey, seq);
        return seq;
    }
    catch (error) {
        console.error(`❌ Connection FAILED: ${config.database}`, error.message);
        throw error;
    }
}
async function getUserDatabaseConnectionFromToken(token) {
    const session = verifyTokenSession(token);
    if (!session)
        throw new Error('Invalid or expired token');
    if (session.dbName)
        return getCompanyDatabase(session.dbName);
    if (session.companyId)
        return getCompanyDatabase(session.companyId);
    return (0, exports.getDefaultConnection)();
}
function getDatabaseFromToken(token) {
    return exports.tokenSessions.get(token)?.dbName ?? null;
}
function getCompanyIdFromToken(token) {
    return exports.tokenSessions.get(token)?.companyId ?? null;
}
function getLocalUserIdFromToken(token) {
    return exports.tokenSessions.get(token)?.localUserId ?? null;
}
// UPDATED: Added localUserId parameter
function storeTokenSession(token, userId, localUserId, // ADDED parameter
companyId, dbName, companyName) {
    exports.tokenSessions.set(token, {
        token,
        userId,
        localUserId, // ADDED field
        companyId,
        dbName,
        companyName,
        createdAt: new Date()
    });
    if (!userCompanyTokens.has(userId))
        userCompanyTokens.set(userId, new Map());
    userCompanyTokens.get(userId).set(companyId, token);
    console.log(`📝 Session stored — User: ${userId}, LocalUser: ${localUserId}, Company: ${companyId} (${companyName}), DB: ${dbName}`);
}
function verifyTokenSession(token) {
    const s = exports.tokenSessions.get(token);
    if (!s)
        return null;
    const hoursSinceCreation = (Date.now() - s.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
        exports.tokenSessions.delete(token);
        console.log('⏰ Session expired');
        return null;
    }
    return s;
}
function getTokenForCompany(userId, companyId) {
    return userCompanyTokens.get(userId)?.get(companyId) ?? null;
}
function removeTokenSession(token) {
    const s = exports.tokenSessions.get(token);
    if (!s)
        return;
    const map = userCompanyTokens.get(s.userId);
    if (map) {
        map.delete(s.companyId);
        if (map.size === 0)
            userCompanyTokens.delete(s.userId);
    }
    exports.tokenSessions.delete(token);
    console.log('🗑️ Session removed');
}
// Connection Stats
function getConnectionStats() {
    return {
        activeSessions: exports.tokenSessions.size,
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
const getCompanySqlConnection = async (companyId) => {
    const key = `company_${companyId}`;
    // Return cached pool directly — no ping to save round-trip latency
    if (sqlConnectionPools.has(key)) {
        const pool = sqlConnectionPools.get(key);
        if (pool.connected) {
            return pool;
        }
        sqlConnectionPools.delete(key);
    }
    let config;
    if (typeof companyId === 'number') {
        config = getCompanyConfig(companyId);
    }
    else {
        config = getCompanyConfigByDBName(companyId);
    }
    if (!config) {
        throw new Error(`No configuration found for company: ${companyId}`);
    }
    const usePort = config.port ?? (config.instance ? undefined : 1433);
    console.log(`🔌 Creating SQL connection for company: ${config.name} (${config.database})`);
    const sqlConfig = {
        server: config.host,
        ...(usePort && { port: usePort }),
        database: config.database,
        user: config.user,
        password: config.password,
        options: {
            encrypt: false,
            trustServerCertificate: true,
            requestTimeout: 60000,
            connectTimeout: 60000, // WAN-safe: remote server needs more time to connect
            enableArithAbort: true, // Faster SQL Server query execution
            ...(config.instance && !config.port && { instanceName: config.instance }),
        },
        pool: {
            max: 30,
            min: 5,
            idleTimeoutMillis: 60000
        }
    };
    try {
        const pool = await mssql_1.default.connect(sqlConfig);
        sqlConnectionPools.set(key, pool);
        console.log(`✅ SQL Connection created for company: ${config.name}`);
        return pool;
    }
    catch (error) {
        console.error(`❌ Failed to connect to company ${config.name}:`, error);
        throw error;
    }
};
exports.getCompanySqlConnection = getCompanySqlConnection;
// Close all company connections
async function closeAllCompanyConnections() {
    console.log('🛑 Closing all company connections…');
    // Close Sequelize connections
    for (const [key, conn] of companyConnections) {
        try {
            await conn.close();
            console.log(`   Closed Sequelize: ${key}`);
        }
        catch (err) {
            console.error(`   Error closing ${key}:`, err);
        }
    }
    companyConnections.clear();
    // Close SQL connection pools
    for (const [key, pool] of sqlConnectionPools) {
        try {
            await pool.close();
            console.log(`   Closed SQL Pool: ${key}`);
        }
        catch (err) {
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
        }
        catch (err) {
            console.error('   Error closing default SQL pool:', err);
        }
    }
    console.log('✅ All connections closed');
}
exports.sequelize = (0, exports.getDefaultConnection)();
