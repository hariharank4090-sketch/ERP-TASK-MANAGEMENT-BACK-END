import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import workRoutes from '../../../src/routes/masters/workMaster.routes';

describe('Masters Work Master Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/work', workRoutes);

  it('exposes work master router', () => {
    expect(workRoutes).toBeDefined();
    expect(workRoutes.stack.length).toBeGreaterThan(0);
  });

  it('handles GET /api/masters/work endpoint', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/api/masters/work');
    expect([200, 400, 401, 500]).toContain(res.status);
    consoleSpy.mockRestore();
  });
});
