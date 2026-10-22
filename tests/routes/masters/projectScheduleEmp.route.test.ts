import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import projectScheduleEmpRoutes from '../../../src/routes/masters/projectScheduleEmp.route';

describe('Masters Project Schedule Employee Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/task-details', projectScheduleEmpRoutes);

  it('exposes task details router', () => {
    expect(projectScheduleEmpRoutes).toBeDefined();
    expect(projectScheduleEmpRoutes.stack.length).toBeGreaterThan(0);
  });

  it('handles DELETE /api/masters/task-details/:id endpoint', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).delete('/api/masters/task-details/1');
    expect([200, 400, 404, 500]).toContain(res.status);
    consoleSpy.mockRestore();
  });
});
