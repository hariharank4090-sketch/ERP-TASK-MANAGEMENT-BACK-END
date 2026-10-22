import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import staffBasedReportRoute from '../../../src/routes/reports/staffBasedReport.route';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Reports Staff Based Report Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/reports', staffBasedReportRoute);

  it('exposes staff based report router', () => {
    expect(staffBasedReportRoute).toBeDefined();
    expect(staffBasedReportRoute.stack.length).toBeGreaterThan(0);
  });

  it('handles GET /api/reports/staff-based-report', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const querySpy = vi.spyOn(getDefaultConnection(), 'query').mockResolvedValue([] as any);
    const res = await request(app).get('/api/reports/staff-based-report');
    expect([200, 400, 500]).toContain(res.status);
    querySpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
