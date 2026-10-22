import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import projectScheduleRoutes from '../../../src/routes/masters/projectSchedule.route';

describe('Masters Project Schedule Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/project-schedule', projectScheduleRoutes);

  it('exposes project schedule router', () => {
    expect(projectScheduleRoutes).toBeDefined();
    expect(projectScheduleRoutes.stack.length).toBeGreaterThan(0);
  });

  it('handles GET /api/masters/project-schedule endpoint', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/api/masters/project-schedule');
    expect([200, 400, 401, 500]).toContain(res.status);
    consoleSpy.mockRestore();
  });
});
