import { describe, it, expect, vi } from 'vitest';
import {
  getAllUserTypes,
  getUserTypeById,
  createUserType,
  updateUserType,
  deleteUserType,
  getMyRole,
} from '../../../src/controllers/masters/taskManagement/userType.controller';
import type { Request } from 'express';

const mockResponse = () => {
  const res: any = {
    locals: {},
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('User Type Controller', () => {
  it('exposes user type CRUD handlers and getMyRole', () => {
    expect(typeof getAllUserTypes).toBe('function');
    expect(typeof getUserTypeById).toBe('function');
    expect(typeof createUserType).toBe('function');
    expect(typeof updateUserType).toBe('function');
    expect(typeof deleteUserType).toBe('function');
    expect(typeof getMyRole).toBe('function');
  });

  it('handles invalid ID in getUserTypeById', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = { params: { id: 'invalid' } } as unknown as Request;
    const res = mockResponse();

    await getUserTypeById(req, res);

    expect([400, 500]).toContain(res.status.mock.calls[0][0]);
    consoleSpy.mockRestore();
  });
});
