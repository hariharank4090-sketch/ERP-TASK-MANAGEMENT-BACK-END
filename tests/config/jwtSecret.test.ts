import { describe, it, expect } from 'vitest';
import JWT_SECRET from '../../src/config/jwtSecret';

describe('JWT Secret Config', () => {
  it('exports a valid non-empty JWT secret string', () => {
    expect(JWT_SECRET).toBeDefined();
    expect(typeof JWT_SECRET).toBe('string');
    expect(JWT_SECRET.length).toBeGreaterThan(0);
  });
});
