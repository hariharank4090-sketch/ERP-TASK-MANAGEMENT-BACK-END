import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import userRoutes from '../../../src/routes/attendance/user.routes';

describe('Attendance User Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/attendance/users', userRoutes);

  it('exposes attendance user routes router', () => {
    expect(userRoutes).toBeDefined();
    expect(userRoutes.stack.length).toBeGreaterThan(0);
  });

  it('rejects unauthenticated request to /api/attendance/users', async () => {
    const res = await request(app).get('/api/attendance/users');
    expect(res.status).toBe(401);
  });
});
