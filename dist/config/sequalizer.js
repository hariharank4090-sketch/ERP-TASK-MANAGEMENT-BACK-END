"use strict";
// import { Sequelize } from 'sequelize';
// import dotenv from "dotenv";
// dotenv.config();
// import { 
//     getDatabaseFromToken, 
//     storeTokenSession,
// } from './database.config';
// import { Request, Response, NextFunction } from 'express';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.getDefaultConnection = void 0;
exports.getCompanyConfig = getCompanyConfig;
exports.getCompanyConfigByDBName = getCompanyConfigByDBName;
exports.getCompanyDatabase = getCompanyDatabase;
exports.getUserDatabaseConnectionFromToken = getUserDatabaseConnectionFromToken;
exports.getDatabaseFromToken = getDatabaseFromToken;
exports.getCompanyIdFromToken = getCompanyIdFromToken;
exports.storeTokenSession = storeTokenSession;
exports.verifyTokenSession = verifyTokenSession;
exports.getTokenForCompany = getTokenForCompany;
exports.removeTokenSession = removeTokenSession;
exports.getConnectionStats = getConnectionStats;
exports.closeAllCompanyConnections = closeAllCompanyConnections;
// // ═══════════════════════════════════════════════════════════════
// // DATABASE CONNECTION POOL CONFIGURATION
// // ═══════════════════════════════════════════════════════════════
// const poolOptions = {
//     max: Number(process.env.DB_POOL_MAX) || 10,
//     min: Number(process.env.DB_POOL_MIN) || 0,
//     acquire: Number(process.env.DB_POOL_ACQUIRE) || 30000,
//     idle: Number(process.env.DB_POOL_IDLE) || 10000,
// };
// const dialectOptions = {
//     options: {
//         encrypt: true,
//         trustServerCertificate: true,
//         enableArithAbort: true,
//         requestTimeout: 60000,
//     },
// };
// // Cache for company connections
// const companyConnections: Map<string, Sequelize> = new Map();
// // ✅ DEFAULT CONNECTION (fallback)
// export const sequelize = new Sequelize({
//     dialect: 'mssql',
//     host: process.env.SERVER as string,
//     username: process.env.USER as string,
//     password: process.env.PASSWORD as string,
//     database: process.env.DATABASE as string,
//     logging: false,
//     dialectOptions: {
//         options: {
//             encrypt: false,
//             trustedConnection: true,
//             trustServerCertificate: true,
//             requestTimeout: 60000,
//         }
//     }
// });
// // ═══════════════════════════════════════════════════════════════
// // GET SEQUELIZE INSTANCE BASED ON DATABASE NAME
// // ═══════════════════════════════════════════════════════════════
// export const getSequelizeInstance = async (dbName: string): Promise<Sequelize> => {
//     if (!dbName || dbName === 'default') {
//         console.log("⚠️ No database name provided, using default connection");
//         return sequelize;
//     }
//     // Return cached connection if exists
//     if (companyConnections.has(dbName)) {
//         console.log(`✅ Reusing connection: ${dbName}`);
//         return companyConnections.get(dbName)!;
//     }
//     // Create new connection for this database
//     const conn = new Sequelize(
//         dbName,
//         process.env.USER || 'SMT_ADMIN',
//         process.env.PASSWORD || '',
//         {
//             host: process.env.SERVER || '103.14.120.9',
//             dialect: 'mssql',
//             logging: false,
//             dialectOptions: dialectOptions,
//             pool: poolOptions,
//         }
//     );
//     try {
//         await conn.authenticate();
//         console.log("\n═══════════════════════════════════════════════════════");
//         console.log("✅ SEQUELIZE INSTANCE CREATED");
//         console.log("═══════════════════════════════════════════════════════");
//         console.log(`📊 Database: ${dbName}`);
//         console.log(`🔧 Host: ${process.env.SERVER}`);
//         console.log(`👤 User: ${process.env.USER}`);
//         console.log(`🔗 Dialect: mssql`);
//         console.log(`💾 Connection Status: AUTHENTICATED`);
//         console.log("═══════════════════════════════════════════════════════\n");
//         companyConnections.set(dbName, conn);
//         return conn;
//     } catch (err: any) {
//         console.error(`❌ Cannot connect to ${dbName}:`, err.message);
//         console.log("⚠️ Falling back to default database");
//         return sequelize;
//     }
// };
// // ═══════════════════════════════════════════════════════════════
// // GET SEQUELIZE FROM TOKEN (Recommended approach)
// // ═══════════════════════════════════════════════════════════════
// export const getSequelizeFromToken = async (token: string): Promise<Sequelize> => {
//     const dbName = getDatabaseFromToken(token);
//     console.log("\n═══════════════════════════════════════════════════════");
//     console.log("🔑 TOKEN SEQUELIZE LOOKUP");
//     console.log("═══════════════════════════════════════════════════════");
//     console.log(`🔐 Token: ${token.substring(0, 20)}...`);
//     console.log(`📊 Database from Token: ${dbName || 'default'}`);
//     console.log("═══════════════════════════════════════════════════════\n");
//     if (dbName && dbName !== 'default') {
//         return await getSequelizeInstance(dbName);
//     }
//     return sequelize;
// };
// // ═══════════════════════════════════════════════════════════════
// // MIDDLEWARE - Auto-set sequelize based on token
// // ═══════════════════════════════════════════════════════════════
// export const sequelizeFromTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const token = req.headers.authorization?.split(' ')[1];
//         if (!token) {
//             console.log("⚠️ No token provided, using default sequelize");
//             (req as any).sequelize = sequelize;
//             (req as any).databaseName = 'default';
//             return next();
//         }
//         // Get database name from token
//         const dbName = getDatabaseFromToken(token);
//         console.log(`\n🔄 MIDDLEWARE - Setting up Sequelize`);
//         console.log(`   Token: ${token.substring(0, 20)}...`);
//         console.log(`   Database: ${dbName || 'default'}`);
//         // Get appropriate sequelize instance
//         if (dbName && dbName !== 'default') {
//             (req as any).sequelize = await getSequelizeInstance(dbName);
//             (req as any).databaseName = dbName;
//         } else {
//             (req as any).sequelize = sequelize;
//             (req as any).databaseName = 'default';
//         }
//         console.log(`   Status: ✅ Sequelize ready for ${(req as any).databaseName}\n`);
//         next();
//     } catch (error: any) {
//         console.error("❌ Middleware error:", error.message);
//         (req as any).sequelize = sequelize;
//         next();
//     }
// };
// // Helper function to get current sequelize instance from request
// export const getCurrentSequelize = (req: Request): Sequelize => {
//     return (req as any).sequelize || sequelize;
// };
// // Helper function to get current database name from request
// export const getCurrentDatabaseName = (req: Request): string => {
//     return (req as any).databaseName || 'default';
// };
// // Request handler for testing
// async function handleUserRequest(req: Request, res: Response) {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//         return res.status(401).json({ error: "No token provided" });
//     }
//     try {
//         const dbSequelize = (req as any).sequelize || await getSequelizeFromToken(token);
//         const dbName = (req as any).databaseName || getDatabaseFromToken(token) || 'default';
//         console.log("\n═══════════════════════════════════════════════════════");
//         console.log("📊 HANDLER - DATABASE DETAILS");
//         console.log("═══════════════════════════════════════════════════════");
//         console.log(`✅ Using Sequelize for: ${dbName}`);
//         console.log(`🔗 Connection Status: ${dbSequelize === sequelize ? 'Default' : 'Company-Specific'}`);
//         console.log(`📋 Dialect: ${dbSequelize.getDialect()}`);
//         console.log(`💾 Database Config:`, {
//             host: dbSequelize.config.host,
//             database: dbSequelize.config.database,
//             username: dbSequelize.config.username,
//             dialect: dbSequelize.config.dialect,
//         });
//         console.log("═══════════════════════════════════════════════════════\n");
//         res.json({ 
//             success: true, 
//             database: dbName,
//             sequelize: {
//                 dialect: dbSequelize.getDialect(),
//                 database: dbSequelize.config.database,
//                 host: dbSequelize.config.host,
//             },
//             message: `Connected to ${dbName} via Sequelize`
//         });
//     } catch (error: any) {
//         console.error("❌ Error in handler:", error.message);
//         res.status(500).json({ error: error.message });
//     }
// }
// export { handleUserRequest };
// config/sequalizer.ts
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let defaultConnection = null;
/**
 * Parses SQL Server host strings into { server, instance?, port? }
 *
 * Valid formats:
 *   "192.168.1.52"                  → server only        (uses port 1433)
 *   "192.168.1.52,1433"             → server + port
 *   "192.168.1.52\MASTER"           → server + instance  (SQL Browser resolves port)
 *   "192.168.1.52\SQL_2019,1435"    → server + instance + explicit port (uses port directly)
 */
