import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../../src/controllers/configuration/login/hash';

describe('Login Hash Utility', () => {
  it('hashes and validates password correctly', async () => {
    const raw = 'adminPassword99';
    const hash = await hashPassword(raw);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(raw);

    const match = await verifyPassword(raw, hash);
    expect(match).toBe(true);

    const nonMatch = await verifyPassword('different', hash);
    expect(nonMatch).toBe(false);
  });
});
