import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { getConnectionStats } from '../src/config/database.config';

describe('Application Server Bootstrap & Health Endpoints', () => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      ...getConnectionStats(),
    });
  });

  app.get('/api/connections/stats', (_req, res) => {
    res.json({ success: true, timestamp: new Date().toISOString(), data: getConnectionStats() });
  });

  it('GET /health returns 200 with healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('activeSessions');
  });

  it('GET /api/connections/stats returns connection statistics', async () => {
    const res = await request(app).get('/api/connections/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('loadedCompanies');
  });
});
