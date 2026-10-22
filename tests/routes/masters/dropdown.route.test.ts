import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import dropdownRoutes from '../../../src/routes/masters/dropdown.route';

describe('Masters Dropdown Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/dropdown', dropdownRoutes);

  it('exposes dropdown route router', () => {
    expect(dropdownRoutes).toBeDefined();
    expect(dropdownRoutes.stack.length).toBeGreaterThan(0);
  });

  it('requires authentication for GET /api/masters/dropdown/all', async () => {
    const res = await request(app).get('/api/masters/dropdown/all');
    expect(res.status).toBe(401);
  });
});
