import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validateBody, validateRequest } from '../../src/middleware/zodValidator';
import type { Request, Response, NextFunction } from 'express';

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

const userSchema = z.object({
  username: z.string().min(3),
  age: z.number().positive(),
});

describe('ZodValidator Middleware', () => {
  it('validateBody returns parsed data when input is valid', () => {
    const res = mockResponse();
    const data = { username: 'john', age: 25 };
    const result = validateBody(userSchema, data, res);

    expect(result).toEqual(data);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('validateBody responds with 400 when input is invalid', () => {
    const res = mockResponse();
    const invalidData = { username: 'j', age: -5 };
    const result = validateBody(userSchema, invalidData, res);

    expect(result).toBeNull();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid input data',
      })
    );
  });

  it('validateRequest calls next() when request body is valid', () => {
    const middleware = validateRequest(userSchema);
    const req = { body: { username: 'alice', age: 30 } } as Request;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('validateRequest returns 400 when request body fails validation', () => {
    const middleware = validateRequest(userSchema);
    const req = { body: { username: '' } } as Request;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation error',
      })
    );
  });
});
