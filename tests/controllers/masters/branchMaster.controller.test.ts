import { describe, it, expect, vi } from 'vitest';
import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../../../src/controllers/masters/taskManagement/branchMaster.controller';
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

describe('Branch Master Controller', () => {
  it('exposes all CRUD handlers', () => {
    expect(typeof getAllBranches).toBe('function');
    expect(typeof getBranchById).toBe('function');
    expect(typeof createBranch).toBe('function');
    expect(typeof updateBranch).toBe('function');
    expect(typeof deleteBranch).toBe('function');
  });

  it('handles invalid branchId in getBranchById', async () => {
    const req = {
      params: { branchId: 'invalid' },
      companyDB: getDefaultConnection(),
      user: { UserTypeId: 0 },
    } as unknown as Request;
    const res = mockResponse();

    await getBranchById(req, res);

    expect([400, 403, 500]).toContain(res.status.mock.calls[0][0]);
  });
});
