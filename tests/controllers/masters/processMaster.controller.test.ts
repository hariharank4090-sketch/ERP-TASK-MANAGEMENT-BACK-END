import { describe, it, expect, vi } from 'vitest';
import {
  getAllProcessMaster,
  getProcessMasterById,
  createProcessMaster,
  updateProcessMaster,
  deleteProcessMaster,
} from '../../../src/controllers/masters/taskManagement/processMaster.controller';
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

describe('Process Master Controller', () => {
  it('exposes process master handlers', () => {
    expect(typeof getAllProcessMaster).toBe('function');
    expect(typeof getProcessMasterById).toBe('function');
    expect(typeof createProcessMaster).toBe('function');
    expect(typeof updateProcessMaster).toBe('function');
    expect(typeof deleteProcessMaster).toBe('function');
  });

  it('handles invalid ID in getProcessMasterById', async () => {
    const req = {
      params: { id: '-1' },
      companyDB: getDefaultConnection(),
      user: { UserTypeId: 0 },
    } as unknown as Request;
    const res = mockResponse();

    await getProcessMasterById(req, res);

    expect([400, 403, 500]).toContain(res.status.mock.calls[0][0]);
  });
});
