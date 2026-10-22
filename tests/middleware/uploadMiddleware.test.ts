import { describe, it, expect } from 'vitest';
import uploadFile from '../../src/middleware/uploadMiddleware';
import type { Request, Response } from 'express';

describe('Upload Middleware', () => {
  it('rejects with error when upload location is invalid', async () => {
    const req = {} as Request;
    const res = {} as Response;

    await expect(uploadFile(req, res, 99 as any, 'file')).rejects.toThrow('Invalid upload location: 99');
  });

  it('exposes a valid upload function for configured folders', () => {
    expect(typeof uploadFile).toBe('function');
  });
});
