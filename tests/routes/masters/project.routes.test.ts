import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import projectRoutes from '../../../src/routes/masters/project.routes';

describe('Master Project Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/project', projectRoutes);

  it('exposes registered project route endpoints', () => {
    expect(projectRoutes).toBeDefined();
    expect(projectRoutes.stack.length).toBeGreaterThan(5);
  });

  it('requires authentication for GET /api/masters/project', async () => {
    const res = await request(app).get('/api/masters/project');
    expect(res.status).toBe(401);
  });

  it('requires authentication for GET /api/masters/project/active', async () => {
    const res = await request(app).get('/api/masters/project/active');
    expect(res.status).toBe(401);
  });
});
