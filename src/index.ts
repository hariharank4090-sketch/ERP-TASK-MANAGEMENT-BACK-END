// src/index.ts
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
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
    '.opus': 'audio/opus',
    '.wma': 'audio/x-ms-wma',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.mkv': 'video/x-matroska',
    '.avi': 'video/x-msvideo',
    '.wmv': 'video/x-ms-wmv',
    '.m4v': 'video/x-m4v',
    '.ogv': 'video/ogg',
    '.3gp': 'video/3gpp',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8',
    '.csv': 'text/csv; charset=utf-8',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
};

const getCompanyJsonTicketingBases = (): string[] => {
    const candidates = [
        process.env.COMPANIES_FILE,
        path.resolve(process.cwd(), 'companies.json'),
        path.resolve(__dirname, '../companies.json'),
    ].filter((p): p is string => typeof p === 'string' && p.trim() !== '');

    for (const filePath of candidates) {
        try {
            if (!fs.existsSync(filePath)) continue;
            const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const collected: string[] = [];

            const addUrl = (val: unknown) => {
                if (typeof val === 'string' && val.trim() !== '') {
                    collected.push(val);
                } else if (Array.isArray(val)) {
                    for (const item of val) {
                        if (typeof item === 'string' && item.trim() !== '') {
                            collected.push(item);
                        }
                    }
                }
            };

            addUrl(parsed?.ticketingUploadUrls);
            addUrl(parsed?.ticketUploadUrls);
            addUrl(parsed?.ticketingBaseUrl);

            if (Array.isArray(parsed?.companies)) {
                for (const c of parsed.companies) {
                    addUrl(c?.ticketingUploadUrls);
                    addUrl(c?.ticketingUploadUrl);
                    addUrl(c?.ticketUploadUrl);
                    addUrl(c?.ticketingUrl);
                }
            }

            return collected
                .flatMap((val) => val.split(','))
                .map((val) => val.trim().replace(/\/+$/, '').replace(/\/api$/i, ''))
                .filter((val) => /^https?:\/\//i.test(val));
        } catch {
            // ignore malformed or unreadable companies.json and try next candidate
        }
    }

    return [];
};

const getRemoteTicketingUploadBases = (): string[] => {
    const envBases = [
        process.env.TICKETING_UPLOADS_BASE_URL,
        process.env.TICKETING_API_URL,
    ]
        .filter((val): val is string => typeof val === 'string' && val.trim() !== '')
        .flatMap((val) => val.split(','))
        .map((val) => val.trim().replace(/\/+$/, '').replace(/\/api$/i, ''))
        .filter((val) => /^https?:\/\//i.test(val));

    const companyBases = getCompanyJsonTicketingBases();

    return [...new Set([
        ...envBases,
        ...companyBases,
    ])];
};

const inFlightTicketDownloads = new Map<string, Promise<string | null>>();

const sendTicketMediaFile = (res: express.Response, filePath: string, requestedExt?: string) => {
    const actualExt = path.extname(filePath).toLowerCase();
    const mimeType = MIME_BY_EXT[actualExt] || (requestedExt ? MIME_BY_EXT[requestedExt] : undefined);
    if (mimeType) {
        res.setHeader('Content-Type', mimeType);
    }
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.sendFile(filePath);
};

const requestRemoteTicketMedia = (
    targetUrl: string,
    method: 'GET' | 'HEAD',
    rangeHeader: string | undefined,
    redirectCount = 0
): Promise<http.IncomingMessage | null> => {
    return new Promise((resolve) => {
        let parsed: URL;
        try {
            parsed = new URL(targetUrl);
        } catch {
            return resolve(null);
        }

        const client = parsed.protocol === 'https:' ? https : http;
        const headers: Record<string, string> = {};
        if (rangeHeader) {
            headers['Range'] = rangeHeader;
        }

        const upstreamReq = client.request(
            parsed,
            {
                method,
                headers,
                timeout: 15000,
            },
            (upstreamRes) => {
                const status = upstreamRes.statusCode || 0;

                if ([301, 302, 303, 307, 308].includes(status) && upstreamRes.headers.location && redirectCount < 3) {
                    upstreamRes.resume();
                    const nextUrl = new URL(upstreamRes.headers.location, parsed).toString();
                    requestRemoteTicketMedia(nextUrl, method, rangeHeader, redirectCount + 1).then(resolve);
                    return;
                }

                if (status !== 200 && status !== 206) {
                    upstreamRes.resume();
                    return resolve(null);
                }

                resolve(upstreamRes);
            }
        );

        upstreamReq.on('timeout', () => {
            upstreamReq.destroy();
            resolve(null);
        });

        upstreamReq.on('error', () => {
            resolve(null);
        });

        upstreamReq.end();
    });
};

const saveStreamToFile = (upstreamRes: http.IncomingMessage, finalPath: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const dir = path.dirname(finalPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const tmpPath = path.join(dir, `.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}-${path.basename(finalPath)}`);
        const out = fs.createWriteStream(tmpPath);
        let settled = false;

        const cleanupTmp = () => {
            try {
                if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
            } catch {
                // ignore temp cleanup failure
            }
        };

        const finish = (ok: boolean) => {
            if (settled) return;
            settled = true;
            if (!ok) {
                cleanupTmp();
            }
            resolve(ok);
        };

        out.on('error', () => {
            upstreamRes.destroy();
            finish(false);
        });

        upstreamRes.on('error', () => {
            out.destroy();
            finish(false);
        });

        out.on('finish', () => {
            try {
                const expectedLenRaw = upstreamRes.headers['content-length'];
                const expectedLen = expectedLenRaw ? Number(expectedLenRaw) : NaN;
                const actualLen = fs.statSync(tmpPath).size;
                if (!Number.isNaN(expectedLen) && actualLen !== expectedLen) {
                    return finish(false);
                }
                if (fs.existsSync(finalPath)) {
                    cleanupTmp();
                    return finish(true);
                }
                fs.renameSync(tmpPath, finalPath);
                return finish(true);
            } catch {
                return finish(false);
            }
        });

        upstreamRes.pipe(out);
    });
};

const downloadAndSaveTicketFile = (safeFile: string, ext: string): Promise<string | null> => {
    const existing = inFlightTicketDownloads.get(safeFile);
    if (existing) return existing;

    const task = (async () => {
        const targetPath = path.join(uploadsDirPath, 'Tickets', safeFile);
        if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
            return targetPath;
        }

        const isHtmlExt = ext === '.html' || ext === '.htm';
        for (const baseUrl of getRemoteTicketingUploadBases()) {
            const remoteUrl = `${baseUrl}/uploads/Tickets/${encodeURIComponent(safeFile)}`;
            const upstreamRes = await requestRemoteTicketMedia(remoteUrl, 'GET', undefined);
            if (!upstreamRes) continue;

            const upstreamContentType = String(upstreamRes.headers['content-type'] || '').toLowerCase();
            if (upstreamRes.statusCode !== 200 || (!isHtmlExt && upstreamContentType.includes('text/html'))) {
                upstreamRes.resume();
                continue;
            }

            const saved = await saveStreamToFile(upstreamRes, targetPath);
            if (saved && fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
                return targetPath;
            }
        }

        return null;
    })().finally(() => {
        inFlightTicketDownloads.delete(safeFile);
    });

    inFlightTicketDownloads.set(safeFile, task);
    return task;
};

