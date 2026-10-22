import { describe, it, expect, vi } from 'vitest';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../../../src/controllers/masters/taskManagement/task.controller';
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

describe('Task Controller', () => {
  it('exposes task CRUD handlers', () => {
    expect(typeof getAllTasks).toBe('function');
    expect(typeof getTaskById).toBe('function');
    expect(typeof createTask).toBe('function');
    expect(typeof updateTask).toBe('function');
    expect(typeof deleteTask).toBe('function');
  });

  it('handles invalid ID in getTaskById', async () => {
    const req = {
      params: { id: '-1' },
      companyDB: getDefaultConnection(),
      user: { UserTypeId: 0 },
    } as unknown as Request;
    const res = mockResponse();

    await getTaskById(req, res);

    expect([400, 403, 500]).toContain(res.status.mock.calls[0][0]);
  });
});
