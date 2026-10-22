import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  verifyLegacyPassword,
  verifyPasswordCombined,
} from '../../../src/controllers/utils/password.utils';

describe('Password Utilities', () => {
  it('hashes and verifies bcrypt password', async () => {
    const plain = 'secretPass123';
    const hash = await hashPassword(plain);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(plain);

    const match = await verifyPassword(plain, hash);
    expect(match).toBe(true);

    const mismatch = await verifyPassword('wrongPass', hash);
    expect(mismatch).toBe(false);
  });

  it('verifies plain text and combined passwords', async () => {
    expect(await verifyLegacyPassword('plain123', 'plain123')).toBe(true);
    expect(await verifyLegacyPassword('plain123', 'different')).toBe(false);

    expect(await verifyPasswordCombined('test', 'test')).toBe(true);
    expect(await verifyPasswordCombined('', '')).toBe(false);
  });
});
