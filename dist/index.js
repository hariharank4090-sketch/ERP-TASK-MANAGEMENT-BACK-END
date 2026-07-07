"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const database_config_1 = require("./config/database.config");
const swagger_1 = require("./config/swagger");
const createUploadFolders_1 = require("./middleware/createUploadFolders");
const companyDb_middleware_1 = require("./middleware/companyDb.middleware");
const login_route_1 = __importDefault(require("./routes/configuration/login.route"));
const index_route_1 = __importDefault(require("./routes/index.route"));
const sequalizer_1 = require("./config/sequalizer");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// ─── Core middleware ─────────────────────────────────────────────────────────
app.use((0, cors_1.default)({ origin: '*', credentials: true }));
app.use((0, compression_1.default)({ threshold: 512 })); // compress responses > 512 bytes
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)(':method :url :status :response-time ms'));
// Request logger (omits passwords)
app.use((req, _res, next) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
    const body = { ...req.body };
    if (body.password)
        body.password = '[redacted]';
    if (body.Password)
        body.Password = '[redacted]';
    if (Object.keys(body).length)
        console.log('📝 Body:', body);
    next();
});
(0, createUploadFolders_1.createUploadFolders)();
// ─── DB boot ─────────────────────────────────────────────────────────────────
(async () => {
    try {
        await database_config_1.sequelize.authenticate();
        console.log('✅ Connected to User Portal DB:', process.env.DATABASE || 'User_Portal');
    }
    catch (err) {
        console.error('❌ DB connection failed:', err);
        process.exit(1);
    }
})();
// ─── Routes ──────────────────────────────────────────────────────────────────
// Public: no auth required
app.use('/api/configuration/login', login_route_1.default);
// Swagger
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// ── Company DB middleware — runs before EVERY /api route ─────────────────────
//
// For every request that has a Bearer token this middleware:
//   1. Reads the token from Authorization header
//   2. Resolves the session (userId, companyId, dbName)
//   3. Opens / reuses the company DB connection
//   4. Attaches req.companyDB so that controllers just call getDbConnection(req)
//
app.use('/api', companyDb_middleware_1.setCompanyDatabase);
// Protected API routes
app.use('/api', index_route_1.default);
// ─── Health / stats ──────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
    try {
        await database_config_1.sequelize.authenticate();
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected',
            ...(0, database_config_1.getConnectionStats)(),
        });
    }
    catch (err) {
        res.status(500).json({
            status: 'unhealthy',
            error: err instanceof Error ? err.message : 'unknown',
        });
    }
});
app.get('/api/connections/stats', (_req, res) => {
    res.json({ success: true, timestamp: new Date().toISOString(), data: (0, database_config_1.getConnectionStats)() });
});
// ─── Static frontend (optional) ──────────────────────────────────────────────
const reactBuildPath = path_1.default.join(__dirname, '../frontend');
// Check if frontend build exists
const indexPath = path_1.default.join(reactBuildPath, 'index.html');
const hasFrontend = fs_1.default.existsSync(indexPath);
if (hasFrontend) {
    console.log('✅ Frontend build found at:', reactBuildPath);
    // Serve static files from frontend directory
    app.use(express_1.default.static(reactBuildPath));
    // ─── CRITICAL FIX: Catch-all route for client-side routing ───
    // This must be AFTER all API routes and static file middleware
    app.get('*', (req, res) => {
        // Skip API routes that might have been missed
        if (req.path.startsWith('/api/') || req.path.startsWith('/api-docs') || req.path === '/health') {
            return res.status(404).json({
                status: 'error',
                message: `API endpoint ${req.path} not found`
            });
        }
        // For all other routes, serve index.html (for React Router)
        res.sendFile(indexPath, (err) => {
            if (err) {
                console.error('Error serving index.html:', err);
                res.status(500).send('Error loading application');
            }
        });
    });
}
else {
    console.warn('⚠️  Frontend build not found at:', reactBuildPath);
    console.warn('   API routes are available but frontend will return 404');
    // Optional: Return a message for missing frontend
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/') && req.path !== '/api-docs' && req.path !== '/health') {
            res.status(404).json({
                status: 'error',
                message: `Frontend not built. Please run build command first.`,
                path: req.path
            });
        }
        else {
            res.status(404).json({ status: 'error', message: 'Not found' });
        }
    });
}
// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error', data: null, others: {} });
});
// ─── Graceful shutdown ───────────────────────────────────────────────────────
const gracefulShutdown = async () => {
    console.log('\n🛑 Shutting down…');
    try {
        await (0, sequalizer_1.closeAllCompanyConnections)();
        await database_config_1.sequelize.close();
        console.log('✅ All connections closed');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Shutdown error:', err);
        process.exit(1);
    }
};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', (err) => { console.error('❌ uncaughtException:', err); gracefulShutdown(); });
process.on('unhandledRejection', (r, p) => { console.error('❌ unhandledRejection:', p, r); });
// ─── Start ───────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Server running');
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📚 Docs: http://localhost:${PORT}/api-docs`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
    console.log('='.repeat(60) + '\n');
});
// Keep HTTP connections alive for reuse (reduces TCP handshake overhead)
server.keepAliveTimeout = 65000;
server.headersTimeout = 70000;
exports.default = app;
