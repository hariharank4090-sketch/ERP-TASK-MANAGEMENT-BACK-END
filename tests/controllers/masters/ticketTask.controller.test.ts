import { describe, it, expect, vi } from 'vitest';
import {
  getAllTicketTasks,
  getTicketTaskById,
  createTicketTask,
  updateTicketTask,
  deleteTicketTask,
} from '../../../src/controllers/masters/taskManagement/ticketTask.controller';
import { getDefaultConnection } from '../../../src/config/database.config';
import type { Request } from 'express';

const mockResponse = () => {
  const res: any = {
    locals: {},
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Ticket Task Controller', () => {
  it('exposes ticket task CRUD handlers', () => {
    expect(typeof getAllTicketTasks).toBe('function');
    expect(typeof getTicketTaskById).toBe('function');
    expect(typeof createTicketTask).toBe('function');
    expect(typeof updateTicketTask).toBe('function');
    expect(typeof deleteTicketTask).toBe('function');
  });

  it('handles invalid ID in getTicketTaskById', async () => {
    const req = {
      params: { id: '-1' },
      companyDB: getDefaultConnection(),
      user: { UserTypeId: 0 },
    } as unknown as Request;
    const res = mockResponse();

    await getTicketTaskById(req, res);

    expect([400, 403, 500]).toContain(res.status.mock.calls[0][0]);
  });
});
