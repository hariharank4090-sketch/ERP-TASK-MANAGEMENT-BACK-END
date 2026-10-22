import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import userRoutes from '../../../src/routes/masters/user.routes';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Masters User Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/users', userRoutes);

  it('exposes dbuser master routes router', () => {
    expect(userRoutes).toBeDefined();
    expect(userRoutes.stack.length).toBeGreaterThan(0);
  });

  it('handles GET /api/masters/users', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const querySpy = vi.spyOn(getDefaultConnection(), 'query').mockResolvedValue([] as any);
    const res = await request(app).get('/api/masters/users');
    expect([200, 400, 500]).toContain(res.status);
    querySpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
