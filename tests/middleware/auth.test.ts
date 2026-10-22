import { describe, it, expect, vi } from 'vitest';
import {
  authenticate,
  authorize,
  getCurrentLocalUserId,
  getCurrentGlobalUserId,
  getUserContext,
  isSuperAdmin,
  hasRole,
  hasAnyRole,
} from '../../src/middleware/auth';
import { getDefaultConnection } from '../../src/config/database.config';
import type { Request, Response, NextFunction } from 'express';

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe('Auth Middleware', () => {
  it('authenticate returns 401 when Authorization header is missing', async () => {
    const req = { headers: {} } as Request;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'No token provided',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('authenticate returns 401 when token is invalid or not in session', async () => {
    const querySpy = vi.spyOn(getDefaultConnection(), 'query').mockResolvedValue([[]] as any);
    const req = { headers: { authorization: 'Bearer invalid-token' } } as Request;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    querySpy.mockRestore();
  });

  it('authorize allows access when user role is in allowed list', () => {
    const middleware = authorize([1, 2]);
    const req = { user: { UserTypeId: 1 } } as any;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('authorize denies access (403) when user role is not allowed', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const middleware = authorize([1]);
    const req = { user: { UserTypeId: 3 } } as any;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('checks role helper functions accurately', () => {
    const superAdminReq = { user: { UserTypeId: 0 } } as any;
    const managerReq = { user: { UserTypeId: 2 } } as any;

    expect(isSuperAdmin(superAdminReq)).toBe(true);
    expect(isSuperAdmin(managerReq)).toBe(false);
    expect(hasRole(managerReq, 2)).toBe(true);
    expect(hasAnyRole(managerReq, [2, 3])).toBe(true);
    expect(hasAnyRole(managerReq, [4, 5])).toBe(false);
  });

  it('extracts user context properly', () => {
    const req = {
      userId: 50,
      localUserId: 50,
      currentCompanyId: 2,
      currentDBName: 'DB2',
      authenticateId: 'valid-token',
      user: { UserName: 'alice', UserTypeId: 2 },
    } as any;

    const ctx = getUserContext(req);
    expect(ctx.globalUserId).toBe(50);
    expect(ctx.localUserId).toBe(50);
    expect(ctx.companyId).toBe(2);
    expect(ctx.userTypeId).toBe(2);
    expect(ctx.userName).toBe('alice');
    expect(ctx.isAuthenticated).toBe(true);
    expect(ctx.hasUser).toBe(true);
  });
});
