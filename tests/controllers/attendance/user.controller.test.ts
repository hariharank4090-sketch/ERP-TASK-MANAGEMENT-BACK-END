import { describe, it, expect, vi } from 'vitest';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../../../src/controllers/Attendace/user.controller';
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

describe('Attendance User Controller', () => {
  it('handles createUser with invalid schema input', async () => {
    const req = {
      body: {},
      companyDB: getDefaultConnection(),
    } as unknown as Request;
    const res = mockResponse();

    await createUser(req, res);

    expect([400, 500]).toContain(res.status.mock.calls[0][0]);
  });

  it('exposes user CRUD handlers', () => {
    expect(typeof getAllUsers).toBe('function');
    expect(typeof getUserById).toBe('function');
    expect(typeof updateUser).toBe('function');
    expect(typeof deleteUser).toBe('function');
  });
});
