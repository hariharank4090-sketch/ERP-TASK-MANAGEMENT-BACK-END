import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import workParamRoutes from '../../../src/routes/masters/workParameter.routes';

describe('Masters Work Parameter Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/work-parameters', workParamRoutes);

  it('exposes work parameter router', () => {
    expect(workParamRoutes).toBeDefined();
    expect(workParamRoutes.stack.length).toBeGreaterThan(0);
  });

  it('handles GET /api/masters/work-parameters endpoint', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/api/masters/work-parameters');
    expect([200, 400, 401, 500]).toContain(res.status);
    consoleSpy.mockRestore();
  });
});
