import { describe, it, expect, vi } from 'vitest';
import {
  getAllTaskDetails,
  getTaskDetailById,
  updateTaskDetail,
  deleteTaskDetail,
} from '../../../src/controllers/masters/taskManagement/projectScheduleEmp.controller';
import type { Request } from 'express';

const mockResponse = () => {
  const res: any = {
    locals: {},
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Project Schedule Employee (Task Details) Controller', () => {
  it('exposes task details handlers', () => {
    expect(typeof getAllTaskDetails).toBe('function');
    expect(typeof getTaskDetailById).toBe('function');
    expect(typeof updateTaskDetail).toBe('function');
    expect(typeof deleteTaskDetail).toBe('function');
  });

  it('handles invalid ID in getTaskDetailById', async () => {
    const req = { params: { id: 'invalid' } } as unknown as Request;
    const res = mockResponse();

    await getTaskDetailById(req, res);

    expect([400, 500]).toContain(res.status.mock.calls[0][0]);
  });
});
