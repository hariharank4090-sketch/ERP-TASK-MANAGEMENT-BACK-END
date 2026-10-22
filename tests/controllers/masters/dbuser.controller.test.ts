import { describe, it, expect, vi } from 'vitest';
import {
  getAllUsers,
  getUserById,
  getUserDropdown,
  getDeletedUsers,
  testConnection,
} from '../../../src/controllers/masters/taskManagement/dbuser.controller';
import type { Request } from 'express';

const mockResponse = () => {
  const res: any = {
    locals: {},
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('DB User Controller', () => {
  it('exposes DB user handlers', () => {
    expect(typeof getAllUsers).toBe('function');
    expect(typeof getUserById).toBe('function');
    expect(typeof getUserDropdown).toBe('function');
    expect(typeof getDeletedUsers).toBe('function');
    expect(typeof testConnection).toBe('function');
  });

  it('handles invalid user id in getUserById', async () => {
    const req = { params: { id: 'abc' } } as unknown as Request;
    const res = mockResponse();

    await getUserById(req, res);

    expect([400, 500]).toContain(res.status.mock.calls[0][0]);
  });
});
