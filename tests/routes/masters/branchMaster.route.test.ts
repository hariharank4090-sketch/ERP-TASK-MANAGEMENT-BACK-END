import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import branchRoutes from '../../../src/routes/masters/branchMaster.route';

describe('Masters Branch Master Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/branch', branchRoutes);

  it('exposes branch master endpoints', () => {
    expect(branchRoutes).toBeDefined();
    expect(branchRoutes.stack.length).toBeGreaterThan(0);
  });

  it('requires authentication for GET /api/masters/branch', async () => {
    const res = await request(app).get('/api/masters/branch');
    expect(res.status).toBe(401);
  });
});
