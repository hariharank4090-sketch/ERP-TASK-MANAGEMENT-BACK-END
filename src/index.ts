// src/index.ts
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';

import { sequelize, getConnectionStats, closeAllCompanyConnections } from './config/database.config';
import { swaggerSpec } from './config/swagger';
import { createUploadFolders } from './middleware/createUploadFolders';
import { setCompanyDatabase } from './middleware/companyDb.middleware';

import authRoutes from './routes/configuration/login.route';
import appRoutes from './routes/index.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// ─── Core middleware ─────────────────────────────────────────────────────────

app.use(cors({ origin: '*', credentials: true }));
app.use(compression({ threshold: 512 })); // compress responses > 512 bytes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan(':method :url :status :response-time ms'));

createUploadFolders();
const uploadsDirPath = path.resolve(process.cwd(), 'uploads');
const externalTicketingUploadsPath = path.resolve('D:/ticketing system/Ticketing_system_backend/uploads');

const MIME_BY_EXT: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.oga': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.weba': 'audio/webm',
    '.flac': 'audio/flac',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
};

const sendTicketMediaFile = (res: express.Response, filePath: string, requestedExt?: string) => {
    const actualExt = path.extname(filePath).toLowerCase();
    const mimeType = MIME_BY_EXT[actualExt] || (requestedExt ? MIME_BY_EXT[requestedExt] : undefined);
    if (mimeType) {
        res.setHeader('Content-Type', mimeType);
    }
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Disposition', 'inline');
    return res.sendFile(filePath);
};

const serveTicketUploadFallback: express.RequestHandler = (req, res, next) => {
    const rawFile = req.params.filename || '';
    const safeFile = path.basename(rawFile);
    if (!safeFile) return next();

    const candidateDirs = [
        path.join(uploadsDirPath, 'Tickets'),
        path.join(uploadsDirPath, 'tickets'),
        path.join(externalTicketingUploadsPath, 'Tickets'),
    ];

    const ext = path.extname(safeFile).toLowerCase();

    for (const dir of candidateDirs) {
        const exactPath = path.join(dir, safeFile);
        if (fs.existsSync(exactPath) && fs.statSync(exactPath).isFile()) {
            return sendTicketMediaFile(res, exactPath, ext);
        }
    }

    // Fallback for shared DB ticket attachments (TCK_*) when exact file was uploaded on another machine
    if (ext) {
        const isAudioExt = /^\.(mp3|wav|ogg|oga|m4a|aac|weba|flac)$/i.test(ext);
        const isVideoExt = /^\.(mp4|webm|mov|mkv|avi|wmv)$/i.test(ext);
        const isImageExt = /^\.(jpeg|jpg|png|gif|webp|bmp)$/i.test(ext);

        for (const dir of candidateDirs) {
            if (!fs.existsSync(dir)) continue;
            const files = fs.readdirSync(dir);
            let match = files.find((f) => path.extname(f).toLowerCase() === ext);
            if (!match && isAudioExt) {
                match = files.find((f) => /^\.(mp3|wav|ogg|oga|m4a|aac|weba|flac)$/i.test(path.extname(f)));
            } else if (!match && isVideoExt) {
                match = files.find((f) => /^\.(mp4|webm|mov)$/i.test(path.extname(f)));
            } else if (!match && isImageExt) {
                match = files.find((f) => /^\.(jpeg|jpg|png|gif|webp)$/i.test(path.extname(f)));
            }
            if (match) {
                return sendTicketMediaFile(res, path.join(dir, match), ext);
            }
        }
    }

    return next();
};

app.get(['/uploads/Tickets/:filename', '/uploads/tickets/:filename', '/api/uploads/Tickets/:filename', '/api/uploads/tickets/:filename'], serveTicketUploadFallback);
app.use('/uploads', express.static(uploadsDirPath));
app.use('/api/uploads', express.static(uploadsDirPath));
if (fs.existsSync(externalTicketingUploadsPath)) {
    app.use('/uploads', express.static(externalTicketingUploadsPath));
    app.use('/api/uploads', express.static(externalTicketingUploadsPath));
}

// ─── DB boot ─────────────────────────────────────────────────────────────────

(async () => {
    try {
        await sequelize.authenticate();
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
    // Serve static files from frontend directory
    app.use(express.static(reactBuildPath));

    // ─── CRITICAL FIX: Catch-all route for client-side routing ───
    // This must be AFTER all API routes and static file middleware
    app.get('*', (req, res) => {
        // Skip API routes and missing uploads that might have been missed
        if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.startsWith('/api-docs') || req.path === '/health') {
            return res.status(404).json({
                status: 'error',
                message: `Endpoint ${req.path} not found`
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
    try {
        await closeAllCompanyConnections();
        await sequelize.close();
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
    console.log(`Server running at http://localhost:${PORT}`);
    

    
});

// Keep HTTP connections alive for reuse (reduces TCP handshake overhead)
server.keepAliveTimeout = 65000;
server.headersTimeout = 70000;


export default app;