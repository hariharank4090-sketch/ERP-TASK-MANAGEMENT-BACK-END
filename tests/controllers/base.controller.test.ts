import { describe, it, expect } from 'vitest';
import {
  getDbConnection,
  getCurrentDatabaseName,
  getUserId,
  getAuthenticateId,
  getCompanyId,
  isAuthenticated,
  hasCompanyDB,
} from '../../src/controllers/base.controller';
import type { Request } from 'express';
import { Sequelize } from 'sequelize';

describe('Base Controller Utilities', () => {
  it('returns companyDB when active and not default', () => {
    const mockSequelize = {} as Sequelize;
    const req = {
      companyDB: mockSequelize,
      currentDBName: 'Company_DB_1',
    } as Request;

    expect(getDbConnection(req)).toBe(mockSequelize);
  });

  it('returns current database name or default fallback', () => {
    const reqWithDb = { currentDBName: 'CustomDB' } as Request;
    const reqWithoutDb = {} as Request;

    expect(getCurrentDatabaseName(reqWithDb)).toBe('CustomDB');
    expect(getCurrentDatabaseName(reqWithoutDb)).toBe('default');
  });

  it('extracts userId, authenticateId, and companyId accurately', () => {
    const req = {
      userId: 101,
      authenticateId: 'auth-token-123',
      currentCompanyId: 5,
    } as Request;

    expect(getUserId(req)).toBe(101);
    expect(getAuthenticateId(req)).toBe('auth-token-123');
    expect(getCompanyId(req)).toBe(5);
  });

  it('checks isAuthenticated correctly based on userId and authenticateId', () => {
    const authenticatedReq = { userId: 10, authenticateId: 'token' } as Request;
    const anonymousReq = { userId: undefined } as Request;

    expect(isAuthenticated(authenticatedReq)).toBe(true);
    expect(isAuthenticated(anonymousReq)).toBe(false);
  });

  it('checks hasCompanyDB correctly', () => {
    const withCompany = {
      companyDB: {} as Sequelize,
      currentDBName: 'Company_DB_1',
    } as Request;
    const withoutCompany = { currentDBName: 'default' } as Request;

    expect(hasCompanyDB(withCompany)).toBe(true);
    expect(hasCompanyDB(withoutCompany)).toBe(false);
  });
});
