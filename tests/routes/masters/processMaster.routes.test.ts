import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import processMasterRoutes from '../../../src/routes/masters/processMaster.routes';

describe('Master ProcessMaster Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/processMaster', processMasterRoutes);

  it('exposes registered processMaster endpoints', () => {
    expect(processMasterRoutes).toBeDefined();
    expect(processMasterRoutes.stack.length).toBeGreaterThan(0);
  });

  it('requires authentication for GET /api/masters/processMaster', async () => {
    const res = await request(app).get('/api/masters/processMaster');
    expect(res.status).toBe(401);
  });
});
