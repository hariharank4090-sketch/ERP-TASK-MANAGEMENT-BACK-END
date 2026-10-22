import { describe, it, expect } from 'vitest';
import { JWT_SECRET, SECRET, EXPIRES_IN } from '../../../src/controllers/configuration/login/jwtAuth';

describe('Login JWT Auth Config', () => {
  it('exports valid JWT constants', () => {
    expect(JWT_SECRET).toBeDefined();
    expect(SECRET).toBe(JWT_SECRET);
    expect(EXPIRES_IN).toBeDefined();
  });
});
