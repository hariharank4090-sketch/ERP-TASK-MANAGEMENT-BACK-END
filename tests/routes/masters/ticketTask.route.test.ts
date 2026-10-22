import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import ticketTaskRoutes from '../../../src/routes/masters/ticketTask.route';

describe('Masters Ticket Task Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/masters/ticket-tasks', ticketTaskRoutes);

  it('exposes ticket task router', () => {
    expect(ticketTaskRoutes).toBeDefined();
    expect(ticketTaskRoutes.stack.length).toBeGreaterThan(0);
  });

  it('requires authentication for GET /api/masters/ticket-tasks', async () => {
    const res = await request(app).get('/api/masters/ticket-tasks');
    expect(res.status).toBe(401);
  });
});
