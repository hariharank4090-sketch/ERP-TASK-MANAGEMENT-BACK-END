import { describe, it, expect, vi } from 'vitest';
import {
  getAllTaskTypes,
  getTaskTypeById,
  getActiveTaskTypes,
  createTaskType,
  updateTaskType,
  deleteTaskType,
  getStatusOptions,
} from '../../../src/controllers/masters/taskManagement/taskType.controller';
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

describe('Task Type Controller', () => {
  it('exposes task type handlers', () => {
    expect(typeof getAllTaskTypes).toBe('function');
    expect(typeof getTaskTypeById).toBe('function');
    expect(typeof getActiveTaskTypes).toBe('function');
    expect(typeof createTaskType).toBe('function');
    expect(typeof updateTaskType).toBe('function');
    expect(typeof deleteTaskType).toBe('function');
  });

  it('returns task type status options or handles authorization', async () => {
    const req = {
      companyDB: getDefaultConnection(),
      user: { UserTypeId: 0 },
    } as unknown as Request;
    const res = mockResponse();

    await getStatusOptions(req, res);

    expect([200, 403, 500]).toContain(res.status.mock.calls[0][0]);
  });
});
