import { describe, it, expect, vi } from 'vitest';
import { getUsers } from '../../src/controllers/user.controller';
import type { Request, Response } from 'express';

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe('User Controller', () => {
  it('returns 500 when company database connection is missing', async () => {
    const req = {} as Request;
    const res = mockResponse();

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'DB missing' });
  });

  it('handles database error gracefully when query fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = {
      companyDB: {
        define: vi.fn(),
      } as any,
    } as unknown as Request;
    const res = mockResponse();

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    consoleSpy.mockRestore();
  });
});
