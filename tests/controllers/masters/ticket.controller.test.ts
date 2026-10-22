import { describe, it, expect, vi } from 'vitest';
import {
  getTickets,
  updateTicketStatus,
} from '../../../src/controllers/masters/taskManagement/ticket.controller';
import type { Request } from 'express';

const mockResponse = () => {
  const res: any = {
    locals: {},
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Ticket Controller', () => {
  it('exposes ticket handlers', () => {
    expect(typeof getTickets).toBe('function');
    expect(typeof updateTicketStatus).toBe('function');
  });

  it('handles updateTicketStatus with invalid payload', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = { body: {} } as Request;
    const res = mockResponse();

    await updateTicketStatus(req, res);

    expect([400, 500]).toContain(res.status.mock.calls[0][0]);
    consoleSpy.mockRestore();
  });
});
