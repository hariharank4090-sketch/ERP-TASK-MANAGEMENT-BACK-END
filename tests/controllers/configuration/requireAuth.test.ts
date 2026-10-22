import { describe, it, expect, vi } from 'vitest';
import { requireAuth } from '../../../src/controllers/configuration/login/requireAuth';
import type { Request, Response } from 'express';

describe('requireAuth Controller Middleware', () => {
  it('returns 401 when token is missing', async () => {
    const req = {
      header: vi.fn().mockReturnValue(undefined),
      query: {},
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Missing token' });
    expect(next).not.toHaveBeenCalled();
  });
});
