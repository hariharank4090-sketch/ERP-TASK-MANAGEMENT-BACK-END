import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import employeeRoutes from '../../../src/routes/masters/employeemaster.route';

describe('Masters Employee Master Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/employee', employeeRoutes);

  it('exposes employee master router', () => {
    expect(employeeRoutes).toBeDefined();
    expect(employeeRoutes.stack.length).toBeGreaterThan(0);
  });

  it('requires authentication for GET /api/masters/employee', async () => {
    const res = await request(app).get('/api/masters/employee');
    expect(res.status).toBe(401);
  });
});
