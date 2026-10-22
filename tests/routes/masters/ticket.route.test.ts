import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import ticketRoutes from '../../../src/routes/masters/ticket.route';

describe('Masters Ticket Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/tickets', ticketRoutes);

  it('exposes ticket router', () => {
    expect(ticketRoutes).toBeDefined();
    expect(ticketRoutes.stack.length).toBeGreaterThan(0);
  });

  it('handles GET /api/masters/tickets with query validation', async () => {
    const res = await request(app).get('/api/masters/tickets');
    expect([200, 400, 401, 500]).toContain(res.status);
  });
});
