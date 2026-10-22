import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import leaveRoutes from '../../../src/routes/masters/leave.routes';

describe('Master Leave Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/leave', leaveRoutes);

  it('exposes registered leave endpoints', () => {
    expect(leaveRoutes).toBeDefined();
    expect(leaveRoutes.stack.length).toBeGreaterThan(0);
  });

  it('requires authentication for GET /api/masters/leave', async () => {
    const res = await request(app).get('/api/masters/leave');
    expect(res.status).toBe(401);
  });
});
