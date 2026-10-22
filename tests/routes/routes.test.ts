import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import routes from '../../src/routes/routes';

describe('Root Dynamic Routes (routes.ts)', () => {
  const app = express();
  app.use(express.json());
  app.use('/api', routes);

  it('exposes routes router', () => {
    expect(routes).toBeDefined();
    expect(routes.stack.length).toBeGreaterThan(0);
  });

  it('rejects unauthenticated GET /api/users with 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });
});
