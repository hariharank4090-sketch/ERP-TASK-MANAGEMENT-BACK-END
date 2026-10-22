import { describe, it, expect, vi } from 'vitest';
import {
  getAllTaskParametDTs,
  getTaskParametDTById,
  createTaskParametDT,
  updateTaskParametDT,
  deleteTaskParametDT,
} from '../../../src/controllers/masters/taskManagement/TaskEmployeeParameters.controller';
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

describe('Task Employee Parameters Controller', () => {
  it('exposes task employee parameters handlers', () => {
    expect(typeof getAllTaskParametDTs).toBe('function');
    expect(typeof getTaskParametDTById).toBe('function');
    expect(typeof createTaskParametDT).toBe('function');
    expect(typeof updateTaskParametDT).toBe('function');
    expect(typeof deleteTaskParametDT).toBe('function');
  });

  it('handles invalid ID in getTaskParametDTById', async () => {
    const req = {
      params: { id: '-1' },
      companyDB: getDefaultConnection(),
      user: { UserTypeId: 0 },
    } as unknown as Request;
    const res = mockResponse();

    await getTaskParametDTById(req, res);

    expect([400, 403, 500]).toContain(res.status.mock.calls[0][0]);
  });
});
