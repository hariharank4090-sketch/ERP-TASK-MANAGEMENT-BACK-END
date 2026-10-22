import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import taskRoutes from '../../../src/routes/masters/task.routes';

describe('Master Task Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/tasks', taskRoutes);

  it('exposes registered task route endpoints', () => {
    expect(taskRoutes).toBeDefined();
    expect(taskRoutes.stack.length).toBeGreaterThan(5);
  });

  it('requires authentication for GET /api/masters/tasks', async () => {
    const res = await request(app).get('/api/masters/tasks');
    expect(res.status).toBe(401);
  });
});
