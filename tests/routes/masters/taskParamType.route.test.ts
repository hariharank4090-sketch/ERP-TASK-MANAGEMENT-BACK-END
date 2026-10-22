import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import taskParamTypeRoutes from '../../../src/routes/masters/taskParamType.route';

describe('Masters Task Param Type Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/data-types', taskParamTypeRoutes);

  it('exposes task param type router', () => {
    expect(taskParamTypeRoutes).toBeDefined();
    expect(taskParamTypeRoutes.stack.length).toBeGreaterThan(0);
  });

  it('requires authentication for GET /api/masters/data-types', async () => {
    const res = await request(app).get('/api/masters/data-types');
    expect(res.status).toBe(401);
  });
});
