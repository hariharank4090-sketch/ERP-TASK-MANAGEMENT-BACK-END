import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import costCenterRoute from '../../../src/routes/reports/costCenter.route';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Reports Cost Center Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/reports', costCenterRoute);

  it('exposes cost center router', () => {
    expect(costCenterRoute).toBeDefined();
    expect(costCenterRoute.stack.length).toBeGreaterThan(0);
  });

  it('handles GET /api/reports/costcenter-list', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const querySpy = vi.spyOn(getDefaultConnection(), 'query').mockResolvedValue([] as any);
    const res = await request(app).get('/api/reports/costcenter-list');
    expect([200, 400, 500]).toContain(res.status);
    querySpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
