import { describe, it, expect } from 'vitest';
import {
  tokenSessions,
  storeTokenSession,
  verifyTokenSession,
  removeTokenSession,
  getConnectionStats,
  getAllCompanyIds,
  isCompanyConfigured,
  getCompanyConfig,
} from '../../src/config/database.config';

describe('Database Config & Session Management', () => {
  const testToken = 'test-token-' + Date.now();

  it('stores, verifies, and removes token sessions', () => {
    storeTokenSession(testToken, 99, 99, 1, 'TestDB', 'Test Corp');

    const session = verifyTokenSession(testToken);
    expect(session).toBeDefined();
    expect(session?.userId).toBe(99);
    expect(session?.companyName).toBe('Test Corp');

    removeTokenSession(testToken);
    expect(verifyTokenSession(testToken)).toBeNull();
  });

  it('returns connection stats object', () => {
    const stats = getConnectionStats();
    expect(stats).toHaveProperty('activeSessions');
    expect(stats).toHaveProperty('activeCompanyConnections');
    expect(stats).toHaveProperty('loadedCompanies');
    expect(stats).toHaveProperty('sqlConnections');
    expect(stats).toHaveProperty('companies');
  });

  it('checks company configuration helpers', () => {
    const companyIds = getAllCompanyIds();
    expect(Array.isArray(companyIds)).toBe(true);

    if (companyIds.length > 0) {
      const id = companyIds[0];
      expect(isCompanyConfigured(id)).toBe(true);
      const config = getCompanyConfig(id);
      expect(config).toBeDefined();
      expect(config?.id).toBe(id);
    }
  });
});
