import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import loginRoutes from '../../../src/routes/configuration/login.route';

describe('Configuration Login Route', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/configuration/login', loginRoutes);

  it('exposes express router with registered route layers', () => {
    expect(loginRoutes).toBeDefined();
    expect(loginRoutes.stack.length).toBeGreaterThan(0);
  });

  it('rejects unauthenticated verify request with 401', async () => {
    const res = await request(app).get('/api/configuration/login/verify');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No token provided');
  });

  it('rejects unauthenticated logout request with 401', async () => {
    const res = await request(app).post('/api/configuration/login/logout');
    expect(res.status).toBe(401);
  });

  it('rejects unauthenticated switch-company request with 401', async () => {
    const res = await request(app).post('/api/configuration/login/switch-company');
    expect(res.status).toBe(401);
  });
});
