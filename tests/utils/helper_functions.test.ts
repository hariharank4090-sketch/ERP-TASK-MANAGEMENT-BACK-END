import { describe, it, expect } from 'vitest';
import {
  toArray,
  isArray,
  isValidDate,
  isEqualNumber,
  isGraterNumber,
  isGraterOrEqual,
  isLesserNumber,
  isLesserOrEqual,
  toNumber,
  Addition,
  Subraction,
  Multiplication,
  Division,
  checkIsNumber,
  isValidNumber,
  isPositiveNumber,
  isNegativeNumber,
  isValidJSON,
  parseJSON,
  trimText,
  createAbbreviation,
  randomString,
} from '../../src/helper_functions';

describe('Helper Functions Utility', () => {
  it('handles toArray and isArray properly', () => {
    expect(toArray([1, 2, 3])).toEqual([1, 2, 3]);
    expect(toArray('not an array' as any)).toEqual([]);
    expect(isArray([1])).toBe(true);
    expect(isArray('hello')).toBe(false);
  });

  it('validates date correctly', () => {
    expect(isValidDate('2026-01-01')).toBe(true);
    expect(isValidDate('invalid-date')).toBe(false);
  });

  it('performs number comparisons correctly', () => {
    expect(isEqualNumber(10, 10)).toBe(true);
    expect(isEqualNumber('10', 10)).toBe(true);
    expect(isGraterNumber(20, 10)).toBe(true);
    expect(isGraterNumber(10, 20)).toBe(false);
    expect(isGraterOrEqual(10, 10)).toBe(true);
    expect(isLesserNumber(5, 10)).toBe(true);
    expect(isLesserOrEqual(5, 5)).toBe(true);
  });

  it('performs basic math operations safely', () => {
    expect(Addition(10, 5)).toBe(15);
    expect(Subraction(10, 5)).toBe(5);
    expect(Multiplication(4, 5)).toBe(20);
    expect(Division(20, 4)).toBe(5);
    expect(Division(20, 0)).toBe(0); // Safe division by zero
  });

  it('converts value to number safely', () => {
    expect(toNumber('42')).toBe(42);
    expect(toNumber(100)).toBe(100);
    expect(toNumber(null)).toBe(0);
  });

  it('validates numeric types and signs', () => {
    expect(checkIsNumber(42)).toBe(true);
    expect(checkIsNumber('abc')).toBe(false);
    expect(isValidNumber(10)).toBe(true);
    expect(isPositiveNumber(5)).toBe(true);
    expect(isPositiveNumber(-5)).toBe(false);
    expect(isNegativeNumber(-3)).toBe(true);
    expect(isNegativeNumber(3)).toBe(false);
  });

  it('validates and parses JSON strings', () => {
    expect(isValidJSON('{"a":1}')).toBe(true);
    expect(isValidJSON('invalid json')).toBe(false);
    expect(parseJSON('{"key":"value"}')).toEqual({ isJSON: true, data: { key: 'value' } });
    expect(parseJSON('broken').isJSON).toBe(false);
  });

  it('formats text and generates abbreviations', () => {
    expect(trimText(' hello world ')).toBe('hello_world');
    expect(createAbbreviation('Enterprise Resource Planning')).toBe('ERP');
    expect(randomString(8).length).toBe(8);
  });
});