const serveTicketUploadFallback: express.RequestHandler = async (req, res, next) => {
    try {
        const rawFile = req.params.filename || '';
        const safeFile = path.basename(rawFile);
        if (!safeFile || safeFile === '.' || safeFile === '..') return next();

        const candidateDirs = [
            path.join(uploadsDirPath, 'Tickets'),
            path.join(uploadsDirPath, 'tickets'),
            path.join(externalTicketingUploadsPath, 'Tickets'),
            path.join(externalTicketingUploadsPath, 'tickets'),
        ];

        const ext = path.extname(safeFile).toLowerCase();

        for (const dir of candidateDirs) {
            const exactPath = path.join(dir, safeFile);
            if (fs.existsSync(exactPath) && fs.statSync(exactPath).isFile()) {
                return sendTicketMediaFile(res, exactPath, ext);
            }
        }

        const reqMethod: 'GET' | 'HEAD' = req.method === 'HEAD' ? 'HEAD' : 'GET';
        const rangeHeader = typeof req.headers.range === 'string' && req.headers.range.trim() !== ''
            ? req.headers.range
            : undefined;

        if (reqMethod === 'GET' && !rangeHeader) {
            const savedPath = await downloadAndSaveTicketFile(safeFile, ext);
            if (savedPath) {
                if (req.destroyed || res.writableEnded) return;
                return sendTicketMediaFile(res, savedPath, ext);
            }
            return next();
        }

        const isHtmlExt = ext === '.html' || ext === '.htm';
        for (const baseUrl of getRemoteTicketingUploadBases()) {
            if (req.destroyed || res.writableEnded) return;

            const remoteUrl = `${baseUrl}/uploads/Tickets/${encodeURIComponent(safeFile)}`;
            const upstreamRes = await requestRemoteTicketMedia(remoteUrl, reqMethod, rangeHeader);
            if (!upstreamRes) continue;

            const upstreamContentType = String(upstreamRes.headers['content-type'] || '').toLowerCase();
            if (!isHtmlExt && upstreamContentType.includes('text/html')) {
                upstreamRes.resume();
                continue;
            }

            if (req.destroyed || res.writableEnded) {
                upstreamRes.resume();
                return;
            }

            if (reqMethod === 'GET') {
                downloadAndSaveTicketFile(safeFile, ext).catch(() => {});
            }

            const resolvedMime =
                MIME_BY_EXT[ext] && (!upstreamContentType || upstreamContentType.startsWith('application/octet-stream'))
                    ? MIME_BY_EXT[ext]
                    : (upstreamRes.headers['content-type'] || MIME_BY_EXT[ext]);

            res.status(upstreamRes.statusCode || 200);
            if (resolvedMime) {
                res.setHeader('Content-Type', resolvedMime);
            }
            res.setHeader('Accept-Ranges', upstreamRes.headers['accept-ranges'] || 'bytes');
            res.setHeader('Content-Disposition', 'inline');
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

            for (const headerName of ['content-length', 'content-range', 'last-modified', 'etag', 'cache-control'] as const) {
                const val = upstreamRes.headers[headerName];
                if (val !== undefined) {
                    res.setHeader(headerName, val);
                }
            }

            if (reqMethod === 'HEAD') {
                upstreamRes.resume();
                return res.end();
            }

            const onClientClose = () => {
                if (!res.writableEnded) {
                    upstreamRes.destroy();
                }
            };
            req.once('close', onClientClose);
            res.once('finish', () => req.removeListener('close', onClientClose));
            upstreamRes.on('error', () => {
                if (!res.headersSent) {
                    return next();
                }
                res.end();
            });

            return upstreamRes.pipe(res);
        }

        return next();
    } catch {
        if (!res.headersSent) {
            return next();
        }
    }
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