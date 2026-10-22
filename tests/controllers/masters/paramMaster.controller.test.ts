import { describe, it, expect, vi } from 'vitest';
import {
  getAllParamMasters,
  getParamMasterById,
  createParamMaster,
  updateParamMaster,
  deleteParamMaster,
} from '../../../src/controllers/masters/taskManagement/paramMaster.controller';
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

describe('Param Master Controller', () => {
  it('exposes param master handlers', () => {
    expect(typeof getAllParamMasters).toBe('function');
    expect(typeof getParamMasterById).toBe('function');
    expect(typeof createParamMaster).toBe('function');
    expect(typeof updateParamMaster).toBe('function');
    expect(typeof deleteParamMaster).toBe('function');
  });

  it('handles invalid ID in getParamMasterById', async () => {
    const req = {
      params: { id: '-1' },
      companyDB: getDefaultConnection(),
      user: { UserTypeId: 0 },
    } as unknown as Request;
    const res = mockResponse();

    await getParamMasterById(req, res);

    expect([400, 403, 500]).toContain(res.status.mock.calls[0][0]);
  });
});
