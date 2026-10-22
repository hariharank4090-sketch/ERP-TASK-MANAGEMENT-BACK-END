import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import taskTypeRoutes from '../../../src/routes/masters/taskType.routes';

describe('Master TaskType Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/taskType', taskTypeRoutes);

  it('exposes registered taskType route endpoints', () => {
    expect(taskTypeRoutes).toBeDefined();
    expect(taskTypeRoutes.stack.length).toBeGreaterThan(0);
  });

  it('requires authentication for GET /api/masters/taskType', async () => {
    const res = await request(app).get('/api/masters/taskType');
    expect(res.status).toBe(401);
  });
});
