import { describe, it, expect, vi } from 'vitest';
import {
  setCompanyDatabase,
  requireCompanyDB,
  requireAuthMiddleware,
  getDbConnection,
  hasCompanyContext,
  getCurrentCompanyInfo,
  getCurrentLocalUserId,
  getCurrentUserId,
  getUserContext,
} from '../../src/middleware/companyDb.middleware';
import type { Request, Response, NextFunction } from 'express';

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe('Company DB Middleware', () => {
  describe('setCompanyDatabase', () => {
    it('sets default DB connection when authorization header is absent', async () => {
      const req = { headers: {} } as Request;
      const res = mockResponse();
      const next = vi.fn();

      await setCompanyDatabase(req, res, next);

      expect(req.currentDBName).toBe('default');
      expect(req.currentCompanyId).toBe(0);
      expect(req.companyDB).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireCompanyDB', () => {
    it('blocks request (400) when no company DB context is selected', () => {
      const req = { currentDBName: 'default' } as Request;
      const res = mockResponse();
      const next = vi.fn();

      requireCompanyDB(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('allows request when valid company DB is present', () => {
      const req = {
        companyDB: {} as any,
        currentDBName: 'ERP_DB_SMT_TEST',
      } as Request;
      const res = mockResponse();
      const next = vi.fn();

      requireCompanyDB(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireAuthMiddleware', () => {
    it('blocks request (401) when user is not authenticated', () => {
      const req = {} as Request;
      const res = mockResponse();
      const next = vi.fn();

      requireAuthMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('passes when userId and authenticateId exist', () => {
      const req = { userId: 1, authenticateId: 'valid-token' } as Request;
      const res = mockResponse();
      const next = vi.fn();

      requireAuthMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Helper Functions', () => {
    it('checks hasCompanyContext and getCurrentCompanyInfo', () => {
      const reqWithCompany = {
        currentCompanyId: 5,
        currentDBName: 'Company_5_DB',
      } as Request;

      expect(hasCompanyContext(reqWithCompany)).toBe(true);
      expect(getCurrentCompanyInfo(reqWithCompany)).toEqual({
        companyId: 5,
        dbName: 'Company_5_DB',
        isCompanySelected: true,
      });

      const reqDefault = { currentDBName: 'default' } as Request;
      expect(hasCompanyContext(reqDefault)).toBe(false);
    });

    it('gets current IDs and user context', () => {
      const req = {
        userId: 101,
        localUserId: 202,
        currentCompanyId: 3,
        currentDBName: 'Company_3_DB',
        authenticateId: 'auth-token',
      } as Request;

      expect(getCurrentUserId(req)).toBe(101);
      expect(getCurrentLocalUserId(req)).toBe(202);
      expect(getUserContext(req)).toEqual({
        globalUserId: 101,
        localUserId: 202,
        companyId: 3,
        dbName: 'Company_3_DB',
        isAuthenticated: true,
        hasCompanyContext: true,
      });
    });
  });
});
