import { describe, it, expect } from 'vitest';
import {
  checkIsNumber,
  isValidNumber,
  isEqualNumber,
  stringCompare,
  extractToken,
  getUserType,
} from '../../src/middleware/miniAPIs';

describe('miniAPIs Middleware & Helpers', () => {
  it('validates checkIsNumber correctly', () => {
    expect(checkIsNumber(123)).toBe(true);
    expect(checkIsNumber('456')).toBe(true);
    expect(checkIsNumber(null)).toBe(false);
    expect(checkIsNumber(undefined)).toBe(false);
    expect(checkIsNumber('abc')).toBe(false);
  });

  it('validates isValidNumber correctly', () => {
    expect(isValidNumber(10)).toBe(true);
    expect(isValidNumber('10')).toBe(true);
    expect(isValidNumber(0)).toBe(false);
    expect(isValidNumber(-5)).toBe(false);
    expect(isValidNumber('abc')).toBe(false);
  });

  it('checks isEqualNumber and stringCompare', () => {
    expect(isEqualNumber(5, 5)).toBe(true);
    expect(isEqualNumber(5, 6)).toBe(false);

    expect(stringCompare('Hello', 'hello')).toBe(true);
    expect(stringCompare('Hello', 'world')).toBe(false);
  });

  it('extracts token from authorization header properly', () => {
    expect(extractToken('Bearer my-secret-jwt-token')).toBe('my-secret-jwt-token');
    expect(extractToken('my-raw-token')).toBe('my-raw-token');
    expect(extractToken(undefined)).toBeNull();
  });

  it('returns false for non-numeric user in getUserType', async () => {
    const res = await getUserType('invalid-id' as any);
    expect(res).toBe(false);
  });
});
