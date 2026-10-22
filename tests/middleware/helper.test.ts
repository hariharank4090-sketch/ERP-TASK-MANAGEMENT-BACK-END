import { describe, it, expect } from 'vitest';
import {
  ddmmyyyy,
  yyyymmdd,
  hhmm,
  isValidDate,
  isValidObject,
  isArray,
  toArray,
  isNumber,
  toNumber,
  Addition,
  Subraction,
  Multiplication,
  Division,
  trimText,
  stringCompare,
  parseJSON,
  isValidJSON,
  calcTotal,
  calcAvg,
  getUniqueData,
} from '../../src/middleware/helper';

describe('Middleware Helper Functions', () => {
  describe('Date Helpers', () => {
    it('formats date to ddmmyyyy', () => {
      const formatted = ddmmyyyy('2026-03-25');
      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/25.*03.*2026/);
    });

    it('formats date to yyyymmdd', () => {
      const formatted = yyyymmdd('2026-03-25');
      expect(formatted).toBe('2026-03-25');
    });

    it('validates dates correctly', () => {
      expect(isValidDate(new Date('2026-01-01'))).toBe(true);
      expect(isValidDate('not-a-date')).toBe(false);
    });
  });

  describe('Type and Object Checkers', () => {
    it('checks isArray and toArray', () => {
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray('string')).toBe(false);
      expect(toArray(5)).toEqual([]);
      expect(toArray([1, 2])).toEqual([1, 2]);
    });

    it('checks isNumber and toNumber', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber('123')).toBe(true);
      expect(isNumber('abc')).toBe(false);
      expect(toNumber('45.6')).toBe(45.6);
      expect(toNumber('invalid')).toBe(0);
    });

    it('checks isValidObject', () => {
      expect(isValidObject({ a: 1 })).toBe(true);
      expect(isValidObject(null)).toBe(false);
      expect(isValidObject('text')).toBe(false);
    });
  });

  describe('Math and Calculation Helpers', () => {
    it('performs basic math operations safely', () => {
      expect(Addition(10, 5)).toBe(15);
      expect(Subraction(10, 5)).toBe(5);
      expect(Multiplication(10, 5)).toBe(50);
      expect(Division(10, 2)).toBe(5);
      expect(Division(10, 0)).toBe(0);
    });

    it('calculates total and average of array properties', () => {
      const data = [{ amount: 10 }, { amount: 20 }, { amount: 30 }];
      expect(calcTotal(data, 'amount')).toBe(60);
      expect(calcAvg(data, 'amount')).toBe(20);
    });
  });

  describe('String and JSON Helpers', () => {
    it('trims text and compares strings case-insensitively', () => {
      expect(trimText('  hello  ')).toBe('hello');
      expect(stringCompare('AbC', 'abc')).toBe(true);
      expect(stringCompare('AbC', 'xyz')).toBe(false);
    });

    it('validates and parses JSON safely', () => {
      expect(isValidJSON('{"a":1}')).toBe(true);
      expect(isValidJSON('invalid-json')).toBe(false);
      expect(parseJSON('{"b":2}')).toEqual({ isJSON: true, data: { b: 2 } });
      expect(parseJSON('invalid')).toEqual({ isJSON: false });
    });

    it('filters unique data items', () => {
      const list = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 1, name: 'Duplicate' }];
      const unique = getUniqueData(list, 'id');
      expect(unique.length).toBe(2);
    });
  });
});
