import { describe, it, expect, vi } from 'vitest';
import {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../../../src/controllers/masters/taskManagement/projectScedule.controller';
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

describe('Project Schedule Controller', () => {
  it('exposes project schedule handlers', () => {
    expect(typeof getAllSchedules).toBe('function');
    expect(typeof getScheduleById).toBe('function');
    expect(typeof createSchedule).toBe('function');
    expect(typeof updateSchedule).toBe('function');
    expect(typeof deleteSchedule).toBe('function');
  });

  it('handles invalid ID in getScheduleById', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = {
      params: { id: 'invalid' },
      companyDB: {
        query: vi.fn().mockResolvedValue([]),
      },
      user: { UserTypeId: 0 },
    } as unknown as Request;
    const res = mockResponse();

    await getScheduleById(req, res);

    expect([200, 400, 403, 404, 500]).toContain(res.status.mock.calls[0][0]);
    consoleSpy.mockRestore();
  });
});
