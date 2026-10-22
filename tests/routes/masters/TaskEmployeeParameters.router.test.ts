import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import taskParamDTRoutes from '../../../src/routes/masters/TaskEmployeeParameters.router';

describe('Masters Task Employee Parameters Router', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/task-parameters', taskParamDTRoutes);

  it('exposes task employee parameters router', () => {
    expect(taskParamDTRoutes).toBeDefined();
    expect(taskParamDTRoutes.stack.length).toBeGreaterThan(0);
  });

  it('requires authentication for GET /api/masters/task-parameters', async () => {
    const res = await request(app).get('/api/masters/task-parameters');
    expect(res.status).toBe(401);
  });
});
