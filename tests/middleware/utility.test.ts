import { describe, it, expect } from 'vitest';
import { checkIsNumber, isEqualNumber, miniResponse } from '../../src/middleware/utility';

describe('Utility Middleware Helpers', () => {
  it('checkIsNumber returns true for valid numbers and numeric strings', () => {
    expect(checkIsNumber(123)).toBe(true);
    expect(checkIsNumber('456')).toBe(true);
    expect(checkIsNumber('abc')).toBe(false);
    expect(checkIsNumber(null)).toBe(false);
  });

  it('isEqualNumber compares numbers properly', () => {
    expect(isEqualNumber(10, 10)).toBe(true);
    expect(isEqualNumber('20', 20)).toBe(true);
    expect(isEqualNumber(10, 20)).toBe(false);
  });

  it('formats miniResponse correctly', () => {
    const response = miniResponse({
      status: true,
      dataArray: [{ id: 1 }],
      dataObject: { role: 'admin' },
      others: { count: 1 },
    });

    expect(response.status).toBe(true);
    expect(response.dataArray).toEqual([{ id: 1 }]);
    expect(response.dataObject).toEqual({ role: 'admin' });
    expect((response as any).count).toBe(1);
  });
});
