import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import paramMasterRoutes from '../../../src/routes/masters/paramMaster.routes';

describe('Master ParamMaster Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/paramMaster', paramMasterRoutes);

  it('exposes registered paramMaster endpoints', () => {
    expect(paramMasterRoutes).toBeDefined();
    expect(paramMasterRoutes.stack.length).toBeGreaterThan(0);
  });

  it('requires authentication for GET /api/masters/paramMaster', async () => {
    const res = await request(app).get('/api/masters/paramMaster');
    expect(res.status).toBe(401);
  });
});
