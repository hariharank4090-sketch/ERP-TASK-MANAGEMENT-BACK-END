// src/index.ts
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';

import { sequelize, getConnectionStats } from './config/database.config';
import { swaggerSpec } from './config/swagger';
import { createUploadFolders } from './middleware/createUploadFolders';
import { setCompanyDatabase } from './middleware/companyDb.middleware';

import authRoutes from './routes/configuration/login.route';
import appRoutes from './routes/index.route';
import { closeAllCompanyConnections } from './config/sequalizer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Core middleware ─────────────────────────────────────────────────────────

app.use(cors({ origin: '*', credentials: true }));
app.use(compression({ threshold: 512 })); // compress responses > 512 bytes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :status :response-time ms'));

// Request logger (omits passwords)
app.use((req, _res, next) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
    const body = { ...req.body };
    if (body.password) body.password = '[redacted]';
    if (body.Password) body.Password = '[redacted]';
    if (Object.keys(body).length) console.log('📝 Body:', body);
    next();
});

createUploadFolders();

// ─── DB boot ─────────────────────────────────────────────────────────────────

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to User Portal DB:', process.env.DATABASE || 'User_Portal');
    } catch (err) {
        console.error('❌ DB connection failed:', err);
        process.exit(1);
    }
})();

// ─── Routes ──────────────────────────────────────────────────────────────────

// Public: no auth required
app.use('/api/configuration/login', authRoutes);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Company DB middleware — runs before EVERY /api route ─────────────────────
//
// For every request that has a Bearer token this middleware:
//   1. Reads the token from Authorization header
//   2. Resolves the session (userId, companyId, dbName)
//   3. Opens / reuses the company DB connection
//   4. Attaches req.companyDB so that controllers just call getDbConnection(req)
//
app.use('/api', setCompanyDatabase);

// Protected API routes
app.use('/api', appRoutes);

// ─── Health / stats ──────────────────────────────────────────────────────────

app.get('/health', async (_req, res) => {
    try {
        await sequelize.authenticate();
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected',
            ...getConnectionStats(),
        });
    } catch (err) {
        res.status(500).json({
            status: 'unhealthy',
            error: err instanceof Error ? err.message : 'unknown',
        });
    }
});

app.get('/api/connections/stats', (_req, res) => {
    res.json({ success: true, timestamp: new Date().toISOString(), data: getConnectionStats() });
});

// ─── Static frontend (optional) ──────────────────────────────────────────────

const reactBuildPath = path.join(__dirname, '../frontend');

// Check if frontend build exists
const indexPath = path.join(reactBuildPath, 'index.html');
const hasFrontend = fs.existsSync(indexPath);

if (hasFrontend) {
    console.log('✅ Frontend build found at:', reactBuildPath);
    
    // Serve static files from frontend directory
    app.use(express.static(reactBuildPath));
    
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
} else {
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
        } else {
            res.status(404).json({ status: 'error', message: 'Not found' });
        }
    });
}

// ─── Error handler ───────────────────────────────────────────────────────────

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error', data: null, others: {} });
});

// ─── Graceful shutdown ───────────────────────────────────────────────────────

const gracefulShutdown = async () => {
    console.log('\n🛑 Shutting down…');
    try {
        await closeAllCompanyConnections();
        await sequelize.close();
        console.log('✅ All connections closed');
        process.exit(0);
    } catch (err) {
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


export default app;