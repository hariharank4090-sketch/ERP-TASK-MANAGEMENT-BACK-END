import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import userTypeRoutes from '../../../src/routes/masters/userType.routes';

describe('Master UserType Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/userType', userTypeRoutes);

  it('exposes registered userType route endpoints', () => {
    expect(userTypeRoutes).toBeDefined();
    expect(userTypeRoutes.stack.length).toBeGreaterThan(0);
  });

  it('requires authentication for GET /api/masters/userType', async () => {
    const res = await request(app).get('/api/masters/userType');
    expect(res.status).toBe(401);
  });
});
