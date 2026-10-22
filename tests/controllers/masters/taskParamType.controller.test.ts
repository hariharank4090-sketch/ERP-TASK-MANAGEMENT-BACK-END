import { describe, it, expect, vi } from 'vitest';
import {
  getAllParametDataTypes,
  getParametDataTypeById,
  createParametDataType,
  updateParametDataType,
  deleteParametDataType,
} from '../../../src/controllers/masters/taskManagement/taskParamType.controller';
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

describe('Task Param Type Controller', () => {
  it('exposes task param type handlers', () => {
    expect(typeof getAllParametDataTypes).toBe('function');
    expect(typeof getParametDataTypeById).toBe('function');
    expect(typeof createParametDataType).toBe('function');
    expect(typeof updateParametDataType).toBe('function');
    expect(typeof deleteParametDataType).toBe('function');
  });

  it('handles invalid ID in getParametDataTypeById', async () => {
    const req = {
      params: { id: '-1' },
      companyDB: getDefaultConnection(),
      user: { UserTypeId: 0 },
    } as unknown as Request;
    const res = mockResponse();

    await getParametDataTypeById(req, res);

    expect([400, 403, 500]).toContain(res.status.mock.calls[0][0]);
  });
});