function parseHostString(raw) {
    // Strip surrounding quotes that can appear in .env values
    let s = raw.trim().replace(/^["']|["']$/g, '');
    // Collapse accidental double-backslashes from .env escaping
    s = s.replace(/\\\\/g, '\\');
    // Remove any extra backslashes (fix for cases like server\instance1\instance2)
    const parts = s.split('\\');
    if (parts.length > 2) {
        // If more than 2 parts, take first as server and last as instance
        s = `${parts[0]}\\${parts[parts.length - 1]}`;
        console.warn(`⚠️ Fixed malformed host string: ${raw} → ${s}`);
    }
    // ── server\instance,port  e.g. "192.168.1.52\SQL_2019,1435" ──────────────
    const instPort = s.match(/^([^\\,]+)\\([^\\,]+),(\d+)$/);
    if (instPort) {
        return {
            server: instPort[1].trim(),
            instance: instPort[2].trim(),
            port: parseInt(instPort[3], 10)
        };
    }
    // ── server\instance  e.g. "192.168.1.52\SQL_2019" ─────────────────────────
    const inst = s.match(/^([^\\,]+)\\([^\\,]+)$/);
    if (inst) {
        return { server: inst[1].trim(), instance: inst[2].trim() };
    }
    // ── server,port  e.g. "192.168.1.52,1433" ───────────────────────────────
    const port = s.match(/^([^\\,]+),(\d+)$/);
    if (port) {
        return { server: port[1].trim(), port: parseInt(port[2], 10) };
    }
    // ── plain server / IP ────────────────────────────────────────────────────
    return { server: s };
}
/**
 * Builds Sequelize dialectOptions for MSSQL / tedious.
 * When using a named instance WITHOUT an explicit port, the port is omitted
 * so that tedious asks SQL Browser (UDP 1434) for the dynamic port.
 * When an explicit port is provided with the instance, we DO NOT set instanceName.
 */
function buildDialectOptions(instance, explicitPort) {
    const opts = {
        options: {
            encrypt: false,
            trustServerCertificate: true,
            requestTimeout: 60_000,
            connectionTimeout: 30_000,
        },
    };
    // Only set instanceName if we have an instance AND no explicit port
    // When port is explicitly provided, we connect directly via TCP
    if (instance && !explicitPort) {
        opts.options.instanceName = instance;
    }
    return opts;
}
// ─── Default (User Portal) connection ────────────────────────────────────────
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
            pool: { max: 5, min: 0, acquire: 30_000, idle: 10_000 },
        });
    }
    return defaultConnection;
};
exports.getDefaultConnection = getDefaultConnection;
// ─── Company config registry ──────────────────────────────────────────────────
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
        const addr = h.instance
            ? `${h.server}\\${h.instance}${h.port ? `,${h.port}` : ' (SQL Browser)'}`
            : `${h.server},${h.port ?? 1433}`;
        console.log(`✅ Loaded Company ${companyId}: ${config.name}`);
        console.log(`   Address : ${addr}`);
        console.log(`   Database: ${dbName}`);
        console.log(`   Connection Mode: ${config.port ? 'Direct TCP' : (config.instance ? 'SQL Browser' : 'Direct TCP')}`);
    }
    console.log(`📊 Total companies loaded: ${companyConfigs.size}`);
}
loadCompanyConfigurations();
// ─── Connection cache ─────────────────────────────────────────────────────────
const companyConnections = new Map();
const tokenSessions = new Map();
const userCompanyTokens = new Map();
// ─── Public config accessors ──────────────────────────────────────────────────
function getCompanyConfig(companyId) {
    return companyConfigs.get(companyId) ?? null;
}
function getCompanyConfigByDBName(dbName) {
    return companyConfigsByDBName.get(dbName) ?? null;
}
// ─── Company database connector ───────────────────────────────────────────────
async function getCompanyDatabase(identifier) {
    let config;
    let cacheKey;
    if (typeof identifier === 'number') {
        config = getCompanyConfig(identifier);
        cacheKey = `company_${identifier}`;
    }
    else {
        config = getCompanyConfigByDBName(identifier);
        cacheKey = `db_${identifier}`;
    }
    if (!config)
        throw new Error(`No DB configuration found for: ${identifier}`);
    // Return cached connection immediately (connection pool handles health checks)
    if (companyConnections.has(cacheKey)) {
        const existing = companyConnections.get(cacheKey);
        return existing;
    }
    // Human-readable address for logs
    const addrLog = config.instance
        ? `${config.host}\\${config.instance}${config.port ? `,${config.port}` : ' (SQL Browser)'}`
        : `${config.host},${config.port ?? 1433}`;
    console.log(`🔌 Connecting → ${addrLog} / ${config.database}`);
    // CRITICAL FIX: 
    // - If explicit port is provided (even with instance), use that port directly via TCP
    // - Only use SQL Browser (omit port) when there's an instance AND no explicit port
    const usePort = config.port ?? (config.instance ? undefined : 1433);
    // Log the connection strategy
    if (config.instance && config.port) {
        console.log(`   📡 Using direct TCP connection on port ${config.port} (explicit port with instance)`);
    }
    else if (config.instance && !config.port) {
        console.log(`   📡 Using SQL Browser (UDP 1434) to resolve dynamic port for instance "${config.instance}"`);
    }
    else {
        console.log(`   📡 Using direct TCP connection on port ${usePort}`);
    }
    const seq = new sequelize_1.Sequelize({
        dialect: 'mssql',
        host: config.host,
        port: usePort,
        username: config.user,
        password: config.password,
        database: config.database,
        logging: false,
        dialectOptions: buildDialectOptions(config.instance, config.port),
        pool: {
            max: parseInt(process.env.DB_POOL_MAX || '10'),
            min: parseInt(process.env.DB_POOL_MIN || '0'),
            acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
            idle: parseInt(process.env.DB_POOL_IDLE || '10000')
        },
    });
    try {
        await seq.authenticate();
        console.log(`✅ Connected: ${config.database} (${config.name})`);
        companyConnections.set(cacheKey, seq);
        // Cross-index so both lookup styles hit cache
        if (typeof identifier === 'string') {
            companyConnections.set(`company_${config.id}`, seq);
        }
        else {
            companyConnections.set(`db_${config.database}`, seq);
        }
        return seq;
    }
    catch (error) {
        const reason = error?.parent?.message ?? error?.message ?? String(error);
        console.error(`❌ Connection FAILED: ${config.database}`);
        console.error(`   Address : ${addrLog}`);
        console.error(`   Port    : ${usePort ?? 'none — SQL Browser resolves'}`);
        console.error(`   Reason  : ${reason}`);
        // Enhanced debugging info
        console.error(`   Full connection details:`);
        console.error(`   - Host: ${config.host}`);
        console.error(`   - Port: ${usePort ?? 'dynamic'}`);
        console.error(`   - Instance: ${config.instance || 'none'}`);
        console.error(`   - Database: ${config.database}`);
        console.error(`   - User: ${config.user}`);
        if (config.instance && !config.port) {
            console.error([
                '',
                '   📋 Named-instance checklist:',
                `   1. SQL Server Browser must be RUNNING on ${config.host}`,
                `      → Run on that server: net start SQLBrowser`,
                `   2. UDP port 1434 must be open inbound on ${config.host}`,
                '   3. Confirm the instance name:',
                `      sqlcmd -S ${config.host}\\${config.instance} -Q "SELECT @@SERVICENAME"`,
                `   4. Correct .env format:`,
                `      COMPANY*_DB_HOST="${config.host}\\${config.instance}"`,
                '',
            ].join('\n'));
        }
        else if (config.instance && config.port) {
            console.error([
                '',
                '   📋 Direct TCP with instance+port checklist:',
                `   1. TCP port ${config.port} must be open on ${config.host}`,
                '   2. SQL Server must be listening on TCP (check SQL Server Config Mgr)',
                `   3. Verify connection: telnet ${config.host} ${config.port}`,
                `   4. Test with sqlcmd: sqlcmd -S ${config.host},${config.port} -U ${config.user} -P ****`,
                `   5. Your .env format: COMPANY*_DB_HOST="${config.host}\\${config.instance},${config.port}"`,
                '',
            ].join('\n'));
        }
        else {
            console.error([
                '',
                '   📋 TCP checklist:',
                `   1. TCP port ${usePort} must be open on ${config.host}`,
                '   2. SQL Server must be listening on TCP (check SQL Server Config Mgr)',
                `   3. Test with telnet: telnet ${config.host} ${usePort}`,
                `   4. Test with sqlcmd: sqlcmd -S ${config.host},${usePort} -U ${config.user} -P ****`,
                '',
            ].join('\n'));
        }
        throw error;
    }
}
// ─── Token / session helpers ──────────────────────────────────────────────────
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
    return tokenSessions.get(token)?.dbName ?? null;
}
function getCompanyIdFromToken(token) {
    return tokenSessions.get(token)?.companyId ?? null;
}
function storeTokenSession(token, userId, companyId, dbName, companyName) {
    tokenSessions.set(token, { token, userId, companyId, dbName, companyName, createdAt: new Date() });
    if (!userCompanyTokens.has(userId))
        userCompanyTokens.set(userId, new Map());
    userCompanyTokens.get(userId).set(companyId, token);
    console.log(`📝 Session stored — User: ${userId}, Company: ${companyId} (${companyName}), DB: ${dbName}`);
}
function verifyTokenSession(token) {
    const s = tokenSessions.get(token);
    if (!s)
        return null;
    if ((Date.now() - s.createdAt.getTime()) / (1_000 * 60 * 60) > 24) {
        tokenSessions.delete(token);
        console.log('⏰ Session expired');
        return null;
    }
    return s;
}
function getTokenForCompany(userId, companyId) {
    return userCompanyTokens.get(userId)?.get(companyId) ?? null;
}
function removeTokenSession(token) {
    const s = tokenSessions.get(token);
    if (!s)
        return;
    const map = userCompanyTokens.get(s.userId);
    if (map) {
        map.delete(s.companyId);
        if (map.size === 0)
            userCompanyTokens.delete(s.userId);
    }
    tokenSessions.delete(token);
    console.log('🗑️  Session removed');
}
function getConnectionStats() {
    return {
        activeSessions: tokenSessions.size,
        activeCompanyConnections: companyConnections.size,
        loadedCompanies: companyConfigs.size,
        companies: Array.from(companyConfigs.values()).map(c => ({
            id: c.id, name: c.name, database: c.database,
            host: c.host, port: c.port, instance: c.instance,
        })),
    };
}
async function closeAllCompanyConnections() {
    console.log('🛑 Closing all company connections…');
    for (const [key, conn] of companyConnections) {
        await conn.close();
        console.log(`   Closed: ${key}`);
    }
    companyConnections.clear();
    console.log('✅ All connections closed');
}
exports.sequelize = (0, exports.getDefaultConnection)();
